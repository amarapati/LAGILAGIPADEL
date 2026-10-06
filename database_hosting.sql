-- ============================================================
-- LagiLagiPadel Tournament Manager - MySQL Database Dump
-- Generated for Direct Import on cPanel / Hostinger phpMyAdmin
-- Character Set: utf8mb4 / Engine: InnoDB
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Table structure for table `tournaments`
DROP TABLE IF EXISTS `tournaments`;
CREATE TABLE `tournaments` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `status` VARCHAR(64) NOT NULL,
  `category` VARCHAR(255) DEFAULT NULL,
  `date` VARCHAR(64) DEFAULT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `total_prize` VARCHAR(255) DEFAULT NULL,
  `banner_url` VARCHAR(255) DEFAULT NULL,
  `data` LONGTEXT NOT NULL,
  `updated_at` VARCHAR(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `members`
DROP TABLE IF EXISTS `members`;
CREATE TABLE `members` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `nickname` VARCHAR(255) DEFAULT NULL,
  `photo_url` TEXT DEFAULT NULL,
  `phone` VARCHAR(64) DEFAULT NULL,
  `email` VARCHAR(191) DEFAULT NULL,
  `city` VARCHAR(255) DEFAULT NULL,
  `gender` VARCHAR(64) DEFAULT NULL,
  `joined_date` VARCHAR(64) DEFAULT NULL,
  `status` VARCHAR(64) DEFAULT NULL,
  `is_group_qualified` INT DEFAULT 0,
  `qualified_tournament` VARCHAR(255) DEFAULT NULL,
  `qualified_pool` VARCHAR(64) DEFAULT NULL,
  `qualified_phase` VARCHAR(64) DEFAULT NULL,
  `achievements` TEXT DEFAULT NULL,
  `updated_at` VARCHAR(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `tournament_groups`
DROP TABLE IF EXISTS `tournament_groups`;
CREATE TABLE `tournament_groups` (
  `tournament_id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `pools_json` LONGTEXT NOT NULL,
  `updated_at` VARCHAR(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `brackets`
DROP TABLE IF EXISTS `brackets`;
CREATE TABLE `brackets` (
  `tournament_id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `bracket_json` LONGTEXT NOT NULL,
  `updated_at` VARCHAR(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `referee_state`
DROP TABLE IF EXISTS `referee_state`;
CREATE TABLE `referee_state` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `state_json` LONGTEXT NOT NULL,
  `updated_at` VARCHAR(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `system_meta`
DROP TABLE IF EXISTS `system_meta`;
CREATE TABLE `system_meta` (
  `key` VARCHAR(191) NOT NULL PRIMARY KEY,
  `value` LONGTEXT,
  `updated_at` VARCHAR(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `accounts`
DROP TABLE IF EXISTS `accounts`;
CREATE TABLE `accounts` (
  `username` VARCHAR(64) NOT NULL PRIMARY KEY,
  `password` VARCHAR(64) NOT NULL,
  `account_type` VARCHAR(32) NOT NULL,
  `name` VARCHAR(255) DEFAULT NULL,
  `created_at` VARCHAR(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `tournaments`
INSERT INTO `tournaments` (`id`, `name`, `status`, `category`, `date`, `location`, `total_prize`, `data`, `updated_at`) VALUES ('tourney-963062', 'PLN Tour Padel', 'Live', 'Rookie Men', '2026-09-29', 'Sanum Padel Solo (4 Courts)', 'Rp 20.000.000 + Trofi & Medali', '{"id":"tourney-963062","name":"PLN Tour Padel","organizer":"LagiLagi Padel Solo","location":"Sanum Padel Solo (4 Courts)","date":"2026-09-29","status":"Live","categories":["Rookie Men","Rookie Women","Mixed Doubles"],"totalCourts":5,"totalTeams":8,"prizePool":"Rp 20.000.000 + Trofi & Medali","rules":"Race to 4 Games · Golden Point Active · Auto Knockout Draw","description":"Kejuaraan padel komunitas resmi LagiLagiPadel dengan live scoring wasit dan bagan knockout terintegrasi.","winners":{"notes":"Turnamen PLN Tour Padel belum mencatatkan pemenang akhir.","podium":[]},"participants":[{"seed":6,"teamName":"sewelas & rolas","p1":"sewelas","p2":"rolas","category":"Rookie Men","club":"LagiLagi Padel Jakarta","city":"Solo / Jakarta","pool":"Pool A","rating":"3.0","status":"Confirmed"},{"seed":2,"teamName":"telu & papat","p1":"telu","p2":"papat","category":"Rookie Men","club":"LagiLagi Padel Jakarta","city":"Solo / Jakarta","pool":"Pool A","rating":"3.0","status":"Confirmed"},{"seed":5,"teamName":"songo & sepuluh","p1":"songo","p2":"sepuluh","category":"Rookie Men","club":"LagiLagi Padel Jakarta","city":"Solo / Jakarta","pool":"Pool A","rating":"3.0","status":"Confirmed"},{"seed":3,"teamName":"limo & enem","p1":"limo","p2":"enem","category":"Rookie Men","club":"LagiLagi Padel Jakarta","city":"Solo / Jakarta","pool":"Pool A","rating":"3.0","status":"Confirmed"},{"seed":7,"teamName":"telulas & patbelas","p1":"telulas","p2":"patbelas","category":"Rookie Men","club":"LagiLagi Padel Jakarta","city":"Solo / Jakarta","pool":"Pool B","rating":"3.0","status":"Confirmed"},{"seed":4,"teamName":"pitu & wolu","p1":"pitu","p2":"wolu","category":"Rookie Men","club":"LagiLagi Padel Jakarta","city":"Solo / Jakarta","pool":"Pool B","rating":"3.0","status":"Confirmed"},{"seed":1,"teamName":"siji & loro","p1":"siji","p2":"loro","category":"Rookie Men","club":"LagiLagi Padel Jakarta","city":"Solo / Jakarta","pool":"Pool B","rating":"3.0","status":"Confirmed"},{"seed":8,"teamName":"limolas & nembelas","p1":"limolas","p2":"nembelas","category":"Rookie Men","club":"LagiLagi Padel Jakarta","city":"Solo / Jakarta","pool":"Pool B","rating":"3.0","status":"Confirmed"}],"matches":[],"knockoutBracket":{"quarters":[],"semis":[{"id":"sf-1","roundTitle":"Semifinal 1 (Juara Pool A vs Runner-up Pool B)","court":"Court 1","time":"14:00 WIB","team1":{"name":"Juara Pool A","players":"TBD","score":"-","isWinner":false},"team2":{"name":"Runner-up Pool B","players":"TBD","score":"-","isWinner":false},"status":"Dijadwalkan"},{"id":"sf-2","roundTitle":"Semifinal 2 (Juara Pool B vs Runner-up Pool A)","court":"Court 2","time":"14:00 WIB","team1":{"name":"Juara Pool B","players":"TBD","score":"-","isWinner":false},"team2":{"name":"Runner-up Pool A","players":"TBD","score":"-","isWinner":false},"status":"Dijadwalkan"}],"grandFinal":{"id":"gf-1","roundTitle":"Grand Final (Gold Match)","court":"Court 1","time":"16:30 WIB","team1":{"name":"Pemenang SF 1","players":"TBD","score":"-","isWinner":false},"team2":{"name":"Pemenang SF 2","players":"TBD","score":"-","isWinner":false},"status":"Dijadwalkan"},"bronzeMatch":{"id":"bm-1","roundTitle":"Perebutan Juara 3 (Bronze Match)","court":"Court 2","time":"15:15 WIB","team1":{"name":"Semifinalis 1","players":"TBD","score":"-","isWinner":false},"team2":{"name":"Semifinalis 2","players":"TBD","score":"-","isWinner":false},"status":"Dijadwalkan"}},"groupStandings":{"pools":["Semua Pool","Pool A","Pool B"],"standings":[{"id":"team-tourney-963062-4","pos":1,"name":"sewelas & rolas","p1":"sewelas","p2":"rolas","pool":"Pool A","played":0,"won":0,"lost":0,"gamesWon":0,"gamesLost":0,"gameDiff":0,"points":0,"isQualified":false},{"id":"team-tourney-963062-3","pos":2,"name":"telu & papat","p1":"telu","p2":"papat","pool":"Pool A","played":0,"won":0,"lost":0,"gamesWon":0,"gamesLost":0,"gameDiff":0,"points":0,"isQualified":false},{"id":"team-tourney-963062-2","pos":3,"name":"songo & sepuluh","p1":"songo","p2":"sepuluh","pool":"Pool A","played":0,"won":0,"lost":0,"gamesWon":0,"gamesLost":0,"gameDiff":0,"points":0,"isQualified":false},{"id":"team-tourney-963062-5","pos":4,"name":"limo & enem","p1":"limo","p2":"enem","pool":"Pool A","played":0,"won":0,"lost":0,"gamesWon":0,"gamesLost":0,"gameDiff":0,"points":0,"isQualified":false},{"id":"team-tourney-963062-6","pos":1,"name":"telulas & patbelas","p1":"telulas","p2":"patbelas","pool":"Pool B","played":0,"won":0,"lost":0,"gamesWon":0,"gamesLost":0,"gameDiff":0,"points":0,"isQualified":false},{"id":"team-tourney-963062-7","pos":2,"name":"pitu & wolu","p1":"pitu","p2":"wolu","pool":"Pool B","played":0,"won":0,"lost":0,"gamesWon":0,"gamesLost":0,"gameDiff":0,"points":0,"isQualified":false},{"id":"team-tourney-963062-1","pos":3,"name":"siji & loro","p1":"siji","p2":"loro","pool":"Pool B","played":0,"won":0,"lost":0,"gamesWon":0,"gamesLost":0,"gameDiff":0,"points":0,"isQualified":false},{"id":"team-tourney-963062-8","pos":4,"name":"limolas & nembelas","p1":"limolas","p2":"nembelas","pool":"Pool B","played":0,"won":0,"lost":0,"gamesWon":0,"gamesLost":0,"gameDiff":0,"points":0,"isQualified":false}]}}', '2026-10-01T17:06:29.039Z');

-- Dumping data for table `members`
INSERT INTO `members` (`id`, `name`, `nickname`, `photo_url`, `phone`, `email`, `city`, `gender`, `joined_date`, `status`, `is_group_qualified`, `qualified_tournament`, `qualified_pool`, `qualified_phase`, `achievements`, `updated_at`) VALUES ('LLP-MBR-001', 'siji', '', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80', '0812-', 'siji@padelpro.id', 'Jakarta Selatan', 'Laki-laki', '25 Sep 2026', 'Aktif', 0, 'PLN Tour Padel', 'Pool B', '', '{"gold":0,"silver":0,"bronze":0,"tournaments":["LagiLagi Padel Open"],"partnerDefault":"loro"}', '2026-09-28T20:34:40.435Z');
INSERT INTO `members` (`id`, `name`, `nickname`, `photo_url`, `phone`, `email`, `city`, `gender`, `joined_date`, `status`, `is_group_qualified`, `qualified_tournament`, `qualified_pool`, `qualified_phase`, `achievements`, `updated_at`) VALUES ('LLP-MBR-002', 'loro', '', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80', '0812-', 'loro@padelpro.id', 'Jakarta Selatan', 'Laki-laki', '25 Sep 2026', 'Aktif', 0, 'PLN Tour Padel', 'Pool B', '', '{"gold":0,"silver":0,"bronze":0,"tournaments":["LagiLagi Padel Open"],"partnerDefault":"siji"}', '2026-09-28T20:34:40.435Z');
INSERT INTO `members` (`id`, `name`, `nickname`, `photo_url`, `phone`, `email`, `city`, `gender`, `joined_date`, `status`, `is_group_qualified`, `qualified_tournament`, `qualified_pool`, `qualified_phase`, `achievements`, `updated_at`) VALUES ('LLP-MBR-003', 'telu', '', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80', '0812-', 'telu@padelpro.id', 'Jakarta Selatan', 'Laki-laki', '25 Sep 2026', 'Aktif', 0, 'PLN Tour Padel', 'Pool A', '', '{"gold":0,"silver":0,"bronze":0,"tournaments":["LagiLagi Padel Open"],"partnerDefault":"papat"}', '2026-09-28T20:34:40.435Z');
INSERT INTO `members` (`id`, `name`, `nickname`, `photo_url`, `phone`, `email`, `city`, `gender`, `joined_date`, `status`, `is_group_qualified`, `qualified_tournament`, `qualified_pool`, `qualified_phase`, `achievements`, `updated_at`) VALUES ('LLP-MBR-004', 'papat', '', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80', '0812-', 'papat@padelpro.id', 'Jakarta Selatan', 'Laki-laki', '25 Sep 2026', 'Aktif', 0, 'PLN Tour Padel', 'Pool A', '', '{"gold":0,"silver":0,"bronze":0,"tournaments":["LagiLagi Padel Open"],"partnerDefault":"telu"}', '2026-09-28T20:34:40.435Z');
INSERT INTO `members` (`id`, `name`, `nickname`, `photo_url`, `phone`, `email`, `city`, `gender`, `joined_date`, `status`, `is_group_qualified`, `qualified_tournament`, `qualified_pool`, `qualified_phase`, `achievements`, `updated_at`) VALUES ('LLP-MBR-005', 'limo', '', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80', '0812-', 'limo@padelpro.id', 'Jakarta Selatan', 'Laki-laki', '25 Sep 2026', 'Aktif', 0, 'PLN Tour Padel', 'Pool A', '', '{"gold":0,"silver":0,"bronze":0,"tournaments":["LagiLagi Padel Open"],"partnerDefault":"enem"}', '2026-09-28T20:34:40.435Z');
INSERT INTO `members` (`id`, `name`, `nickname`, `photo_url`, `phone`, `email`, `city`, `gender`, `joined_date`, `status`, `is_group_qualified`, `qualified_tournament`, `qualified_pool`, `qualified_phase`, `achievements`, `updated_at`) VALUES ('LLP-MBR-006', 'enem', '', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80', '0812-', 'enem@padelpro.id', 'Jakarta Selatan', 'Laki-laki', '25 Sep 2026', 'Aktif', 0, 'PLN Tour Padel', 'Pool A', '', '{"gold":0,"silver":0,"bronze":0,"tournaments":["LagiLagi Padel Open"],"partnerDefault":"limo"}', '2026-09-28T20:34:40.435Z');
INSERT INTO `members` (`id`, `name`, `nickname`, `photo_url`, `phone`, `email`, `city`, `gender`, `joined_date`, `status`, `is_group_qualified`, `qualified_tournament`, `qualified_pool`, `qualified_phase`, `achievements`, `updated_at`) VALUES ('LLP-MBR-007', 'pitu', '', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80', '0812-', 'pitu@padelpro.id', 'Jakarta Selatan', 'Laki-laki', '25 Sep 2026', 'Aktif', 0, 'PLN Tour Padel', 'Pool B', '', '{"gold":0,"silver":0,"bronze":0,"tournaments":["LagiLagi Padel Open"],"partnerDefault":"wolu"}', '2026-09-28T20:34:40.435Z');
INSERT INTO `members` (`id`, `name`, `nickname`, `photo_url`, `phone`, `email`, `city`, `gender`, `joined_date`, `status`, `is_group_qualified`, `qualified_tournament`, `qualified_pool`, `qualified_phase`, `achievements`, `updated_at`) VALUES ('LLP-MBR-008', 'wolu', '', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80', '0812-', 'wolu@padelpro.id', 'Jakarta Selatan', 'Laki-laki', '25 Sep 2026', 'Aktif', 0, 'PLN Tour Padel', 'Pool B', '', '{"gold":0,"silver":0,"bronze":0,"tournaments":["LagiLagi Padel Open"],"partnerDefault":"pitu"}', '2026-09-28T20:34:40.435Z');
INSERT INTO `members` (`id`, `name`, `nickname`, `photo_url`, `phone`, `email`, `city`, `gender`, `joined_date`, `status`, `is_group_qualified`, `qualified_tournament`, `qualified_pool`, `qualified_phase`, `achievements`, `updated_at`) VALUES ('LLP-MBR-009', 'songo', '', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80', '0812-', 'songo@padelpro.id', 'Jakarta Selatan', 'Laki-laki', '25 Sep 2026', 'Aktif', 0, 'PLN Tour Padel', 'Pool A', '', '{"gold":0,"silver":0,"bronze":0,"tournaments":["LagiLagi Padel Open"],"partnerDefault":"sepuluh"}', '2026-09-28T20:34:40.435Z');
INSERT INTO `members` (`id`, `name`, `nickname`, `photo_url`, `phone`, `email`, `city`, `gender`, `joined_date`, `status`, `is_group_qualified`, `qualified_tournament`, `qualified_pool`, `qualified_phase`, `achievements`, `updated_at`) VALUES ('LLP-MBR-010', 'sepuluh', '', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80', '0812-', 'sepuluh@padelpro.id', 'Jakarta Selatan', 'Laki-laki', '25 Sep 2026', 'Aktif', 0, 'PLN Tour Padel', 'Pool A', '', '{"gold":0,"silver":0,"bronze":0,"tournaments":["LagiLagi Padel Open"],"partnerDefault":"songo"}', '2026-09-28T20:34:40.435Z');
INSERT INTO `members` (`id`, `name`, `nickname`, `photo_url`, `phone`, `email`, `city`, `gender`, `joined_date`, `status`, `is_group_qualified`, `qualified_tournament`, `qualified_pool`, `qualified_phase`, `achievements`, `updated_at`) VALUES ('LLP-MBR-011', 'sewelas', '', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80', '0812-', 'sewelas@padelpro.id', 'Jakarta Selatan', 'Laki-laki', '25 Sep 2026', 'Aktif', 0, 'PLN Tour Padel', 'Pool A', '', '{"gold":0,"silver":0,"bronze":0,"tournaments":["LagiLagi Padel Open"],"partnerDefault":"rolas"}', '2026-09-28T20:34:40.435Z');
INSERT INTO `members` (`id`, `name`, `nickname`, `photo_url`, `phone`, `email`, `city`, `gender`, `joined_date`, `status`, `is_group_qualified`, `qualified_tournament`, `qualified_pool`, `qualified_phase`, `achievements`, `updated_at`) VALUES ('LLP-MBR-012', 'rolas', '', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', '0812-', 'rolas@padelpro.id', 'Jakarta Selatan', 'Laki-laki', '25 Sep 2026', 'Aktif', 0, 'PLN Tour Padel', 'Pool A', '', '{"gold":0,"silver":0,"bronze":0,"tournaments":["LagiLagi Padel Open"],"partnerDefault":"sewelas"}', '2026-09-28T20:34:40.435Z');
INSERT INTO `members` (`id`, `name`, `nickname`, `photo_url`, `phone`, `email`, `city`, `gender`, `joined_date`, `status`, `is_group_qualified`, `qualified_tournament`, `qualified_pool`, `qualified_phase`, `achievements`, `updated_at`) VALUES ('LLP-MBR-013', 'telulas', '', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80', '0812-', 'telulas@padelpro.id', 'Jakarta Selatan', 'Laki-laki', '25 Sep 2026', 'Aktif', 0, 'PLN Tour Padel', 'Pool B', '', '{"gold":0,"silver":0,"bronze":0,"tournaments":["LagiLagi Padel Open"],"partnerDefault":"patbelas"}', '2026-09-28T20:34:40.435Z');
INSERT INTO `members` (`id`, `name`, `nickname`, `photo_url`, `phone`, `email`, `city`, `gender`, `joined_date`, `status`, `is_group_qualified`, `qualified_tournament`, `qualified_pool`, `qualified_phase`, `achievements`, `updated_at`) VALUES ('LLP-MBR-014', 'patbelas', '', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80', '0812-', 'patbelas@padelpro.id', 'Jakarta Selatan', 'Laki-laki', '25 Sep 2026', 'Aktif', 0, 'PLN Tour Padel', 'Pool B', '', '{"gold":0,"silver":0,"bronze":0,"tournaments":["LagiLagi Padel Open"],"partnerDefault":"telulas"}', '2026-09-28T20:34:40.435Z');
INSERT INTO `members` (`id`, `name`, `nickname`, `photo_url`, `phone`, `email`, `city`, `gender`, `joined_date`, `status`, `is_group_qualified`, `qualified_tournament`, `qualified_pool`, `qualified_phase`, `achievements`, `updated_at`) VALUES ('LLP-MBR-015', 'limolas', '', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80', '0812-', 'limolas@padelpro.id', 'Jakarta Selatan', 'Laki-laki', '25 Sep 2026', 'Aktif', 0, 'PLN Tour Padel', 'Pool B', '', '{"gold":0,"silver":0,"bronze":0,"tournaments":["LagiLagi Padel Open"],"partnerDefault":"nembelas"}', '2026-09-28T20:34:40.435Z');
INSERT INTO `members` (`id`, `name`, `nickname`, `photo_url`, `phone`, `email`, `city`, `gender`, `joined_date`, `status`, `is_group_qualified`, `qualified_tournament`, `qualified_pool`, `qualified_phase`, `achievements`, `updated_at`) VALUES ('LLP-MBR-016', 'nembelas', '', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80', '0812-', 'nembelas@padelpro.id', 'Jakarta Selatan', 'Laki-laki', '25 Sep 2026', 'Aktif', 0, 'PLN Tour Padel', 'Pool B', '', '{"gold":0,"silver":0,"bronze":0,"tournaments":["LagiLagi Padel Open"],"partnerDefault":"limolas"}', '2026-09-28T20:34:40.435Z');

-- Dumping data for table `tournament_groups`
INSERT INTO `tournament_groups` (`tournament_id`, `pools_json`, `updated_at`) VALUES ('tourney-963062', '[{"poolName":"Pool A","teams":[{"id":"team-tourney-963062-4","name":"sewelas & rolas","p1":"sewelas","p2":"rolas","member1Id":"LLP-MBR-011","member2Id":"LLP-MBR-012","club":"LagiLagi Padel Jakarta","rating":"3.0","pool":"Pool A","seed":6,"isQualified":false,"p1Photo":"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80","p2Photo":"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"},{"id":"team-tourney-963062-3","name":"telu & papat","p1":"telu","p2":"papat","member1Id":"LLP-MBR-003","member2Id":"LLP-MBR-004","club":"LagiLagi Padel Jakarta","rating":"3.0","pool":"Pool A","seed":2,"isQualified":false,"p1Photo":"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80","p2Photo":"https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80"},{"id":"team-tourney-963062-2","name":"songo & sepuluh","p1":"songo","p2":"sepuluh","member1Id":"LLP-MBR-009","member2Id":"LLP-MBR-010","club":"LagiLagi Padel Jakarta","rating":"3.0","pool":"Pool A","seed":5,"isQualified":false,"p1Photo":"https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80","p2Photo":"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80"},{"id":"team-tourney-963062-5","name":"limo & enem","p1":"limo","p2":"enem","member1Id":"LLP-MBR-005","member2Id":"LLP-MBR-006","club":"LagiLagi Padel Jakarta","rating":"3.0","pool":"Pool A","seed":3,"isQualified":false,"p1Photo":"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80","p2Photo":"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80"}]},{"poolName":"Pool B","teams":[{"id":"team-tourney-963062-6","name":"telulas & patbelas","p1":"telulas","p2":"patbelas","member1Id":"LLP-MBR-013","member2Id":"LLP-MBR-014","club":"LagiLagi Padel Jakarta","rating":"3.0","pool":"Pool B","seed":7,"isQualified":false,"p1Photo":"https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80","p2Photo":"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80"},{"id":"team-tourney-963062-7","name":"pitu & wolu","p1":"pitu","p2":"wolu","member1Id":"LLP-MBR-007","member2Id":"LLP-MBR-008","club":"LagiLagi Padel Jakarta","rating":"3.0","pool":"Pool B","seed":4,"isQualified":false,"p1Photo":"https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80","p2Photo":"https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80"},{"id":"team-tourney-963062-1","name":"siji & loro","p1":"siji","p2":"loro","member1Id":"LLP-MBR-001","member2Id":"LLP-MBR-002","club":"LagiLagi Padel Jakarta","rating":"3.0","pool":"Pool B","seed":1,"isQualified":false,"p1Photo":"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80","p2Photo":"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80"},{"id":"team-tourney-963062-8","name":"limolas & nembelas","p1":"limolas","p2":"nembelas","member1Id":"LLP-MBR-015","member2Id":"LLP-MBR-016","club":"LagiLagi Padel Jakarta","rating":"3.0","pool":"Pool B","seed":8,"isQualified":false,"p1Photo":"https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80","p2Photo":"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80"}]}]', '2026-10-01T17:06:29.039Z');

-- Dumping data for table `brackets`
INSERT INTO `brackets` (`tournament_id`, `bracket_json`, `updated_at`) VALUES ('tourney-963062', '{"quarters":[],"semis":[{"id":"sf-1","roundTitle":"Semifinal 1 (Juara Pool A vs Runner-up Pool B)","court":"Court 1","time":"14:00 WIB","team1":{"name":"Juara Pool A","players":"TBD","score":"-","isWinner":false},"team2":{"name":"Runner-up Pool B","players":"TBD","score":"-","isWinner":false},"status":"Dijadwalkan"},{"id":"sf-2","roundTitle":"Semifinal 2 (Juara Pool B vs Runner-up Pool A)","court":"Court 2","time":"14:00 WIB","team1":{"name":"Juara Pool B","players":"TBD","score":"-","isWinner":false},"team2":{"name":"Runner-up Pool A","players":"TBD","score":"-","isWinner":false},"status":"Dijadwalkan"}],"grandFinal":{"id":"gf-1","roundTitle":"Grand Final (Gold Match)","court":"Court 1","time":"16:30 WIB","team1":{"name":"Pemenang SF 1","players":"TBD","score":"-","isWinner":false},"team2":{"name":"Pemenang SF 2","players":"TBD","score":"-","isWinner":false},"status":"Dijadwalkan"},"bronzeMatch":{"id":"bm-1","roundTitle":"Perebutan Juara 3 (Bronze Match)","court":"Court 2","time":"15:15 WIB","team1":{"name":"Semifinalis 1","players":"TBD","score":"-","isWinner":false},"team2":{"name":"Semifinalis 2","players":"TBD","score":"-","isWinner":false},"status":"Dijadwalkan"}}', '2026-10-01T17:06:29.039Z');

-- Dumping data for table `referee_state`
INSERT INTO `referee_state` (`id`, `state_json`, `updated_at`) VALUES ('current_state', '{"teamAName":"sewelas & rolas","teamBName":"songo & sepuluh","courtScoreA":0,"courtScoreB":0,"gamesTeamA":0,"gamesTeamB":0,"currentSetA":0,"currentSetB":0,"currentServer":"A","goldenPointActive":false,"scoreHistory":[],"officialRefereeNotes":"Pertandingan belum dimulai (Data skoring & hasil wasit dikosongkan).","activeCourt":2,"matchPhase":"Grand Final","selectedTourneyId":"tourney-963062","isCleared":true}', '2026-10-01T17:28:06.639Z');

-- Dumping data for table `system_meta`
INSERT INTO `system_meta` (`key`, `value`, `updated_at`) VALUES ('groups_rookie-mix', '2026-09-28T17:53:38.440Z', '2026-09-28T17:53:38.440Z');
INSERT INTO `system_meta` (`key`, `value`, `updated_at`) VALUES ('groups_beginner-showdown', '2026-09-28T17:55:59.631Z', '2026-09-28T17:55:59.631Z');
INSERT INTO `system_meta` (`key`, `value`, `updated_at`) VALUES ('bracket_rookie-mix', '2026-09-28T19:30:23.527Z', '2026-09-28T19:30:23.527Z');
INSERT INTO `system_meta` (`key`, `value`, `updated_at`) VALUES ('bracket_f3-rookie-men', '2026-09-28T19:30:35.180Z', '2026-09-28T19:30:35.180Z');
INSERT INTO `system_meta` (`key`, `value`, `updated_at`) VALUES ('bracket_hdmc-champions', '2026-09-28T19:30:39.877Z', '2026-09-28T19:30:39.877Z');
INSERT INTO `system_meta` (`key`, `value`, `updated_at`) VALUES ('bracket_beginner-showdown', '2026-09-28T19:30:43.422Z', '2026-09-28T19:30:43.422Z');
INSERT INTO `system_meta` (`key`, `value`, `updated_at`) VALUES ('groups_tourney-709340', '2026-09-28T19:31:27.458Z', '2026-09-28T19:31:27.458Z');
INSERT INTO `system_meta` (`key`, `value`, `updated_at`) VALUES ('bracket_tourney-709340', '2026-09-28T19:31:27.482Z', '2026-09-28T19:31:27.482Z');
INSERT INTO `system_meta` (`key`, `value`, `updated_at`) VALUES ('members_updated', '2026-09-28T19:39:38.578Z', '2026-09-28T19:39:38.578Z');
INSERT INTO `system_meta` (`key`, `value`, `updated_at`) VALUES ('bracket_tourney-963062', '2026-09-28T19:40:11.198Z', '2026-09-28T19:40:11.198Z');
INSERT INTO `system_meta` (`key`, `value`, `updated_at`) VALUES ('tournaments_updated', '2026-09-28T19:40:27.666Z', '2026-09-28T19:40:27.666Z');
INSERT INTO `system_meta` (`key`, `value`, `updated_at`) VALUES ('groups_tourney-963062', '2026-09-28T19:40:27.665Z', '2026-09-28T19:40:27.665Z');
INSERT INTO `system_meta` (`key`, `value`, `updated_at`) VALUES ('test_key', 'test_val', '2026-09-30T10:40:58.082Z');
INSERT INTO `system_meta` (`key`, `value`, `updated_at`) VALUES ('last_sync', '2026-10-01T17:06:29.039Z', '2026-10-01T17:06:29.039Z');
INSERT INTO `system_meta` (`key`, `value`, `updated_at`) VALUES ('referee_updated', '2026-10-01T17:28:06.639Z', '2026-10-01T17:28:06.639Z');

-- Dumping data for table `accounts`
INSERT INTO `accounts` (`username`, `password`, `account_type`, `name`, `created_at`) VALUES ('admin', '9b5a9616c3149dca0a2c4d82d19b4650f6a7433673ea72e6d04fc8c57b44952b', 'admin', 'admin', '2026-09-30T11:39:57.276Z');
INSERT INTO `accounts` (`username`, `password`, `account_type`, `name`, `created_at`) VALUES ('amarapati', '8e27902b278f2be3e676728c38f6b173e860901b1915c86e1a9af30fd7f35b0e', 'admin', 'amarapati', '2026-09-30T11:39:57.276Z');
INSERT INTO `accounts` (`username`, `password`, `account_type`, `name`, `created_at`) VALUES ('wasit1', '2350370b5e70b82cea6a60b6200f3dabb422f0f8d8b85935f73e63906069009c', 'wasit', 'Wasit 1', '2026-09-30T11:39:57.276Z');
INSERT INTO `accounts` (`username`, `password`, `account_type`, `name`, `created_at`) VALUES ('wasit2', '4b7f1c8a444c045172e4bad8f01f25476dd006e13d5fb8a225e34c6bc75a8b2e', 'wasit', 'Wasit 2', '2026-09-30T11:39:57.276Z');
INSERT INTO `accounts` (`username`, `password`, `account_type`, `name`, `created_at`) VALUES ('wasit3', 'f3965c3cf29845f86beffc8b232d604198a0403549fe467325ac08fb2ac03552', 'wasit', 'Wasit 3', '2026-09-30T11:39:57.276Z');
INSERT INTO `accounts` (`username`, `password`, `account_type`, `name`, `created_at`) VALUES ('wasit4', '218c16ce193e9013b36dc4f39e1e577db08773259714ca94c1a37bceaf6b46b6', 'wasit', 'Wasit 4', '2026-09-30T11:39:57.276Z');
INSERT INTO `accounts` (`username`, `password`, `account_type`, `name`, `created_at`) VALUES ('wasit5', 'a24f35dc78869002cc13ea2849d642e869a89bd5c45108cebcf0f5de9121d2b5', 'wasit', 'Wasit 5', '2026-09-30T11:39:57.276Z');
INSERT INTO `accounts` (`username`, `password`, `account_type`, `name`, `created_at`) VALUES ('wasit6', '1b303dc0cfc8ccb00c5cf9c8f1f96cf7d30a96f1aea647bebbfaea2f1e29a3ae', 'wasit', 'Wasit 6', '2026-09-30T11:39:57.276Z');

SET FOREIGN_KEY_CHECKS = 1;
