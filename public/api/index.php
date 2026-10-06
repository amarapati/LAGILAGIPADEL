<?php
/**
 * LagiLagiPadel - REST API Router for Shared Hosting (public_html/api)
 * Connects to MySQL database: u372224362_llp
 */

require_once __DIR__ . '/db.php';
ensureTablesExist($pdo);

// Parse request path
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = preg_replace('#^.*?/api/?#i', '', $uri);
$segments = array_values(array_filter(explode('/', trim($path, '/'))));
$method = $_SERVER['REQUEST_METHOD'];

// Get raw JSON payload
$rawBody = file_get_contents('php://input');
$body = json_decode($rawBody, true) ?: [];

// Helper to send JSON response
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// ----------------- ROUTING ----------------- //

$root = $segments[0] ?? '';

// 1. Health
if ($root === 'health') {
    jsonResponse([
        'status' => 'ok',
        'service' => 'LagiLagiPadel PHP MySQL API',
        'database' => 'u372224362_llp',
        'timestamp' => date('c')
    ]);
}

// 2. System Sync Summary
if ($root === 'sync' && ($segments[1] ?? '') === 'summary') {
    $tCount = (int)$pdo->query("SELECT COUNT(*) FROM `tournaments`")->fetchColumn();
    $mCount = (int)$pdo->query("SELECT COUNT(*) FROM `members`")->fetchColumn();
    $lastSync = $pdo->query("SELECT `value` FROM `system_meta` WHERE `key` = 'last_sync'")->fetchColumn() ?: date('c');

    jsonResponse([
        'online' => true,
        'lastSyncTime' => $lastSync,
        'tournamentsCount' => $tCount,
        'membersCount' => $mCount
    ]);
}

// 3. Tournaments API
if ($root === 'tournaments') {
    $tourneyId = $segments[1] ?? null;
    $subAction = $segments[2] ?? null;

    // PATCH /api/tournaments/{id}/status
    if ($tourneyId && $subAction === 'status' && $method === 'PATCH') {
        $newStatus = $body['status'] ?? 'Akan Datang';
        $stmt = $pdo->prepare("SELECT `data` FROM `tournaments` WHERE `id` = :id");
        $stmt->execute([':id' => $tourneyId]);
        $row = $stmt->fetch();
        if (!$row) jsonResponse(['error' => 'Turnamen tidak ditemukan'], 404);

        $tourney = json_decode($row['data'], true);
        $tourney['status'] = $newStatus;
        $now = date('c');

        $upStmt = $pdo->prepare("UPDATE `tournaments` SET `status` = :status, `data` = :data, `updated_at` = :updated_at WHERE `id` = :id");
        $upStmt->execute([
            ':status' => $newStatus,
            ':data' => json_encode($tourney, JSON_UNESCAPED_UNICODE),
            ':updated_at' => $now,
            ':id' => $tourneyId
        ]);
        jsonResponse($tourney);
    }

    // GET /api/tournaments/{id}
    if ($tourneyId && $method === 'GET') {
        $stmt = $pdo->prepare("SELECT `data` FROM `tournaments` WHERE `id` = :id");
        $stmt->execute([':id' => $tourneyId]);
        $row = $stmt->fetch();
        if (!$row) jsonResponse(['error' => 'Turnamen tidak ditemukan'], 404);
        jsonResponse(json_decode($row['data'], true));
    }

    // DELETE /api/tournaments/{id}
    if ($tourneyId && $method === 'DELETE') {
        $del = $pdo->prepare("DELETE FROM `tournaments` WHERE `id` = :id");
        $del->execute([':id' => $tourneyId]);
        $pdo->prepare("DELETE FROM `tournament_groups` WHERE `tournament_id` = :id")->execute([':id' => $tourneyId]);
        $pdo->prepare("DELETE FROM `brackets` WHERE `tournament_id` = :id")->execute([':id' => $tourneyId]);
        jsonResponse(['success' => true, 'id' => $tourneyId]);
    }

    // GET /api/tournaments
    if (!$tourneyId && $method === 'GET') {
        $stmt = $pdo->query("SELECT `data` FROM `tournaments` ORDER BY `updated_at` DESC");
        $rows = $stmt->fetchAll();
        $list = array_map(function($r) {
            return json_decode($r['data'], true);
        }, $rows);
        jsonResponse($list);
    }

    // POST /api/tournaments
    if ($method === 'POST') {
        $tourney = $body;
        if (empty($tourney['id'])) {
            $tourney['id'] = 'tourney-' . time();
        }
        $now = date('c');

        // Check existing to merge partial fields
        $check = $pdo->prepare("SELECT `data` FROM `tournaments` WHERE `id` = :id");
        $check->execute([':id' => $tourney['id']]);
        $existingRow = $check->fetch();
        if ($existingRow) {
            $existing = json_decode($existingRow['data'], true);
            $tourney = array_merge($existing, $tourney);
        }

        $ins = $pdo->prepare("
            REPLACE INTO `tournaments` (`id`, `name`, `status`, `category`, `date`, `location`, `total_prize`, `data`, `updated_at`)
            VALUES (:id, :name, :status, :category, :date, :location, :total_prize, :data, :updated_at)
        ");
        $categories = isset($tourney['categories']) && is_array($tourney['categories']) ? implode(', ', $tourney['categories']) : ($tourney['category'] ?? '');
        $ins->execute([
            ':id' => $tourney['id'],
            ':name' => $tourney['name'] ?? 'Turnamen Padel',
            ':status' => $tourney['status'] ?? 'Akan Datang',
            ':category' => $categories,
            ':date' => $tourney['date'] ?? date('Y-m-d'),
            ':location' => $tourney['location'] ?? 'All In Padel',
            ':total_prize' => $tourney['prizePool'] ?? ($tourney['total_prize'] ?? ''),
            ':data' => json_encode($tourney, JSON_UNESCAPED_UNICODE),
            ':updated_at' => $now
        ]);

        // Auto save bracket & groups if present
        if (!empty($tourney['knockoutBracket'])) {
            $bStmt = $pdo->prepare("REPLACE INTO `brackets` (`tournament_id`, `bracket_json`, `updated_at`) VALUES (:tid, :bjson, :now)");
            $bStmt->execute([
                ':tid' => $tourney['id'],
                ':bjson' => json_encode($tourney['knockoutBracket'], JSON_UNESCAPED_UNICODE),
                ':now' => $now
            ]);
        }

        jsonResponse($tourney);
    }
}

// 4. Members API
if ($root === 'members') {
    $memberId = $segments[1] ?? null;

    if ($memberId && $method === 'DELETE') {
        $del = $pdo->prepare("DELETE FROM `members` WHERE `id` = :id");
        $del->execute([':id' => $memberId]);
        jsonResponse(['success' => true, 'id' => $memberId]);
    }

    if (!$memberId && $method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM `members` ORDER BY `id` ASC");
        $rows = $stmt->fetchAll();
        $members = array_map(function($r) {
            return [
                'id' => $r['id'],
                'name' => $r['name'],
                'nickname' => $r['nickname'] ?? '',
                'photoUrl' => $r['photo_url'] ?? '',
                'phone' => $r['phone'] ?? '',
                'email' => $r['email'] ?? '',
                'city' => $r['city'] ?? '',
                'gender' => $r['gender'] ?? 'Laki-laki',
                'joinedDate' => $r['joined_date'] ?? date('Y-m-d'),
                'status' => $r['status'] ?? 'Aktif',
                'isGroupQualified' => (bool)$r['is_group_qualified'],
                'qualifiedTournament' => $r['qualified_tournament'] ?? '',
                'qualifiedPool' => $r['qualified_pool'] ?? '',
                'qualifiedPhase' => $r['qualified_phase'] ?? '',
                'achievements' => !empty($r['achievements']) ? (json_decode($r['achievements'], true) ?: [$r['achievements']]) : []
            ];
        }, $rows);
        jsonResponse($members);
    }

    if ($method === 'POST') {
        $m = $body;
        if (empty($m['id'])) {
            $m['id'] = 'LLP-MBR-' . sprintf('%03d', rand(100, 999));
        }
        $now = date('c');
        $achievementsJson = isset($m['achievements']) && is_array($m['achievements'])
            ? json_encode($m['achievements'], JSON_UNESCAPED_UNICODE)
            : ($m['achievements'] ?? '[]');

        $stmt = $pdo->prepare("
            REPLACE INTO `members` (
                `id`, `name`, `nickname`, `photo_url`, `phone`, `email`, `city`,
                `gender`, `joined_date`, `status`, `is_group_qualified`,
                `qualified_tournament`, `qualified_pool`, `qualified_phase`, `achievements`, `updated_at`
            ) VALUES (
                :id, :name, :nickname, :photo_url, :phone, :email, :city,
                :gender, :joined_date, :status, :is_group_qualified,
                :qualified_tournament, :qualified_pool, :qualified_phase, :achievements, :updated_at
            )
        ");
        $stmt->execute([
            ':id' => $m['id'],
            ':name' => $m['name'] ?? '',
            ':nickname' => $m['nickname'] ?? '',
            ':photo_url' => $m['photoUrl'] ?? ($m['photo_url'] ?? ''),
            ':phone' => $m['phone'] ?? '',
            ':email' => $m['email'] ?? '',
            ':city' => $m['city'] ?? '',
            ':gender' => $m['gender'] ?? 'Laki-laki',
            ':joined_date' => $m['joinedDate'] ?? ($m['joined_date'] ?? date('Y-m-d')),
            ':status' => $m['status'] ?? 'Aktif',
            ':is_group_qualified' => !empty($m['isGroupQualified']) ? 1 : 0,
            ':qualified_tournament' => $m['qualifiedTournament'] ?? '',
            ':qualified_pool' => $m['qualifiedPool'] ?? '',
            ':qualified_phase' => $m['qualifiedPhase'] ?? '',
            ':achievements' => $achievementsJson,
            ':updated_at' => $now
        ]);
        jsonResponse($m);
    }
}

// 5. Groups API
if ($root === 'groups') {
    $tournamentId = $segments[1] ?? '';
    $action = $segments[2] ?? '';

    if ($action === 'assign-member' && $method === 'POST') {
        $targetPool = $body['targetPool'] ?? '';
        $m1Id = $body['member1Id'] ?? '';
        $m2Id = $body['member2Id'] ?? null;
        $customTeamName = $body['customTeamName'] ?? '';
        $seed = $body['seed'] ?? null;

        // Fetch current groups
        $stmt = $pdo->prepare("SELECT `pools_json` FROM `tournament_groups` WHERE `tournament_id` = :id");
        $stmt->execute([':id' => $tournamentId]);
        $row = $stmt->fetch();
        $pools = $row ? json_decode($row['pools_json'], true) : [];

        // Fetch member 1 details
        $m1Stmt = $pdo->prepare("SELECT * FROM `members` WHERE `id` = :id");
        $m1Stmt->execute([':id' => $m1Id]);
        $m1 = $m1Stmt->fetch();
        $p1Name = $m1 ? $m1['name'] : 'Pemain 1';

        $p2Name = 'Partner';
        if ($m2Id) {
            $m2Stmt = $pdo->prepare("SELECT * FROM `members` WHERE `id` = :id");
            $m2Stmt->execute([':id' => $m2Id]);
            $m2 = $m2Stmt->fetch();
            if ($m2) $p2Name = $m2['name'];
        }

        $teamName = !empty($customTeamName) ? $customTeamName : ($p1Name . ' & ' . $p2Name);

        // Find or create pool
        $found = false;
        foreach ($pools as &$pool) {
            if (strcasecmp($pool['poolName'], $targetPool) === 0) {
                $pool['teams'][] = [
                    'id' => 'team-' . time() . '-' . rand(10, 99),
                    'name' => $teamName,
                    'player1' => $p1Name,
                    'player2' => $p2Name,
                    'player1Id' => $m1Id,
                    'player2Id' => $m2Id,
                    'pool' => $targetPool,
                    'seed' => $seed,
                    'matchesPlayed' => 0,
                    'won' => 0,
                    'lost' => 0,
                    'points' => 0,
                    'gamesWon' => 0,
                    'gamesLost' => 0,
                    'gameDiff' => 0
                ];
                $found = true;
                break;
            }
        }
        if (!$found) {
            $pools[] = [
                'poolName' => $targetPool,
                'teams' => [
                    [
                        'id' => 'team-' . time() . '-' . rand(10, 99),
                        'name' => $teamName,
                        'player1' => $p1Name,
                        'player2' => $p2Name,
                        'player1Id' => $m1Id,
                        'player2Id' => $m2Id,
                        'pool' => $targetPool,
                        'seed' => $seed,
                        'matchesPlayed' => 0,
                        'won' => 0,
                        'lost' => 0,
                        'points' => 0,
                        'gamesWon' => 0,
                        'gamesLost' => 0,
                        'gameDiff' => 0
                    ]
                ]
            ];
        }

        $now = date('c');
        $saveStmt = $pdo->prepare("REPLACE INTO `tournament_groups` (`tournament_id`, `pools_json`, `updated_at`) VALUES (:id, :pjson, :now)");
        $saveStmt->execute([':id' => $tournamentId, ':pjson' => json_encode($pools, JSON_UNESCAPED_UNICODE), ':now' => $now]);
        jsonResponse(['success' => true, 'pools' => $pools]);
    }

    if ($action === 'remove-team' && $method === 'POST') {
        $teamId = $body['teamId'] ?? '';
        $stmt = $pdo->prepare("SELECT `pools_json` FROM `tournament_groups` WHERE `tournament_id` = :id");
        $stmt->execute([':id' => $tournamentId]);
        $row = $stmt->fetch();
        $pools = $row ? json_decode($row['pools_json'], true) : [];

        foreach ($pools as &$pool) {
            $pool['teams'] = array_values(array_filter($pool['teams'], function($t) use ($teamId) {
                return $t['id'] !== $teamId;
            }));
        }

        $now = date('c');
        $pdo->prepare("REPLACE INTO `tournament_groups` (`tournament_id`, `pools_json`, `updated_at`) VALUES (:id, :pjson, :now)")
            ->execute([':id' => $tournamentId, ':pjson' => json_encode($pools, JSON_UNESCAPED_UNICODE), ':now' => $now]);
        jsonResponse(['success' => true, 'pools' => $pools]);
    }

    if ($method === 'GET') {
        $stmt = $pdo->prepare("SELECT `pools_json` FROM `tournament_groups` WHERE `tournament_id` = :id");
        $stmt->execute([':id' => $tournamentId]);
        $row = $stmt->fetch();
        if ($row) {
            jsonResponse(json_decode($row['pools_json'], true));
        } else {
            // Default 4 pools
            jsonResponse([
                ['poolName' => 'Pool A', 'teams' => []],
                ['poolName' => 'Pool B', 'teams' => []],
                ['poolName' => 'Pool C', 'teams' => []],
                ['poolName' => 'Pool D', 'teams' => []],
            ]);
        }
    }

    if ($method === 'POST') {
        $pools = isset($body['pools']) ? $body['pools'] : $body;
        $now = date('c');
        $save = $pdo->prepare("REPLACE INTO `tournament_groups` (`tournament_id`, `pools_json`, `updated_at`) VALUES (:id, :pjson, :now)");
        $save->execute([
            ':id' => $tournamentId,
            ':pjson' => json_encode($pools, JSON_UNESCAPED_UNICODE),
            ':now' => $now
        ]);
        jsonResponse($pools);
    }
}

// 6. Brackets API
if ($root === 'brackets') {
    $tournamentId = $segments[1] ?? '';

    if ($method === 'GET') {
        $stmt = $pdo->prepare("SELECT `bracket_json` FROM `brackets` WHERE `tournament_id` = :id");
        $stmt->execute([':id' => $tournamentId]);
        $row = $stmt->fetch();
        if ($row) {
            jsonResponse(json_decode($row['bracket_json'], true));
        } else {
            jsonResponse([
                'quarters' => [],
                'semis' => [],
                'grandFinal' => [
                    'id' => 'gf-1',
                    'roundTitle' => 'Grand Final (Gold Match)',
                    'court' => 'Court 1',
                    'time' => '16:30 WIB',
                    'team1' => ['name' => 'Juara Pool A', 'players' => 'TBD', 'score' => '-', 'isWinner' => false],
                    'team2' => ['name' => 'Juara Pool B', 'players' => 'TBD', 'score' => '-', 'isWinner' => false],
                    'status' => 'Dijadwalkan'
                ]
            ]);
        }
    }

    if ($method === 'POST') {
        $bracket = isset($body['bracket']) ? $body['bracket'] : $body;
        $now = date('c');
        $save = $pdo->prepare("REPLACE INTO `brackets` (`tournament_id`, `bracket_json`, `updated_at`) VALUES (:id, :bjson, :now)");
        $save->execute([
            ':id' => $tournamentId,
            ':bjson' => json_encode($bracket, JSON_UNESCAPED_UNICODE),
            ':now' => $now
        ]);
        jsonResponse($bracket);
    }
}

// 7. Referee Live Scoring State
if ($root === 'referee' && ($segments[1] ?? '') === 'state') {
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT `state_json` FROM `referee_state` WHERE `id` = 'current_state'");
        $row = $stmt->fetch();
        if ($row) {
            jsonResponse(json_decode($row['state_json'], true));
        } else {
            jsonResponse([
                'matchId' => '',
                'tournamentId' => '',
                'court' => 'Court 1',
                'team1Score' => '0',
                'team2Score' => '0',
                'status' => 'Dijadwalkan'
            ]);
        }
    }

    if ($method === 'POST') {
        $state = $body;
        $now = date('c');
        $stmt = $pdo->prepare("REPLACE INTO `referee_state` (`id`, `state_json`, `updated_at`) VALUES ('current_state', :sjson, :now)");
        $stmt->execute([
            ':sjson' => json_encode($state, JSON_UNESCAPED_UNICODE),
            ':now' => $now
        ]);
        jsonResponse($state);
    }
}

// 8. Auth API (Login Verification & Accounts Management with SHA-256)
if ($root === 'auth') {
    $sub = $segments[1] ?? '';

    // POST /api/auth/login
    if ($sub === 'login' && $method === 'POST') {
        $userIn = trim($body['username'] ?? '');
        $passIn = trim($body['password'] ?? '');

        if (!$userIn || !$passIn) {
            jsonResponse(['error' => 'Username dan kata sandi wajib diisi.'], 400);
        }

        $hashedInput = hash('sha256', $passIn);

        $stmt = $pdo->prepare("SELECT `username`, `password`, `account_type`, `name` FROM `accounts` WHERE LOWER(`username`) = LOWER(:u)");
        $stmt->execute([':u' => $userIn]);
        $acc = $stmt->fetch();

        if (!$acc) {
            jsonResponse(['error' => 'Akun dengan username "' . htmlspecialchars($userIn) . '" tidak terdaftar di database.'], 401);
        }

        if ($acc['password'] !== $hashedInput) {
            jsonResponse(['error' => 'Kata sandi / PIN yang Anda masukkan salah.'], 401);
        }

        jsonResponse([
            'success' => true,
            'user' => [
                'username' => $acc['username'],
                'account_type' => $acc['account_type'],
                'name' => $acc['name'] ?: ($acc['account_type'] === 'admin' ? 'Super Admin Turnamen' : 'Wasit Utama FIP'),
                'role' => $acc['account_type'] === 'admin' ? 'Super Admin / Panitia Pusat' : 'Wasit Pertandingan'
            ]
        ]);
    }

    // GET /api/auth/accounts
    if ($sub === 'accounts' && $method === 'GET') {
        $stmt = $pdo->query("SELECT `username`, `account_type`, `name`, `created_at` FROM `accounts` ORDER BY `created_at` ASC");
        $rows = $stmt->fetchAll();
        jsonResponse($rows);
    }

    // POST /api/auth/accounts
    if ($sub === 'accounts' && $method === 'POST') {
        $u = trim($body['username'] ?? '');
        $rawPass = trim($body['password'] ?? '');
        $type = in_array(strtolower($body['account_type'] ?? ''), ['admin', 'wasit']) ? strtolower($body['account_type']) : 'wasit';
        $name = trim($body['name'] ?? '');

        if (!$u) {
            jsonResponse(['error' => 'Username tidak boleh kosong.'], 400);
        }

        $chk = $pdo->prepare("SELECT `password` FROM `accounts` WHERE LOWER(`username`) = LOWER(:u)");
        $chk->execute([':u' => $u]);
        $existing = $chk->fetch();

        if ($existing) {
            $hash = !empty($rawPass) ? hash('sha256', $rawPass) : $existing['password'];
            $up = $pdo->prepare("UPDATE `accounts` SET `password` = :p, `account_type` = :t, `name` = :n WHERE LOWER(`username`) = LOWER(:u)");
            $up->execute([':p' => $hash, ':t' => $type, ':n' => $name, ':u' => $u]);
        } else {
            if (empty($rawPass)) {
                jsonResponse(['error' => 'Kata sandi wajib diisi untuk akun baru.'], 400);
            }
            $hash = hash('sha256', $rawPass);
            $now = date('c');
            $ins = $pdo->prepare("INSERT INTO `accounts` (`username`, `password`, `account_type`, `name`, `created_at`) VALUES (:u, :p, :t, :n, :c)");
            $ins->execute([':u' => $u, ':p' => $hash, ':t' => $type, ':n' => $name, ':c' => $now]);
        }

        jsonResponse(['success' => true, 'username' => $u, 'account_type' => $type, 'name' => $name]);
    }

    // DELETE /api/auth/accounts/{username}
    $targetUsername = $segments[2] ?? null;
    if ($sub === 'accounts' && $targetUsername && $method === 'DELETE') {
        $del = $pdo->prepare("DELETE FROM `accounts` WHERE LOWER(`username`) = LOWER(:u)");
        $del->execute([':u' => $targetUsername]);
        jsonResponse(['success' => true, 'username' => $targetUsername]);
    }
}

// 7. Tournament Banner Upload Endpoint
if ($root === 'upload' && ($segments[1] ?? '') === 'banner' && $method === 'POST') {
    $fileData = $body['fileData'] ?? '';
    $fileName = $body['fileName'] ?? '';

    if (empty($fileData)) {
        jsonResponse(['error' => 'Data gambar tidak valid atau kosong.'], 400);
    }

    $mimeType = 'image/jpeg';
    $rawBase64 = $fileData;
    if (preg_match('#^data:(image/[a-zA-Z0-9\-\+\.]+);base64,(.+)$#i', $fileData, $matches)) {
        $mimeType = $matches[1];
        $rawBase64 = $matches[2];
    }

    $decoded = base64_decode($rawBase64);
    if ($decoded === false || strlen($decoded) === 0) {
        jsonResponse(['error' => 'Buffer gambar kosong atau tidak dapat di-decode.'], 400);
    }

    // Generate random MD5 VARCHAR filename
    $md5Hash = md5($decoded . random_bytes(16));
    $ext = 'jpg';
    if (strpos($mimeType, 'png') !== false) $ext = 'png';
    else if (strpos($mimeType, 'webp') !== false) $ext = 'webp';
    else if (strpos($mimeType, 'gif') !== false) $ext = 'gif';
    else if (!empty($fileName)) {
        $cleanExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        if (in_array($cleanExt, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
            $ext = $cleanExt === 'jpeg' ? 'jpg' : $cleanExt;
        }
    }

    $generatedFileName = $md5Hash . '.' . $ext;
    $targetDir = dirname(__DIR__) . '/uploads/banner';
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
    }

    $targetFilePath = $targetDir . '/' . $generatedFileName;
    file_put_contents($targetFilePath, $decoded);

    jsonResponse([
        'success' => true,
        'url' => '/uploads/banner/' . $generatedFileName,
        'path' => 'uploads/banner/' . $generatedFileName,
        'fileName' => $generatedFileName,
        'size' => strlen($decoded)
    ]);
}

// 404 Fallback
jsonResponse(['error' => 'Endpoint API tidak ditemukan: ' . $uri], 404);
