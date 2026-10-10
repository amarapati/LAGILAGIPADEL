import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowLeftRight,
  ShieldCheck,
  Trophy,
  Flame,
  RotateCcw,
  Undo2,
  CheckCircle2,
  LogOut,
  Radio,
  FileText,
  AlertCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Award,
  User,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Maximize2,
  Minimize2,
  Crown,
  Users,
  Shuffle,
  Layers,
  UserPlus,
  HelpCircle,
  Database,
  X
} from 'lucide-react';
import {
  getStoredTournaments,
  getStoredTournamentById,
  saveTournament,
  syncLiveMatchScore,
  finishAndPublishMatch,
  getOrGeneratePoolMatches,
  savePoolMatch
} from '../data/tournamentStorage';
import {
  getStoredRefereeState,
  saveStoredRefereeState,
  clearStoredRefereeState,
  restoreStoredRefereeState,
  RefereeScoringState
} from '../data/refereeStorage';
import {
  getStoredBracket,
  syncLiveScoreToBracket,
  findAndAdvanceMatchInBracket,
  updateMatchCourtInBracket
} from '../data/bracketStorage';
import { getStoredTournamentGroups } from '../data/tournamentGroupStorage';
import { SuperAdminBracketManager } from './SuperAdminBracketManager';
import { AdminMemberManager } from './AdminMemberManager';
import { AdminGroupDrawManager } from './AdminGroupDrawManager';
import { AdminMemberPoolAllocation } from './AdminMemberPoolAllocation';
import { AdminTournamentManager } from './AdminTournamentManager';
import { apiLogin } from '../data/apiClient';

interface RefereeAdminPortalProps {
  onBackToGuest: () => void;
  onPublishScore?: (tournamentId: string, matchSummary: string) => void;
}

// Akun resmi yang diizinkan untuk wasit dan admin
const AUTHORIZED_ACCOUNTS: Record<string, { password: string[]; name: string; role: string }> = {
  admin: {
    password: ['admin123', '1234', 'padel123'],
    name: 'Administrator Turnamen',
    role: 'Super Admin / Panitia Pusat'
  },
  wasit: {
    password: ['wasit123', '1234', 'padel123'],
    name: 'Wasit Pertandingan Utama',
    role: 'Wasit Lisensi FIP'
  },
  wasit1: {
    password: ['1234', 'wasit123'],
    name: 'Wasit Lapangan 1 & 2',
    role: 'Wasit Lapangan (Court Referee)'
  },
  wasit2: {
    password: ['1234', 'wasit123'],
    name: 'Wasit Lapangan 3 & 4',
    role: 'Wasit Lapangan (Court Referee)'
  },
  panitia: {
    password: ['panitia123', '1234'],
    name: 'Panitia Meja Pertandingan',
    role: 'Official Table Committee'
  }
};

export const RefereeAdminPortal: React.FC<RefereeAdminPortalProps> = ({
  onBackToGuest,
  onPublishScore
}) => {
  // Authentication & session state (Wajib login terlebih dahulu)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [loggedInUser, setLoggedInUser] = useState<{
    username: string;
    name: string;
    role: string;
    account_type?: string;
  } | null>(null);

  const isAdminUser = loggedInUser?.account_type === 'admin' || loggedInUser?.username === 'admin';

  // Portal Tabs: Kelola Turnamen (Admin), Member Klub (Admin), Alokasi Pool (Admin), Undian Grup & Acak (Admin), Super Admin Bracket, Wasit Skoring
  const [activePortalTab, setActivePortalTab] = useState<'tournament-manager' | 'member' | 'pool-allocation' | 'group-draw' | 'bracket' | 'referee'>('tournament-manager');

  // Tournament and match selection
  const [tournaments, setTournaments] = useState(() => getStoredTournaments());
  const liveTournaments = tournaments.filter((t) => t.status === 'Live');

  const [selectedTourneyId, setSelectedTourneyId] = useState<string>(() => {
    const stored = getStoredTournaments();
    const live = stored.find((t) => t.status === 'Live');
    if (live) return live.id;
    return stored.length > 0 ? stored[0].id : 'rookie-mix';
  });
  const [activeCourt, setActiveCourt] = useState<number>(2);
  const [matchPhase, setMatchPhase] = useState<string>('Grand Final');
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');

  // Referee Scoring Sheet State (Persistent & Synchronized)
  const initialReferee = getStoredRefereeState();
  const [teamAName, setTeamAName] = useState<string>(initialReferee.teamAName);
  const [teamBName, setTeamBName] = useState<string>(initialReferee.teamBName);
  const [courtScoreA, setCourtScoreA] = useState<number>(initialReferee.courtScoreA); // 0=0, 1=15, 2=30, 3=40
  const [courtScoreB, setCourtScoreB] = useState<number>(initialReferee.courtScoreB);
  const [gamesTeamA, setGamesTeamA] = useState<number>(initialReferee.gamesTeamA);
  const [gamesTeamB, setGamesTeamB] = useState<number>(initialReferee.gamesTeamB);
  const [currentSetA, setCurrentSetA] = useState<number>(initialReferee.currentSetA);
  const [currentSetB, setCurrentSetB] = useState<number>(initialReferee.currentSetB);
  const [currentServer, setCurrentServer] = useState<'A' | 'B'>(initialReferee.currentServer || 'A');
  const [goldenPointActive, setGoldenPointActive] = useState<boolean>(initialReferee.goldenPointActive || false);
  const [officialRefereeNotes, setOfficialRefereeNotes] = useState<string>(initialReferee.officialRefereeNotes || '');
  const [publishSuccessMessage, setPublishSuccessMessage] = useState<string | null>(null);
  const [scoreHistory, setScoreHistory] = useState<string[]>(initialReferee.scoreHistory || []);

  // Listen to tournament updates and scoring reset
  useEffect(() => {
    const handleTournamentsUpdate = () => {
      const updated = getStoredTournaments();
      setTournaments(updated);
      if (activePortalTab === 'referee') {
        const liveList = updated.filter((t) => t.status === 'Live');
        if (liveList.length > 0 && !liveList.some((t) => t.id === selectedTourneyId)) {
          setSelectedTourneyId(liveList[0].id);
        } else if (liveList.length === 0) {
          setSelectedTourneyId('');
        }
      } else if (!updated.some((t) => t.id === selectedTourneyId)) {
        setSelectedTourneyId(updated.length > 0 ? updated[0].id : '');
      }
    };

    const handleScoringReset = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.cleared) {
        setTeamAName('Tim A (TBD)');
        setTeamBName('Tim B (TBD)');
        setCourtScoreA(0);
        setCourtScoreB(0);
        setGamesTeamA(0);
        setGamesTeamB(0);
        setCurrentSetA(0);
        setCurrentSetB(0);
        setCurrentServer('A');
        setGoldenPointActive(false);
        setScoreHistory([]);
        setHistoryStack([]);
        setOfficialRefereeNotes('Pertandingan belum dimulai (Data skoring & hasil wasit dikosongkan).');
      } else if (customEvent.detail?.resetToDefault) {
        setTeamAName('Olivia & Rico');
        setTeamBName('Kartika & Dodie');
        setCourtScoreA(2);
        setCourtScoreB(1);
        setGamesTeamA(3);
        setGamesTeamB(2);
        setCurrentSetA(1);
        setCurrentSetB(0);
        setCurrentServer('A');
        setGoldenPointActive(false);
        setScoreHistory([
          'Game 1 dimenangkan Tim A (40-15)',
          'Game 2 dimenangkan Tim B (Golden Point 40-40)',
          'Game 3 dimenangkan Tim A (40-30)'
        ]);
        setHistoryStack([]);
        setOfficialRefereeNotes('Pertandingan berjalan kondusif sesuai regulasi FIP Padel Pro.');
      }
    };

    window.addEventListener('lagilagipadel_tournaments_updated', handleTournamentsUpdate);
    window.addEventListener('lagilagipadel_scoring_reset', handleScoringReset);
    return () => {
      window.removeEventListener('lagilagipadel_tournaments_updated', handleTournamentsUpdate);
      window.removeEventListener('lagilagipadel_scoring_reset', handleScoringReset);
    };
  }, [selectedTourneyId, activePortalTab]);

  // Pada laman Skoring Wasit, pastikan turnamen yang terpilih adalah turnamen yang berstatus Live
  useEffect(() => {
    if (activePortalTab === 'referee') {
      const liveList = tournaments.filter((t) => t.status === 'Live');
      if (liveList.length > 0) {
        if (!liveList.some((t) => t.id === selectedTourneyId)) {
          setSelectedTourneyId(liveList[0].id);
        }
      }
    }
  }, [activePortalTab, tournaments, selectedTourneyId]);

  // Reactive groups & bracket for the selected tournament
  const [liveGroups, setLiveGroups] = useState(() => getStoredTournamentGroups(selectedTourneyId));
  const [liveBracket, setLiveBracket] = useState(() => getStoredBracket(selectedTourneyId));

  useEffect(() => {
    setLiveGroups(getStoredTournamentGroups(selectedTourneyId));
    setLiveBracket(getStoredBracket(selectedTourneyId));
  }, [selectedTourneyId, tournaments]);

  useEffect(() => {
    const refreshGroupsAndBracket = () => {
      setLiveGroups(getStoredTournamentGroups(selectedTourneyId));
      setLiveBracket(getStoredBracket(selectedTourneyId));
    };
    window.addEventListener('lagilagipadel_groups_updated', refreshGroupsAndBracket);
    window.addEventListener('lagilagipadel_bracket_updated', refreshGroupsAndBracket);
    window.addEventListener('lagilagipadel_members_updated', refreshGroupsAndBracket);
    return () => {
      window.removeEventListener('lagilagipadel_groups_updated', refreshGroupsAndBracket);
      window.removeEventListener('lagilagipadel_bracket_updated', refreshGroupsAndBracket);
      window.removeEventListener('lagilagipadel_members_updated', refreshGroupsAndBracket);
    };
  }, [selectedTourneyId]);

  // Helper to resolve available team options for the currently selected matchPhase & Pool
  const phaseTeamSelection = React.useMemo(() => {
    const tourney = tournaments.find((t) => t.id === selectedTourneyId);
    const normPhase = matchPhase.toLowerCase();
    const isPoolMatch = normPhase.includes('pool') || matchPhase.endsWith('Match');

    // Collect pools with teams from liveGroups or fallback to tourney.participants
    const poolMap = new Map<string, { name: string; p1: string; p2: string; pool: string }[]>();
    if (liveGroups && liveGroups.length > 0) {
      liveGroups.forEach((pg) => {
        poolMap.set(
          pg.poolName,
          pg.teams.map((t) => ({
            name: t.name,
            p1: t.p1,
            p2: t.p2,
            pool: pg.poolName
          }))
        );
      });
    } else if (tourney?.participants) {
      tourney.participants.forEach((p) => {
        const pName = p.pool || 'Pool A';
        if (!poolMap.has(pName)) poolMap.set(pName, []);
        poolMap.get(pName)!.push({
          name: p.teamName,
          p1: p.p1,
          p2: p.p2,
          pool: pName
        });
      });
    }

    if (isPoolMatch) {
      const targetPoolName = matchPhase.replace(/\s*Match$/i, '').trim();
      // Find matching pool (case-insensitive)
      let matchedPoolKey = targetPoolName;
      for (const key of poolMap.keys()) {
        if (key.toLowerCase() === targetPoolName.toLowerCase()) {
          matchedPoolKey = key;
          break;
        }
      }
      const poolTeams = poolMap.get(matchedPoolKey) || [];
      return {
        mode: 'pool' as const,
        poolName: matchedPoolKey,
        primaryTeams: poolTeams,
        bracketPair: null as { team1: string; team2: string } | null,
        allPools: Array.from(poolMap.entries()).map(([poolName, teams]) => ({ poolName, teams }))
      };
    }

    // Knockout / Playoff phase: find corresponding bracket match node
    let bracketNode: { team1?: { name: string; players?: string }; team2?: { name: string; players?: string } } | null = null;
    if (
      normPhase.includes('grand final') ||
      (normPhase.includes('final') &&
        !normPhase.includes('semi') &&
        !normPhase.includes('quarter') &&
        !normPhase.includes('perempat') &&
        !normPhase.includes('3'))
    ) {
      bracketNode = liveBracket?.grandFinal || null;
    } else if (normPhase.includes('3') || normPhase.includes('bronze')) {
      bracketNode = liveBracket?.bronzeMatch || null;
    } else if (normPhase.includes('semi') && normPhase.includes('1')) {
      bracketNode = liveBracket?.semis?.[0] || null;
    } else if (normPhase.includes('semi') && normPhase.includes('2')) {
      bracketNode = liveBracket?.semis?.[1] || null;
    } else if (normPhase.includes('perempat') || normPhase.includes('quarter') || normPhase.includes('qf')) {
      const idx = normPhase.includes('1') ? 0 : normPhase.includes('2') ? 1 : normPhase.includes('3') ? 2 : 3;
      bracketNode = liveBracket?.quarters?.[idx] || null;
    } else if (normPhase.includes('16') || normPhase.includes('r16')) {
      let rIdx = 0;
      for (let i = 0; i < 8; i++) {
        if (normPhase.includes(String(i + 1))) {
          rIdx = i;
          break;
        }
      }
      bracketNode = liveBracket?.roundOf16?.[rIdx] || null;
    }

    const bracketPair =
      bracketNode?.team1?.name && bracketNode?.team2?.name
        ? { team1: bracketNode.team1.name, team2: bracketNode.team2.name }
        : null;

    const flatAllTeams: { name: string; p1: string; p2: string; pool: string }[] = [];
    poolMap.forEach((teams) => flatAllTeams.push(...teams));

    return {
      mode: 'knockout' as const,
      poolName: matchPhase,
      primaryTeams: flatAllTeams,
      bracketPair,
      allPools: Array.from(poolMap.entries()).map(([poolName, teams]) => ({ poolName, teams }))
    };
  }, [selectedTourneyId, tournaments, matchPhase, liveGroups, liveBracket]);

  // Daftar pertandingan & pasangan Tim A vs Tim B yang valid sesuai babak pertandingan terpilih
  const phaseMatchList = React.useMemo(() => {
    const norm = matchPhase.toLowerCase();
    const isPool = norm.includes('pool') || matchPhase.endsWith('Match');

    if (isPool) {
      const targetPoolName = matchPhase.replace(/\s*Match$/i, '').trim();
      const allPoolMatches = getOrGeneratePoolMatches(selectedTourneyId);
      const filtered = allPoolMatches.filter((m) => {
        const rNorm = m.round.toLowerCase();
        return rNorm.includes(targetPoolName.toLowerCase());
      });

      const list: {
        id: string;
        label: string;
        roundTitle: string;
        teamAName: string;
        teamBName: string;
        court: string;
        isBracket: boolean;
      }[] = [];

      if (filtered.length > 0) {
        filtered.forEach((m) => {
          list.push({
            id: m.id,
            label: `${m.round}: ${m.teamA} vs ${m.teamB} (${m.court || `Court ${activeCourt}`})`,
            roundTitle: m.round,
            teamAName: m.teamA,
            teamBName: m.teamB,
            court: m.court || `Court ${activeCourt}`,
            isBracket: false
          });
        });
      }

      // Also ensure combinations from liveGroups are present if not already added
      const groupObj = liveGroups?.find(
        (g) => g.poolName.toLowerCase() === targetPoolName.toLowerCase()
      );
      if (groupObj && groupObj.teams && groupObj.teams.length >= 2) {
        for (let i = 0; i < groupObj.teams.length; i++) {
          for (let j = i + 1; j < groupObj.teams.length; j++) {
            const tA = groupObj.teams[i].name;
            const tB = groupObj.teams[j].name;
            const alreadyExists = list.some(
              (r) => (r.teamAName === tA && r.teamBName === tB) || (r.teamAName === tB && r.teamBName === tA)
            );
            if (!alreadyExists) {
              list.push({
                id: `pool-pair-${targetPoolName}-${i}-${j}`,
                label: `${targetPoolName}: ${tA} vs ${tB}`,
                roundTitle: `${targetPoolName} Match`,
                teamAName: tA,
                teamBName: tB,
                court: `Court ${activeCourt}`,
                isBracket: false
              });
            }
          }
        }
      }

      return list;
    }

    // Knockout Bracket matches
    const list: {
      id: string;
      label: string;
      roundTitle: string;
      teamAName: string;
      teamBName: string;
      court: string;
      isBracket: boolean;
    }[] = [];

    if (!liveBracket) return list;

    if (
      norm.includes('grand final') ||
      (norm.includes('final') &&
        !norm.includes('semi') &&
        !norm.includes('perempat') &&
        !norm.includes('quarter') &&
        !norm.includes('3') &&
        !norm.includes('bronze'))
    ) {
      if (liveBracket.grandFinal) {
        const gf = liveBracket.grandFinal;
        list.push({
          id: gf.id || 'gf-1',
          label: `Grand Final: ${gf.team1?.name || 'Finalis 1'} vs ${gf.team2?.name || 'Finalis 2'} (${gf.court || 'Court 1'})`,
          roundTitle: gf.roundTitle || 'Grand Final (Gold Match)',
          teamAName: gf.team1?.name || '',
          teamBName: gf.team2?.name || '',
          court: gf.court || 'Court 1',
          isBracket: true
        });
      }
    } else if (norm.includes('3') || norm.includes('bronze')) {
      if (liveBracket.bronzeMatch) {
        const bm = liveBracket.bronzeMatch;
        list.push({
          id: bm.id || 'bm-1',
          label: `Perebutan Juara 3: ${bm.team1?.name || 'Semifinalis 1'} vs ${bm.team2?.name || 'Semifinalis 2'} (${bm.court || 'Court 2'})`,
          roundTitle: bm.roundTitle || 'Perebutan Juara 3 (Bronze Match)',
          teamAName: bm.team1?.name || '',
          teamBName: bm.team2?.name || '',
          court: bm.court || 'Court 2',
          isBracket: true
        });
      }
    } else if (norm.includes('semi')) {
      if (liveBracket.semis && liveBracket.semis.length > 0) {
        liveBracket.semis.forEach((sf, idx) => {
          list.push({
            id: sf.id || `sf-${idx + 1}`,
            label: `${sf.roundTitle || `Semifinal ${idx + 1}`}: ${sf.team1?.name || 'Tim 1'} vs ${sf.team2?.name || 'Tim 2'} (${sf.court || `Court ${idx + 1}`})`,
            roundTitle: sf.roundTitle || `Semifinal ${idx + 1}`,
            teamAName: sf.team1?.name || '',
            teamBName: sf.team2?.name || '',
            court: sf.court || `Court ${idx + 1}`,
            isBracket: true
          });
        });
      }
    } else if (norm.includes('perempat') || norm.includes('quarter') || norm.includes('qf')) {
      if (liveBracket.quarters && liveBracket.quarters.length > 0) {
        liveBracket.quarters.forEach((qf, idx) => {
          list.push({
            id: qf.id || `qf-${idx + 1}`,
            label: `${qf.roundTitle || `Perempat Final ${idx + 1}`}: ${qf.team1?.name || 'Tim 1'} vs ${qf.team2?.name || 'Tim 2'} (${qf.court || `Court ${idx + 1}`})`,
            roundTitle: qf.roundTitle || `Perempat Final ${idx + 1}`,
            teamAName: qf.team1?.name || '',
            teamBName: qf.team2?.name || '',
            court: qf.court || `Court ${idx + 1}`,
            isBracket: true
          });
        });
      }
    } else if (norm.includes('16') || norm.includes('r16')) {
      if (liveBracket.roundOf16 && liveBracket.roundOf16.length > 0) {
        liveBracket.roundOf16.forEach((r16, idx) => {
          list.push({
            id: r16.id || `r16-${idx + 1}`,
            label: `${r16.roundTitle || `Babak 16 Besar #${idx + 1}`}: ${r16.team1?.name || 'Tim 1'} vs ${r16.team2?.name || 'Tim 2'} (${r16.court || `Court ${(idx % 4) + 1}`})`,
            roundTitle: r16.roundTitle || `Babak 16 Besar #${idx + 1}`,
            teamAName: r16.team1?.name || '',
            teamBName: r16.team2?.name || '',
            court: r16.court || `Court ${(idx % 4) + 1}`,
            isBracket: true
          });
        });
      }
    }

    return list;
  }, [selectedTourneyId, matchPhase, liveBracket, liveGroups, activeCourt]);

  // Helper saat wasit memilih nomor lapangan: langsung ubah di state & perbarui nomor lapangan di Bagan Bracket
  const handleSelectCourt = (courtNum: number) => {
    setActiveCourt(courtNum);
    const courtStr = `Court ${courtNum}`;
    if (selectedTourneyId && selectedMatchId) {
      const updated = updateMatchCourtInBracket(selectedTourneyId, selectedMatchId, courtStr);
      if (updated) {
        setLiveBracket(updated);
        setPublishSuccessMessage(`Nomor lapangan untuk pertandingan di Bagan Bracket diubah ke ${courtStr}!`);
        setTimeout(() => setPublishSuccessMessage(null), 3000);
      }
    } else if (selectedTourneyId && phaseMatchList.length > 0) {
      const targetId = phaseMatchList[0].id;
      const updated = updateMatchCourtInBracket(selectedTourneyId, targetId, courtStr);
      if (updated) {
        setLiveBracket(updated);
        setSelectedMatchId(targetId);
        setPublishSuccessMessage(`Nomor lapangan pada Bagan Bracket diubah ke ${courtStr}!`);
        setTimeout(() => setPublishSuccessMessage(null), 3000);
      }
    }
  };

  // Helper saat wasit memilih pasangan pertandingan dari dropdown
  const handleSelectMatchPair = (matchId: string) => {
    setSelectedMatchId(matchId);
    const target = phaseMatchList.find((m) => m.id === matchId);
    if (!target) return;

    if (target.roundTitle && target.roundTitle !== matchPhase) {
      if (target.id === 'gf-1' || target.roundTitle.toLowerCase().includes('grand final')) {
        setMatchPhase('Grand Final');
      } else if (target.id === 'bm-1' || target.roundTitle.toLowerCase().includes('juara 3')) {
        setMatchPhase('Perebutan Juara 3');
      } else if (target.id.startsWith('sf-')) {
        const num = target.id.replace('sf-', '');
        setMatchPhase(`Semifinal ${num}`);
      } else if (target.id.startsWith('qf-')) {
        const num = target.id.replace('qf-', '');
        setMatchPhase(`Perempat Final ${num}`);
      } else if (target.id.startsWith('r16-')) {
        const num = target.id.replace('r16-', '');
        setMatchPhase(`Babak 16 Besar ${num}`);
      }
    }

    if (target.teamAName && target.teamAName !== 'TBD') {
      setTeamAName(target.teamAName);
    }
    if (target.teamBName && target.teamBName !== 'TBD') {
      setTeamBName(target.teamBName);
    }

    if (target.court) {
      const cNum = target.court.match(/\d+/);
      if (cNum) {
        const num = Number(cNum[0]);
        if (num >= 1 && num <= 6) {
          setActiveCourt(num);
        }
      }
    } else {
      if (selectedTourneyId && target.isBracket) {
        const updated = updateMatchCourtInBracket(selectedTourneyId, target.id, `Court ${activeCourt}`);
        if (updated) setLiveBracket(updated);
      }
    }
  };

  // Synchronize teamAName and teamBName whenever tournament, matchPhase, or phaseMatchList change
  const previousTourneyIdRef = useRef<string>(selectedTourneyId);
  const previousPhaseRef = useRef<string>(matchPhase);
  useEffect(() => {
    const tourneyChanged = previousTourneyIdRef.current !== selectedTourneyId;
    const phaseChanged = previousPhaseRef.current !== matchPhase;
    previousTourneyIdRef.current = selectedTourneyId;
    previousPhaseRef.current = matchPhase;

    if (phaseMatchList.length > 0) {
      let target = phaseMatchList.find((m) => m.id === selectedMatchId);
      if (tourneyChanged || phaseChanged || !target) {
        const numMatch = matchPhase.match(/\d+/);
        if (numMatch) {
          const idx = Number(numMatch[0]) - 1;
          target = phaseMatchList[idx] || phaseMatchList[0];
        } else {
          target = phaseMatchList[0];
        }
      }

      if (target) {
        setSelectedMatchId(target.id);
        if (target.teamAName && target.teamAName !== 'TBD') setTeamAName(target.teamAName);
        if (target.teamBName && target.teamBName !== 'TBD') setTeamBName(target.teamBName);

        if (target.court) {
          const cNum = target.court.match(/\d+/);
          if (cNum) {
            const num = Number(cNum[0]);
            if (num >= 1 && num <= 6) setActiveCourt(num);
          }
        }
      }
    } else if (phaseTeamSelection.mode === 'pool') {
      const poolTeams = phaseTeamSelection.primaryTeams;
      if (poolTeams.length >= 2) {
        const inPoolA = poolTeams.some((t) => t.name === teamAName);
        const inPoolB = poolTeams.some((t) => t.name === teamBName);
        if (tourneyChanged || phaseChanged || !inPoolA || !inPoolB || teamAName === teamBName) {
          const nextA = inPoolA && !tourneyChanged && !phaseChanged ? teamAName : poolTeams[0].name;
          const nextB =
            inPoolB && !tourneyChanged && !phaseChanged && teamBName !== nextA
              ? teamBName
              : (poolTeams.find((t) => t.name !== nextA)?.name || poolTeams[1].name);
          setTeamAName(nextA);
          setTeamBName(nextB);
        }
      } else if (poolTeams.length === 1) {
        setTeamAName(poolTeams[0].name);
        setTeamBName('Tim Lawan (TBD)');
      }
    } else {
      // Knockout phase fallback
      const { bracketPair, primaryTeams } = phaseTeamSelection;
      const validNames = new Set<string>(primaryTeams.map((t) => t.name));
      if (bracketPair) {
        validNames.add(bracketPair.team1);
        validNames.add(bracketPair.team2);
      }

      if (phaseChanged && bracketPair) {
        setTeamAName(bracketPair.team1);
        setTeamBName(bracketPair.team2);
      } else if (tourneyChanged) {
        if (bracketPair) {
          setTeamAName(bracketPair.team1);
          setTeamBName(bracketPair.team2);
        } else if (primaryTeams.length >= 2) {
          setTeamAName(primaryTeams[0].name);
          setTeamBName(primaryTeams[1].name);
        }
      } else {
        if (!teamAName || teamAName === 'Tim A (TBD)' || (validNames.size > 0 && !validNames.has(teamAName))) {
          setTeamAName(bracketPair?.team1 || primaryTeams[0]?.name || 'Tim A (TBD)');
        }
        if (!teamBName || teamBName === 'Tim B (TBD)' || (validNames.size > 0 && !validNames.has(teamBName))) {
          setTeamBName(bracketPair?.team2 || primaryTeams[1]?.name || 'Tim B (TBD)');
        }
      }
    }
  }, [selectedTourneyId, matchPhase, phaseMatchList, phaseTeamSelection]);

  // Selected tournament object & point display labels
  const selectedTourneyData = tournaments.find((t) => t.id === selectedTourneyId);
  const pointLabels = ['0', '15', '30', '40'];

  // Active pools and knockout stage availability for selected tournament
  const activePools =
    selectedTourneyData?.groupStandings?.pools?.filter((p) => p !== 'Semua Pool') || [
      'Pool A',
      'Pool B',
      'Pool C',
      'Pool D'
    ];
  const activePoolCount = activePools.length;

  const hasRoundOf16 =
    !!(selectedTourneyData?.knockoutBracket?.roundOf16 && selectedTourneyData.knockoutBracket.roundOf16.length > 0) ||
    activePoolCount >= 5;

  const hasQuarters =
    !!(selectedTourneyData?.knockoutBracket?.quarters && selectedTourneyData.knockoutBracket.quarters.length > 0) ||
    activePoolCount >= 3;

  const hasSemis =
    !!(selectedTourneyData?.knockoutBracket?.semis && selectedTourneyData.knockoutBracket.semis.length > 0) ||
    activePoolCount >= 2;

  // Auto-validate matchPhase when tournament changes or pools are reconfigured
  useEffect(() => {
    if (!selectedTourneyData) return;
    const pools = selectedTourneyData.groupStandings?.pools?.filter((p) => p !== 'Semua Pool') || [
      'Pool A',
      'Pool B',
      'Pool C',
      'Pool D'
    ];
    const poolCount = pools.length;
    const canR16 =
      !!(selectedTourneyData.knockoutBracket?.roundOf16 && selectedTourneyData.knockoutBracket.roundOf16.length > 0) ||
      poolCount >= 5;
    const canQF =
      !!(selectedTourneyData.knockoutBracket?.quarters && selectedTourneyData.knockoutBracket.quarters.length > 0) ||
      poolCount >= 3;

    if (matchPhase.startsWith('Babak 16 Besar') && !canR16) {
      setMatchPhase(canQF ? 'Perempat Final 1' : 'Semifinal 1');
    } else if (matchPhase.startsWith('Perempat Final') && !canQF) {
      setMatchPhase('Semifinal 1');
    } else if (matchPhase.endsWith('Match')) {
      const pName = matchPhase.replace(' Match', '').trim();
      if (!pools.includes(pName)) {
        setMatchPhase(`${pools[0] || 'Pool A'} Match`);
      }
    }
  }, [selectedTourneyId, selectedTourneyData]);

  // Confirmation Modal state for "Selesai dan Publikasikan Skor ke Sistem Tamu"
  const [showFinishConfirmModal, setShowFinishConfirmModal] = useState<boolean>(false);
  const [showResetScoreConfirmModal, setShowResetScoreConfirmModal] = useState<boolean>(false);
  const [selectedWinnerChoice, setSelectedWinnerChoice] = useState<'A' | 'B'>('A');

  // Auto-persist referee state changes & AUTO-SYNC real-time score to guest system
  useEffect(() => {
    const isCleared =
      gamesTeamA === 0 &&
      gamesTeamB === 0 &&
      courtScoreA === 0 &&
      courtScoreB === 0 &&
      scoreHistory.length === 0;

    saveStoredRefereeState({
      teamAName,
      teamBName,
      courtScoreA,
      courtScoreB,
      gamesTeamA,
      gamesTeamB,
      currentSetA,
      currentSetB,
      currentServer,
      goldenPointActive,
      scoreHistory,
      officialRefereeNotes,
      activeCourt,
      matchPhase,
      selectedTourneyId,
      isCleared
    });

    // Otomatis sinkronkan dan tampilkan skor ke halaman sistem tamu setiap ada perubahan atau penambahan poin
    if (selectedTourneyId && !isCleared) {
      const pA = pointLabels[courtScoreA] || '0';
      const pB = pointLabels[courtScoreB] || '0';
      const setDetailStr = `Set ${currentSetA}-${currentSetB} (Games: ${gamesTeamA}-${gamesTeamB}, Poin: ${pA}-${pB}) · Servis: Tim ${currentServer}${
        goldenPointActive ? ' · ⚡ Golden Point' : ''
      }`;

      // Sinkronkan ke daftar pertandingan tamu
      syncLiveMatchScore(
        selectedTourneyId,
        activeCourt,
        matchPhase,
        teamAName,
        teamBName,
        `${gamesTeamA} (${pA})`,
        `${gamesTeamB} (${pB})`,
        setDetailStr
      );

      // Sinkronkan langsung ke bagan sistem gugur (bracket)
      syncLiveScoreToBracket(
        selectedTourneyId,
        matchPhase,
        teamAName,
        teamBName,
        gamesTeamA,
        gamesTeamB,
        `Court ${activeCourt}`
      );
    }
  }, [
    teamAName,
    teamBName,
    courtScoreA,
    courtScoreB,
    gamesTeamA,
    gamesTeamB,
    currentSetA,
    currentSetB,
    currentServer,
    goldenPointActive,
    scoreHistory,
    officialRefereeNotes,
    activeCourt,
    matchPhase,
    selectedTourneyId
  ]);

  // Scoreboard Full Screen State & Ref
  const [isScoreboardFullscreen, setIsScoreboardFullscreen] = useState<boolean>(false);
  const scoreboardRef = useRef<HTMLDivElement>(null);

  const toggleScoreboardFullscreen = () => {
    if (!isScoreboardFullscreen) {
      setIsScoreboardFullscreen(true);
      try {
        if (scoreboardRef.current && !document.fullscreenElement) {
          scoreboardRef.current.requestFullscreen?.().catch(() => {});
        }
      } catch (err) {
        // Fallback to CSS fullscreen overlay
      }
    } else {
      setIsScoreboardFullscreen(false);
      try {
        if (document.fullscreenElement) {
          document.exitFullscreen?.().catch(() => {});
        }
      } catch (err) {
        // ignore
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isScoreboardFullscreen) {
        setIsScoreboardFullscreen(false);
      }
    };
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isScoreboardFullscreen) {
        setIsScoreboardFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isScoreboardFullscreen]);

  // Score undo history snapshot
  const [historyStack, setHistoryStack] = useState<{
    scoreA: number;
    scoreB: number;
    gamesA: number;
    gamesB: number;
    setA: number;
    setB: number;
    server: 'A' | 'B';
    golden: boolean;
    teamA?: string;
    teamB?: string;
  }[]>([]);

  const pushHistorySnapshot = () => {
    setHistoryStack((prev) => [
      {
        scoreA: courtScoreA,
        scoreB: courtScoreB,
        gamesA: gamesTeamA,
        gamesB: gamesTeamB,
        setA: currentSetA,
        setB: currentSetB,
        server: currentServer,
        golden: goldenPointActive,
        teamA: teamAName,
        teamB: teamBName
      },
      ...prev.slice(0, 10)
    ]);
  };

  // Helper: Muat pasangan tim dari bagan sesuai babak terpilih
  const handleLoadTeamsFromBracket = () => {
    if (!selectedTourneyId) return;
    const bracket = getStoredBracket(selectedTourneyId);
    if (!bracket) return;

    const norm = matchPhase.toLowerCase();
    let loaded = false;

    if (norm.includes('pool')) {
      // Find matching pool from groups
      const groups = getStoredTournamentGroups(selectedTourneyId);
      // Try exact pool name match or letter match
      const matchingGroup = groups.find((g) => {
        const pNorm = g.poolName.toLowerCase().replace(/[^a-z0-9]/g, '');
        return norm.includes(pNorm) || (norm.includes('pool') && norm.endsWith(g.poolName.slice(-1).toLowerCase()));
      });

      if (matchingGroup && matchingGroup.teams && matchingGroup.teams.length >= 2) {
        setTeamAName(matchingGroup.teams[0].name);
        setTeamBName(matchingGroup.teams[1].name);
        loaded = true;
      } else if (matchingGroup && matchingGroup.teams && matchingGroup.teams.length === 1) {
        setTeamAName(matchingGroup.teams[0].name);
        setTeamBName('Tim Lawan (TBD)');
        loaded = true;
      }
    } else if (norm.includes('grand final') || (norm.includes('final') && !norm.includes('semi') && !norm.includes('quarter') && !norm.includes('perempat') && !norm.includes('3'))) {
      if (bracket.grandFinal && bracket.grandFinal.team1?.name && bracket.grandFinal.team2?.name) {
        setTeamAName(bracket.grandFinal.team1.name);
        setTeamBName(bracket.grandFinal.team2.name);
        loaded = true;
      }
    } else if (norm.includes('3') || norm.includes('bronze')) {
      if (bracket.bronzeMatch && bracket.bronzeMatch.team1?.name && bracket.bronzeMatch.team2?.name) {
        setTeamAName(bracket.bronzeMatch.team1.name);
        setTeamBName(bracket.bronzeMatch.team2.name);
        loaded = true;
      }
    } else if (norm.includes('semi') && norm.includes('1')) {
      if (bracket.semis && bracket.semis[0]) {
        setTeamAName(bracket.semis[0].team1.name);
        setTeamBName(bracket.semis[0].team2.name);
        loaded = true;
      }
    } else if (norm.includes('semi') && norm.includes('2')) {
      if (bracket.semis && bracket.semis[1]) {
        setTeamAName(bracket.semis[1].team1.name);
        setTeamBName(bracket.semis[1].team2.name);
        loaded = true;
      }
    } else if (norm.includes('perempat') || norm.includes('quarter') || norm.includes('qf')) {
      const idx = norm.includes('1') ? 0 : norm.includes('2') ? 1 : norm.includes('3') ? 2 : 3;
      if (bracket.quarters && bracket.quarters[idx]) {
        setTeamAName(bracket.quarters[idx].team1.name);
        setTeamBName(bracket.quarters[idx].team2.name);
        loaded = true;
      }
    } else if (norm.includes('16') || norm.includes('r16')) {
      let rIdx = 0;
      for (let i = 0; i < 8; i++) {
        if (norm.includes(String(i + 1))) {
          rIdx = i;
          break;
        }
      }
      if (bracket.roundOf16 && bracket.roundOf16[rIdx]) {
        setTeamAName(bracket.roundOf16[rIdx].team1.name);
        setTeamBName(bracket.roundOf16[rIdx].team2.name);
        loaded = true;
      }
    }

    if (loaded) {
      setPublishSuccessMessage(`Berhasil memuat pasangan tim dari bagan untuk ${matchPhase}!`);
      setTimeout(() => setPublishSuccessMessage(null), 3500);
    } else {
      setPublishSuccessMessage(`Bagan untuk ${matchPhase} belum memiliki data tim atau gunakan input manual.`);
      setTimeout(() => setPublishSuccessMessage(null), 3500);
    }
  };

  const handlePointForA = () => {
    pushHistorySnapshot();
    const isDeuce = courtScoreA === 2 && courtScoreB === 3;
    if (isDeuce) {
      setGoldenPointActive(true);
    }

    if (courtScoreA < 3) {
      setCourtScoreA((prev) => prev + 1);
    } else {
      // Won the game
      const nextGames = gamesTeamA + 1;
      setGamesTeamA(nextGames);
      setCourtScoreA(0);
      setCourtScoreB(0);
      setGoldenPointActive(false);
      setScoreHistory((prev) => [
        `Game #${nextGames + gamesTeamB} dimenangkan ${teamAName} (${nextGames}-${gamesTeamB})`,
        ...prev
      ]);

      // Set won condition (Race to 6 with 2 games lead or 6 games standard)
      if (nextGames >= 6 && nextGames - gamesTeamB >= 2) {
        setCurrentSetA((prev) => prev + 1);
        setGamesTeamA(0);
        setGamesTeamB(0);
        setScoreHistory((prev) => [`SET dimenangkan oleh ${teamAName}!`, ...prev]);
      }
    }
  };

  const handlePointForB = () => {
    pushHistorySnapshot();
    const isDeuce = courtScoreA === 3 && courtScoreB === 2;
    if (isDeuce) {
      setGoldenPointActive(true);
    }

    if (courtScoreB < 3) {
      setCourtScoreB((prev) => prev + 1);
    } else {
      // Won the game
      const nextGames = gamesTeamB + 1;
      setGamesTeamB(nextGames);
      setCourtScoreA(0);
      setCourtScoreB(0);
      setGoldenPointActive(false);
      setScoreHistory((prev) => [
        `Game #${gamesTeamA + nextGames} dimenangkan ${teamBName} (${gamesTeamA}-${nextGames})`,
        ...prev
      ]);

      if (nextGames >= 6 && nextGames - gamesTeamA >= 2) {
        setCurrentSetB((prev) => prev + 1);
        setGamesTeamA(0);
        setGamesTeamB(0);
        setScoreHistory((prev) => [`SET dimenangkan oleh ${teamBName}!`, ...prev]);
      }
    }
  };

  const handleUndoPoint = () => {
    if (historyStack.length === 0) return;
    const [lastState, ...rest] = historyStack;
    setCourtScoreA(lastState.scoreA);
    setCourtScoreB(lastState.scoreB);
    setGamesTeamA(lastState.gamesA);
    setGamesTeamB(lastState.gamesB);
    setCurrentSetA(lastState.setA);
    setCurrentSetB(lastState.setB);
    setCurrentServer(lastState.server);
    setGoldenPointActive(lastState.golden);
    if (lastState.teamA) setTeamAName(lastState.teamA);
    if (lastState.teamB) setTeamBName(lastState.teamB);
    setHistoryStack(rest);
    setScoreHistory((prev) => [`[UNDO] Wasit membatalkan aksi/poin terakhir`, ...prev]);
  };

  const resetCurrentGame = () => {
    pushHistorySnapshot();
    setCourtScoreA(0);
    setCourtScoreB(0);
    setGoldenPointActive(false);
    setScoreHistory((prev) => [`Game di-reset wasit menjadi 0-0`, ...prev]);
  };

  // Menukar pasangan tim antara sisi lapangan A dan sisi lapangan B
  const handleSwapCourtSides = () => {
    pushHistorySnapshot();

    const oldTeamA = teamAName;
    const oldTeamB = teamBName;
    const oldScoreA = courtScoreA;
    const oldScoreB = courtScoreB;
    const oldGamesA = gamesTeamA;
    const oldGamesB = gamesTeamB;
    const oldSetA = currentSetA;
    const oldSetB = currentSetB;
    const nextServer = currentServer === 'A' ? 'B' : 'A';

    setTeamAName(oldTeamB);
    setTeamBName(oldTeamA);
    setCourtScoreA(oldScoreB);
    setCourtScoreB(oldScoreA);
    setGamesTeamA(oldGamesB);
    setGamesTeamB(oldGamesA);
    setCurrentSetA(oldSetB);
    setCurrentSetB(oldSetA);
    setCurrentServer(nextServer);

    setScoreHistory((prev) => [
      `Tukar sisi lapangan: [Sisi A: ${oldTeamB}] ⇄ [Sisi B: ${oldTeamA}]`,
      ...prev
    ]);

    setPublishSuccessMessage(`Posisi pasangan tim berhasil ditukar: ${oldTeamB} (Sisi A) ⇄ ${oldTeamA} (Sisi B)`);
    setTimeout(() => setPublishSuccessMessage(null), 3000);
  };

  // Konfirmasi pengosongan skor wasit (dieksekusi saat wasit memilih "Ya, Kosongkan Skor" di dialog modal)
  const handleConfirmResetScore = () => {
    setShowResetScoreConfirmModal(false);
    setCourtScoreA(0);
    setCourtScoreB(0);
    setGamesTeamA(0);
    setGamesTeamB(0);
    setCurrentSetA(0);
    setCurrentSetB(0);
    setCurrentServer('A');
    setGoldenPointActive(false);
    setScoreHistory([]);
    setHistoryStack([]);
    setOfficialRefereeNotes('Pertandingan belum dimulai (Data skoring & hasil wasit dikosongkan).');

    // Kosongkan dan simpan state lembar wasit
    clearStoredRefereeState();

    // Pertahankan pasangan tim yang sedang dipilih agar wasit tidak perlu memilih ulang dari awal
    if (teamAName && teamAName !== 'Tim A (TBD)') {
      saveStoredRefereeState({
        teamAName,
        teamBName,
        courtScoreA: 0,
        courtScoreB: 0,
        gamesTeamA: 0,
        gamesTeamB: 0,
        currentSetA: 0,
        currentSetB: 0,
        currentServer: 'A',
        goldenPointActive: false,
        scoreHistory: [],
        officialRefereeNotes: 'Pertandingan belum dimulai (Data skoring & hasil wasit dikosongkan).',
        activeCourt,
        matchPhase,
        selectedTourneyId,
        isCleared: true,
      });
    }

    setPublishSuccessMessage('Skor pertandingan meja wasit berhasil dikosongkan menjadi 0-0.');
    setTimeout(() => setPublishSuccessMessage(null), 3500);
  };

  // Membuka modal konfirmasi penyelesaian pertandingan
  const handleOpenFinishConfirmModal = () => {
    // Prediksi pemenang awal dari skor set, game, lalu poin
    if (currentSetA > currentSetB) {
      setSelectedWinnerChoice('A');
    } else if (currentSetB > currentSetA) {
      setSelectedWinnerChoice('B');
    } else if (gamesTeamA > gamesTeamB) {
      setSelectedWinnerChoice('A');
    } else if (gamesTeamB > gamesTeamA) {
      setSelectedWinnerChoice('B');
    } else if (courtScoreA >= courtScoreB) {
      setSelectedWinnerChoice('A');
    } else {
      setSelectedWinnerChoice('B');
    }
    setShowFinishConfirmModal(true);
  };

  // Konfirmasi finalisasi pertandingan (dieksekusi saat wasit memilih "Ya")
  const handleConfirmFinishAndPublish = () => {
    setShowFinishConfirmModal(false);

    if (!selectedTourneyId) {
      setPublishSuccessMessage('Peringatan: Harap pilih turnamen aktif terlebih dahulu.');
      return;
    }

    const winnerName = selectedWinnerChoice === 'A' ? teamAName : teamBName;
    const loserName = selectedWinnerChoice === 'A' ? teamBName : teamAName;
    const finalScoreA = String(gamesTeamA);
    const finalScoreB = String(gamesTeamB);
    const setSummary = `Set ${currentSetA}-${currentSetB} (${gamesTeamA}-${gamesTeamB})`;

    // 1. Selesaikan dan publikasikan pertandingan resmi ke turnamen tamu
    const { isGrandFinal } = finishAndPublishMatch(
      selectedTourneyId,
      activeCourt,
      matchPhase,
      teamAName,
      teamBName,
      finalScoreA,
      finalScoreB,
      setSummary,
      selectedWinnerChoice
    );

    // 2. Masukkan skor ke pertandingan yang dipilih di Bagan Bracket & loloskan pemenang
    const bracketAdvancement = findAndAdvanceMatchInBracket(
      selectedTourneyId,
      matchPhase,
      teamAName,
      teamBName,
      finalScoreA,
      finalScoreB,
      selectedWinnerChoice,
      `Court ${activeCourt}`,
      selectedMatchId
    );

    // Jika pertandingan fase pool/grup, update pool match & klasemen grup
    if (matchPhase.toLowerCase().includes('pool') || selectedMatchId.startsWith('pool')) {
      const poolMatchToSave = {
        id: selectedMatchId || `pool-match-${Date.now()}`,
        round: matchPhase,
        roundCategory: 'grup' as const,
        court: `Court ${activeCourt}`,
        time: 'Selesai',
        teamA: teamAName,
        playersA: teamAName,
        teamB: teamBName,
        playersB: teamBName,
        scoreA: finalScoreA,
        scoreB: finalScoreB,
        setDetail: `${setSummary} · Pemenang: ${winnerName}`,
        winner: selectedWinnerChoice,
        status: 'Selesai' as const
      };
      savePoolMatch(selectedTourneyId, poolMatchToSave);
    }

    // Refresh state Bagan Bracket
    setLiveBracket(getStoredBracket(selectedTourneyId));

    if (onPublishScore) {
      onPublishScore(
        selectedTourneyId,
        `Pertandingan Selesai: ${winnerName} menang atas ${loserName} (${setSummary})`
      );
    }

    // 3. Catat di riwayat lembar wasit
    setScoreHistory((prev) => [
      `[SELESAI & DIPUBLIKASIKAN] ${matchPhase}: ${winnerName} menang atas ${loserName} (${finalScoreA}-${finalScoreB}). Lolos: ${bracketAdvancement.advancedTo || 'Babak Selanjutnya'}.`,
      ...prev
    ]);

    // 4. Tampilkan pesan feedback sukses
    let msg = `Pertandingan ${matchPhase} resmi SELESAI! Skor telah dipublikasikan ke sistem tamu. Tim "${winnerName}" otomatis lolos ke babak berikutnya di bracket (${bracketAdvancement.advancedTo || 'Babak Selanjutnya'})!`;
    if (isGrandFinal) {
      msg = `🎉 GRAND FINAL SELESAI! Selamat kepada "${winnerName}" sebagai JUARA 1 (Gold Champion)! Podium juara turnamen & Hall of Fame telah resmi diperbarui!`;
    }
    setPublishSuccessMessage(msg);
    setTimeout(() => {
      setPublishSuccessMessage(null);
    }, 7000);
  };

  // State for login loading indicator
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Handle Login Submission via MySQL / SHA-256 API
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setAuthError('Harap masukkan username wasit atau admin.');
      return;
    }

    if (!cleanPass) {
      setAuthError('Harap masukkan kata sandi / PIN.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await apiLogin(cleanUser, cleanPass);
      if (!res.success || !res.user) {
        setAuthError(res.error || 'Username atau kata sandi / PIN tidak sesuai.');
        return;
      }

      // Login successful
      setIsAuthenticated(true);
      const accType = res.user.account_type || (res.user.username === 'admin' ? 'admin' : 'wasit');
      setLoggedInUser({
        username: res.user.username,
        name: res.user.name,
        role: res.user.role || (accType === 'admin' ? 'Super Admin / Panitia Pusat' : 'Wasit Pertandingan'),
        account_type: accType
      });

      if (res.user.account_type === 'admin') {
        setActivePortalTab('tournament-manager');
      } else {
        setActivePortalTab('referee');
      }
      setAuthError('');
    } catch (err: any) {
      setAuthError('Terjadi kesalahan saat memverifikasi akun.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setLoggedInUser(null);
    setAuthError('');
  };

  // IF NOT AUTHENTICATED: Tampilkan Halaman Login Wasit & Admin
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F6FAF9] flex items-center justify-center p-4 sm:p-6 selection:bg-[#006A6A] selection:text-white">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#D8DFDE] p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header Icon & Branding */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-[#006A6A]/10 border border-[#006A6A]/30 flex items-center justify-center mx-auto text-[#006A6A] shadow-inner">
              <ShieldCheck className="w-9 h-9 text-[#006A6A]" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-mono font-bold uppercase tracking-wider">
                <Lock className="w-3 h-3 text-amber-600" />
                Akses Terbatas Wasit & Panitia
              </span>
              <h2 className="text-2xl font-black text-[#191C1C] font-display mt-1">
                Login Portal Wasit & Admin
              </h2>
              <p className="text-xs text-[#6F7978] mt-1">
                Silakan masukkan username dan kata sandi resmi untuk mengakses lembar skoring dan manajemen turnamen.
              </p>
            </div>
          </div>

          {/* Error Alert Message */}
          {authError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">Akses Ditolak</p>
                <p className="text-[11px] leading-relaxed">{authError}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Field Username */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-[#3D5A57] uppercase font-bold">
                Username Wasit / Admin:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6F7978]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Contoh: wasit, wasit1, atau admin"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D8DFDE] bg-[#F6FAF9] text-[#191C1C] text-sm focus:outline-none focus:border-[#006A6A] focus:bg-white transition-all font-medium"
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            {/* Field Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono text-[#3D5A57] uppercase font-bold">
                  Kata Sandi / PIN:
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6F7978]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan kata sandi atau PIN"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-[#D8DFDE] bg-[#F6FAF9] text-[#191C1C] text-sm focus:outline-none focus:border-[#006A6A] focus:bg-white transition-all font-medium"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6F7978] hover:text-[#191C1C] cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl bg-[#006A6A] hover:bg-[#007A7C] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#006A6A]/20 cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isLoggingIn ? 'Memverifikasi Akun...' : 'Masuk ke Portal'}</span>
            </button>
          </form>

          {/* Tombol Batalkan / Kembali ke Tamu */}
          <div className="pt-2 border-t border-[#D8DFDE] text-center">
            <button
              onClick={onBackToGuest}
              className="text-xs font-semibold text-[#6F7978] hover:text-[#006A6A] transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Halaman Utama (Tamu)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6FAF9] text-[#191C1C] pb-24">
      {/* Top Admin Bar */}
      <div className="bg-[#191C1C] text-white border-b border-neutral-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#006A6A] flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Portal Khusus Wasit & Admin
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-mono hidden sm:block">
                Manajemen Turnamen, Member, dan Lembar Skoring
              </p>
            </div>
          </div>

          {/* User Profile Badge & Logout Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-xs text-white">
              <User className="w-3.5 h-3.5 text-teal-300" />
              <span className="font-bold">{loggedInUser?.name || 'Wasit Resmi'}</span>
              <span className="text-[10px] text-teal-300 font-mono">({loggedInUser?.role})</span>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-all border border-neutral-700 cursor-pointer"
              title="Keluar dari sesi wasit"
            >
              <LogOut className="w-3.5 h-3.5 text-amber-400" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Navigation Tabs: Kelola Turnamen, Member Klub, Alokasi Pool, Undian Grup, Bracket Knock Out, Lembar Wasit */}
        <div className="p-1.5 rounded-2xl bg-white border border-[#D8DFDE] shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
            {/* Tab 0: Kelola Turnamen (Admin) */}
            <button
              type="button"
              onClick={() => setActivePortalTab('tournament-manager')}
              className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activePortalTab === 'tournament-manager'
                  ? 'bg-[#006A6A] text-white shadow-sm'
                  : 'text-[#3D5A57] hover:text-[#006A6A] hover:bg-[#F6FAF9]'
              }`}
            >
              <Trophy className="w-4 h-4 text-emerald-300" />
              <span>Kelola Turnamen</span>
            </button>

            {/* Tab 1: Member Klub & Foto (Admin) */}
            <button
              type="button"
              onClick={() => setActivePortalTab('member')}
              className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activePortalTab === 'member'
                  ? 'bg-[#006A6A] text-white shadow-sm'
                  : 'text-[#3D5A57] hover:text-[#006A6A] hover:bg-[#F6FAF9]'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-300" />
              <span>Member</span>
            </button>

            {/* Tab 2: Alokasi Member ke Pool (BARU!) */}
            <button
              type="button"
              onClick={() => setActivePortalTab('pool-allocation')}
              className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activePortalTab === 'pool-allocation'
                  ? 'bg-[#006A6A] text-white shadow-sm'
                  : 'text-[#3D5A57] hover:text-[#006A6A] hover:bg-[#F6FAF9]'
              }`}
            >
              <Layers className="w-4 h-4 text-teal-300" />
              <span>Alokasi Pool</span>
            </button>

            {/* Tab 3: Undian & Acak Grup (Admin) */}
            <button
              type="button"
              onClick={() => setActivePortalTab('group-draw')}
              className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activePortalTab === 'group-draw'
                  ? 'bg-[#006A6A] text-white shadow-sm'
                  : 'text-[#3D5A57] hover:text-[#006A6A] hover:bg-[#F6FAF9]'
              }`}
            >
              <Shuffle className="w-4 h-4 text-amber-300" />
              <span>Undian Grup</span>
            </button>

            {/* Tab 4: Bracket Knock Out (Super Admin) */}
            <button
              type="button"
              onClick={() => setActivePortalTab('bracket')}
              className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activePortalTab === 'bracket'
                  ? 'bg-[#006A6A] text-white shadow-sm'
                  : 'text-[#3D5A57] hover:text-[#006A6A] hover:bg-[#F6FAF9]'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-300" />
              <span>Bagan Bracket</span>
            </button>

            {/* Tab 5: Lembar Skoring Wasit Digital */}
            <button
              type="button"
              onClick={() => setActivePortalTab('referee')}
              className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activePortalTab === 'referee'
                  ? 'bg-[#006A6A] text-white shadow-sm'
                  : 'text-[#3D5A57] hover:text-[#006A6A] hover:bg-[#F6FAF9]'
              }`}
            >
              <Radio className="w-4 h-4 text-red-400 animate-pulse" />
              <span>Skoring Wasit</span>
            </button>
          </div>
        </div>

        {/* Unified Active Tournament Selector Bar (For Undian Grup, Bagan Bracket, and Skoring Wasit) */}
        {(activePortalTab === 'group-draw' || activePortalTab === 'bracket' || (activePortalTab === 'referee' && liveTournaments.length > 0)) && (
          <div className="p-4 rounded-2xl bg-white border border-[#D8DFDE] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#006A6A]/10 text-[#006A6A] flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-[#6F7978] font-bold">
                  Turnamen yang Sedang Dikelola:
                </div>
                <div className="text-xs font-bold text-[#191C1C] flex items-center gap-2 flex-wrap">
                  <span>{tournaments.find((t) => t.id === selectedTourneyId)?.name || 'Pilih Turnamen'}</span>
                  <span className="text-[#6F7978] font-normal">
                    · {tournaments.find((t) => t.id === selectedTourneyId)?.location}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    tournaments.find((t) => t.id === selectedTourneyId)?.status === 'Live'
                      ? 'bg-emerald-100 text-emerald-800'
                      : tournaments.find((t) => t.id === selectedTourneyId)?.status === 'Akan Datang'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    {tournaments.find((t) => t.id === selectedTourneyId)?.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[11px] font-mono text-[#3D5A57] font-bold uppercase whitespace-nowrap">
                Ganti Turnamen{activePortalTab === 'referee' ? ' (Live)' : ''}:
              </label>
              <select
                value={selectedTourneyId}
                onChange={(e) => setSelectedTourneyId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#D8DFDE] bg-[#F6FAF9] text-xs font-bold text-[#191C1C] focus:outline-none focus:border-[#006A6A] cursor-pointer"
              >
                {activePortalTab === 'referee' ? (
                  liveTournaments.length === 0 ? (
                    <option value="" disabled>
                      (Tidak Ada Turnamen Live)
                    </option>
                  ) : (
                    liveTournaments.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.location}) · [LIVE]
                      </option>
                    ))
                  )
                ) : tournaments.length === 0 ? (
                  <option value="" disabled>
                    (Belum Ada Turnamen)
                  </option>
                ) : (
                  tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.location}) · [{t.status}]
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        )}

        {/* TAB 0: MANAJEMEN TURNAMEN (BUAT, EDIT, HAPUS & STATUS) - HANYA AKSES ADMIN */}
        {activePortalTab === 'tournament-manager' && (
          <div className="animate-in fade-in duration-200">
            {isAdminUser ? (
              <AdminTournamentManager
                onOpenTournamentDetail={(id) => {
                  setSelectedTourneyId(id);
                  onBackToGuest();
                }}
                onNavigateToBracket={(id) => {
                  setSelectedTourneyId(id);
                  setActivePortalTab('bracket');
                }}
                onNavigateToReferee={(id) => {
                  setSelectedTourneyId(id);
                  setActivePortalTab('referee');
                }}
              />
            ) : (
              <div className="p-8 rounded-3xl bg-white border border-[#D8DFDE] text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#191C1C]">Akses Terbatas: Hanya Administrator Turnamen</h3>
                <p className="text-xs text-[#6F7978] max-w-md mx-auto">
                  Halaman pembuatan dan pengelolaan status turnamen hanya dapat diakses oleh user dengan tipe Administrator (admin). Akun wasit hanya memiliki izin pengisian lembar skoring pertandingan.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 1: MANAJEMEN MEMBER KLUB & FOTO (HANYA AKSES ADMIN) */}
        {activePortalTab === 'member' && (
          <div className="animate-in fade-in duration-200">
            {isAdminUser ? (
              <AdminMemberManager
                onMemberUpdated={() => {
                  setPublishSuccessMessage('Data member klub dan foto berhasil disinkronkan ke seluruh sistem!');
                  setTimeout(() => setPublishSuccessMessage(null), 4000);
                }}
              />
            ) : (
              <div className="p-8 rounded-3xl bg-white border border-[#D8DFDE] text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#191C1C]">Akses Terbatas: Hanya Administrator Turnamen</h3>
                <p className="text-xs text-[#6F7978] max-w-md mx-auto">
                  Halaman penambahan dan pengelolaan member klub hanya dapat diakses oleh akun Administrator. Akun wasit hanya memiliki izin pengisian lembar skor.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB BARU: ALOKASI MEMBER KE POOL / GRUP TURNAMEN (DATABASE SQLITE TERPUSAT) */}
        {activePortalTab === 'pool-allocation' && (
          <div className="animate-in fade-in duration-200">
            {isAdminUser ? (
              <AdminMemberPoolAllocation
                initialTournamentId={selectedTourneyId}
                onAllocationChanged={() => {
                  setPublishSuccessMessage('Penempatan member ke pool berhasil disimpan ke Database SQLite!');
                  setTimeout(() => setPublishSuccessMessage(null), 4000);
                }}
              />
            ) : (
              <div className="p-8 rounded-3xl bg-white border border-[#D8DFDE] text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#191C1C]">Akses Terbatas: Hanya Administrator Turnamen</h3>
                <p className="text-xs text-[#6F7978] max-w-md mx-auto">
                  Fitur alokasi dan penempatan member ke grup/pool turnamen hanya dapat diakses oleh akun Administrator.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: UNDIAN & PENERAPAN PEMAIN KE GRUP (ADMIN) */}
        {activePortalTab === 'group-draw' && (
          <div className="animate-in fade-in duration-200">
            {isAdminUser ? (
              <AdminGroupDrawManager
                initialTournamentId={selectedTourneyId}
                onGroupsSaved={() => {
                  setPublishSuccessMessage('Susunan grup turnamen berhasil diperbarui!');
                  setTimeout(() => setPublishSuccessMessage(null), 4000);
                }}
              />
            ) : (
              <div className="p-8 rounded-3xl bg-white border border-[#D8DFDE] text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#191C1C]">Akses Terbatas: Hanya Administrator Turnamen</h3>
                <p className="text-xs text-[#6F7978] max-w-md mx-auto">
                  Fitur pembagian grup dan undian acak hanya dapat dijalankan oleh akun Administrator.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SUPER ADMIN BRACKET MANAGER */}
        {activePortalTab === 'bracket' && (
          <div className="animate-in fade-in duration-200">
            {isAdminUser ? (
              <SuperAdminBracketManager
                initialTournamentId={selectedTourneyId}
                onBracketSaved={() => {
                  setPublishSuccessMessage('Bagan sistem gugur berhasil disimpan dan dipublikasikan!');
                  setTimeout(() => setPublishSuccessMessage(null), 4000);
                }}
            />
            ) : (
              <div className="p-8 rounded-3xl bg-white border border-[#D8DFDE] text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#191C1C]">Akses Terbatas: Hanya Administrator Turnamen</h3>
                <p className="text-xs text-[#6F7978] max-w-md mx-auto">
                  Fitur Bagan Bracket hanya dapat dijalankan oleh akun Administrator.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: REFEREE LIVE SCORING SHEET */}
        {activePortalTab === 'referee' && (
          liveTournaments.length === 0 ? (
            <div className="p-8 sm:p-14 rounded-3xl bg-white border border-[#D8DFDE] shadow-xs text-center space-y-4 max-w-xl mx-auto my-10 animate-in fade-in duration-200">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <Radio className="w-8 h-8 opacity-60 text-amber-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-[#191C1C] font-display">
                  Tidak Ada Turnamen dengan Status Live Saat Ini
                </h3>
                <p className="text-xs sm:text-sm text-[#6F7978] leading-relaxed max-w-md mx-auto">
                  Laman skoring wasit dinonaktifkan sementara karena saat ini tidak ada turnamen yang berstatus Live. Lembar skoring hanya dapat diakses saat pertandingan aktif berlangsung guna menghindari kesalahan pemberian skor pada turnamen yang telah selesai.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Toast confirmation */}
              {publishSuccessMessage && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 shadow-md flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-2.5 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{publishSuccessMessage}</span>
                  </div>
                  <button
                    onClick={() => setPublishSuccessMessage(null)}
                    className="text-xs font-bold text-emerald-700 underline"
                  >
                    Tutup
                  </button>
                </div>
              )}

            {/* Referee Dashboard Controller Header */}
            <div className="p-6 rounded-3xl bg-white border border-[#D8DFDE] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-[#191C1C] font-display">
                Pengaturan Meja Wasit & Pemilihan Pertandingan
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-200 text-xs font-bold">
                <Radio className="w-3.5 h-3.5 animate-pulse text-red-600" />
                <span>Status: WASIT LIVE</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-[#D8DFDE] text-xs">
            {/* Select Tournament */}
            <div>
              <label className="block text-[#6F7978] font-mono text-[11px] uppercase font-bold mb-1">
                Turnamen Live:
              </label>
              <select
                value={selectedTourneyId}
                onChange={(e) => setSelectedTourneyId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D8DFDE] bg-[#F6FAF9] text-[#191C1C] font-semibold focus:outline-none focus:border-[#006A6A]"
              >
                {liveTournaments.length === 0 ? (
                  <option value="" disabled>(Tidak Ada Turnamen Live)</option>
                ) : (
                  liveTournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.location}) · [LIVE]
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Select Court */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[#6F7978] font-mono text-[11px] uppercase font-bold">
                  Nomor Lapangan (Court):
                </label>
                <span className="text-[10px] text-[#006A6A] font-bold">
                  Court #{activeCourt}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5, 6].map((courtNum) => (
                  <button
                    key={courtNum}
                    type="button"
                    onClick={() => handleSelectCourt(courtNum)}
                    className={`flex-1 py-2 rounded-xl font-bold font-mono text-xs transition-all cursor-pointer ${
                      activeCourt === courtNum
                        ? 'bg-[#006A6A] text-white shadow-xs'
                        : 'bg-[#F6FAF9] text-[#3D5A57] border border-[#D8DFDE] hover:border-[#006A6A]'
                    }`}
                    title={`Pilih Court ${courtNum} (otomatis perbarui nomor lapangan pertandingan di Bagan Bracket)`}
                  >
                    C{courtNum}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Phase */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[#6F7978] font-mono text-[11px] uppercase font-bold">
                  Babak Pertandingan:
                </label>
                <button
                  type="button"
                  onClick={handleLoadTeamsFromBracket}
                  className="text-[10px] text-[#006A6A] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  title="Ambil nama pasangan tim yang terjadwal di bagan sistem gugur untuk babak ini"
                >
                  <Users className="w-3 h-3" />
                  <span>Muat Bagan</span>
                </button>
              </div>
              <select
                value={matchPhase}
                onChange={(e) => setMatchPhase(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D8DFDE] bg-[#F6FAF9] text-[#191C1C] font-semibold focus:outline-none focus:border-[#006A6A] cursor-pointer"
              >
                <optgroup
                  label={`Babak Sistem Gugur (${activePoolCount} Pool · ${
                    hasRoundOf16
                      ? 'R16, QF, SF & Final'
                      : hasQuarters
                      ? 'QF, SF & Final'
                      : hasSemis
                      ? 'SF & Final'
                      : 'Grand Final'
                  })`}
                >
                  <option value="Grand Final">Grand Final (Gold Match)</option>
                  <option value="Perebutan Juara 3">Perebutan Juara 3 (Bronze Match)</option>
                  {hasSemis && (
                    <>
                      <option value="Semifinal 1">Semifinal 1</option>
                      <option value="Semifinal 2">Semifinal 2</option>
                    </>
                  )}
                  {hasQuarters && (
                    <>
                      <option value="Perempat Final 1">Perempat Final 1 (QF 1)</option>
                      <option value="Perempat Final 2">Perempat Final 2 (QF 2)</option>
                      <option value="Perempat Final 3">Perempat Final 3 (QF 3)</option>
                      <option value="Perempat Final 4">Perempat Final 4 (QF 4)</option>
                    </>
                  )}
                  {hasRoundOf16 && (
                    <>
                      <option value="Babak 16 Besar 1">Babak 16 Besar (R16 #1)</option>
                      <option value="Babak 16 Besar 2">Babak 16 Besar (R16 #2)</option>
                      <option value="Babak 16 Besar 3">Babak 16 Besar (R16 #3)</option>
                      <option value="Babak 16 Besar 4">Babak 16 Besar (R16 #4)</option>
                      <option value="Babak 16 Besar 5">Babak 16 Besar (R16 #5)</option>
                      <option value="Babak 16 Besar 6">Babak 16 Besar (R16 #6)</option>
                      <option value="Babak 16 Besar 7">Babak 16 Besar (R16 #7)</option>
                      <option value="Babak 16 Besar 8">Babak 16 Besar (R16 #8)</option>
                    </>
                  )}
                </optgroup>

                <optgroup label={`Babak Penyisihan Grup (${activePoolCount} Pool Aktif)`}>
                  {activePools.map((p) => (
                    <option key={p} value={`${p} Match`}>
                      {p} Match
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Select Match Pair (Pasangan Tim A dan Tim B sesuai Bagan Bracket) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[#6F7978] font-mono text-[11px] uppercase font-bold truncate">
                  Pasangan Tim A dan Tim B:
                </label>
              </div>
              <select
                value={selectedMatchId}
                onChange={(e) => handleSelectMatchPair(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D8DFDE] bg-[#F6FAF9] text-[#191C1C] font-semibold focus:outline-none focus:border-[#006A6A] cursor-pointer"
              >
                {phaseMatchList.length === 0 ? (
                  <option value="" disabled>(Belum ada data bagan babak ini)</option>
                ) : (
                  phaseMatchList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Digital Referee Sheet & Controller */}
        <div
          ref={scoreboardRef}
          className={
            isScoreboardFullscreen
              ? 'fixed inset-0 z-50 overflow-y-auto bg-[#F6FAF9] p-4 sm:p-8 space-y-6 shadow-2xl animate-in fade-in duration-200'
              : 'rounded-3xl border border-[#D8DFDE] bg-white p-6 sm:p-8 space-y-6 shadow-md relative overflow-hidden'
          }
        >
          {/* Top Banner when in Full Screen Mode */}
          {isScoreboardFullscreen && (
            <div className="bg-[#191C1C] text-white px-4 sm:px-6 py-3 rounded-2xl flex items-center justify-between shadow-lg mb-2">
              <div className="flex items-center gap-2.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-mono font-bold tracking-wider uppercase text-emerald-300">
                  Mode Layar Penuh (Scoreboard Full Screen Wasit)
                </span>
                <span className="text-neutral-400 hidden sm:inline">
                  · Tekan tombol [Esc] pada keyboard atau tombol merah untuk keluar
                </span>
              </div>
              <button
                type="button"
                onClick={toggleScoreboardFullscreen}
                className="px-3.5 py-1.5 rounded-xl bg-[#BA1A1A] hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Keluar Full Screen</span>
              </button>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D8DFDE] pb-4 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#006A6A] font-bold">
                  {selectedTourneyData ? selectedTourneyData.name : 'Belum Ada Turnamen Aktif (Skoring Mandiri)'}
                </span>
                <span className="text-xs text-[#6F7978]">·</span>
                <span className="text-xs font-mono font-bold text-[#191C1C]">
                  {matchPhase} (Court #{activeCourt})
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#191C1C]">
                Official Electronic Score Sheet
              </h3>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {goldenPointActive && (
                <span className="px-2.5 py-1 rounded-full bg-[#BA1A1A] text-white text-xs font-black animate-pulse shadow-md">
                  ⚡ GOLDEN POINT AKTIF
                </span>
              )}
              <span className="px-2.5 py-1 rounded-lg bg-[#006A6A]/10 border border-[#006A6A]/30 text-[#006A6A] text-xs font-mono font-bold">
                REF-DESK ACTIVE
              </span>

              {/* Tombol Full Screen Lembar Skoring */}
              <button
                type="button"
                onClick={toggleScoreboardFullscreen}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  isScoreboardFullscreen
                    ? 'bg-[#BA1A1A] hover:bg-red-700 text-white'
                    : 'bg-white hover:bg-[#EEF4F3] text-[#191C1C] hover:text-[#006A6A] border border-[#D8DFDE]'
                }`}
                title={isScoreboardFullscreen ? 'Keluar Mode Layar Penuh (Esc)' : 'Buka kotak lembar skoring ini dalam mode Layar Penuh (Full Screen)'}
              >
                {isScoreboardFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Keluar Full Screen</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-[#006A6A]" />
                    <span>Full Screen</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Info Pasangan Pertandingan Aktif (Sesuai Pilihan di Pengaturan Meja Wasit & Bagan Bracket) */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#F6FAF9] border border-[#D8DFDE] text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-[10px] font-mono uppercase font-bold text-[#6F7978] shrink-0">
                Pertandingan:
              </span>
              <span className="font-extrabold text-[#191C1C] text-sm truncate">
                {teamAName} <span className="text-[#006A6A] font-black mx-1">VS</span> {teamBName}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono flex-wrap">
              <span className="px-2.5 py-1 rounded-lg bg-white border border-[#D8DFDE] font-bold text-[#006A6A] shadow-2xs">
                {matchPhase}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#006A6A] text-white font-bold shadow-2xs">
                Court #{activeCourt}
              </span>
              <button
                type="button"
                onClick={handleSwapCourtSides}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white hover:bg-[#EEF4F3] text-[#006A6A] hover:text-[#005050] font-bold border border-[#006A6A]/30 hover:border-[#006A6A] transition-all shadow-2xs cursor-pointer active:scale-95"
                title="Tukar pasangan tim dari sisi lapangan A dan sisi lapangan B"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-[#006A6A]" />
                <span>Tukar Sisi (A ⇄ B)</span>
              </button>
            </div>
          </div>

          {/* Main Score Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team A Card */}
            <div
              className={`p-6 rounded-2xl border transition-all ${
                currentServer === 'A'
                  ? 'bg-[#EEF4F3] border-[#006A6A] ring-2 ring-[#006A6A]/40 shadow-sm'
                  : 'bg-[#F6FAF9] border-[#D8DFDE]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-[#6F7978] uppercase font-bold">
                  Sisi Lapangan A
                </span>
                {currentServer === 'A' ? (
                  <span className="text-[11px] font-bold text-white bg-[#006A6A] px-3 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                    🎾 SERVING
                  </span>
                ) : (
                  <button
                    onClick={() => setCurrentServer('A')}
                    className="text-[10px] text-[#6F7978] hover:text-[#006A6A] underline cursor-pointer"
                  >
                    Set Servis ke Tim A
                  </button>
                )}
              </div>

              <h4 className="text-lg sm:text-xl font-extrabold text-[#191C1C] font-display mb-4">
                {teamAName}
              </h4>

              <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#D8DFDE] text-center">
                <div>
                  <span className="text-[10px] text-[#6F7978] uppercase block font-mono">Game Point</span>
                  <span className="text-4xl sm:text-5xl font-black font-mono text-[#006A6A]">
                    {pointLabels[courtScoreA]}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6F7978] uppercase block font-mono">Games</span>
                  <span className="text-3xl sm:text-4xl font-black font-mono text-[#191C1C]">
                    {gamesTeamA}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6F7978] uppercase block font-mono">Sets</span>
                  <span className="text-3xl sm:text-4xl font-black font-mono text-[#6E4D8B]">
                    {currentSetA}
                  </span>
                </div>
              </div>

              {/* Referee Action Button */}
              <button
                onClick={handlePointForA}
                className="w-full mt-4 py-3.5 rounded-xl bg-[#006A6A] hover:bg-[#007A7C] text-white font-black text-sm tracking-wide transition-all shadow-md shadow-[#006A6A]/20 cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <Flame className="w-5 h-5 text-white" />
                <span>+ TAMBAH POIN TIM A</span>
              </button>
            </div>

            {/* Team B Card */}
            <div
              className={`p-6 rounded-2xl border transition-all ${
                currentServer === 'B'
                  ? 'bg-[#EEF4F3] border-[#006A6A] ring-2 ring-[#006A6A]/40 shadow-sm'
                  : 'bg-[#F6FAF9] border-[#D8DFDE]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-[#6F7978] uppercase font-bold">
                  Sisi Lapangan B
                </span>
                {currentServer === 'B' ? (
                  <span className="text-[11px] font-bold text-white bg-[#006A6A] px-3 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                    🎾 SERVING
                  </span>
                ) : (
                  <button
                    onClick={() => setCurrentServer('B')}
                    className="text-[10px] text-[#6F7978] hover:text-[#006A6A] underline cursor-pointer"
                  >
                    Set Servis ke Tim B
                  </button>
                )}
              </div>

              <h4 className="text-lg sm:text-xl font-extrabold text-[#191C1C] font-display mb-4">
                {teamBName}
              </h4>

              <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#D8DFDE] text-center">
                <div>
                  <span className="text-[10px] text-[#6F7978] uppercase block font-mono">Game Point</span>
                  <span className="text-4xl sm:text-5xl font-black font-mono text-[#006A6A]">
                    {pointLabels[courtScoreB]}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6F7978] uppercase block font-mono">Games</span>
                  <span className="text-3xl sm:text-4xl font-black font-mono text-[#191C1C]">
                    {gamesTeamB}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6F7978] uppercase block font-mono">Sets</span>
                  <span className="text-3xl sm:text-4xl font-black font-mono text-[#6E4D8B]">
                    {currentSetB}
                  </span>
                </div>
              </div>

              {/* Referee Action Button */}
              <button
                onClick={handlePointForB}
                className="w-full mt-4 py-3.5 rounded-xl bg-[#006A6A] hover:bg-[#007A7C] text-white font-black text-sm tracking-wide transition-all shadow-md shadow-[#006A6A]/20 cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <Flame className="w-5 h-5 text-white" />
                <span>+ TAMBAH POIN TIM B</span>
              </button>
            </div>
          </div>

          {/* Quick Referee Tools Bar */}
          <div className="pt-4 border-t border-[#D8DFDE] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setCurrentServer(currentServer === 'A' ? 'B' : 'A')}
                className="px-3.5 py-2 rounded-xl bg-[#F6FAF9] hover:bg-[#EEF4F3] text-[#191C1C] font-semibold transition-colors cursor-pointer border border-[#D8DFDE]"
              >
                🎾 Ganti Server Bola
              </button>

              <button
                onClick={handleUndoPoint}
                disabled={historyStack.length === 0}
                className="px-3.5 py-2 rounded-xl bg-[#F6FAF9] hover:bg-[#EEF4F3] text-[#191C1C] font-semibold transition-colors cursor-pointer border border-[#D8DFDE] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Undo Poin ({historyStack.length})</span>
              </button>

              <button
                onClick={() => setGoldenPointActive(!goldenPointActive)}
                className={`px-3.5 py-2 rounded-xl font-semibold transition-colors cursor-pointer border ${
                  goldenPointActive
                    ? 'bg-red-500 text-white border-red-600'
                    : 'bg-[#F6FAF9] text-[#191C1C] border-[#D8DFDE]'
                }`}
              >
                {goldenPointActive ? '⚡ Nonaktifkan Golden Point' : '⚡ Aktifkan Golden Point'}
              </button>

              <button
                type="button"
                onClick={() => setShowResetScoreConfirmModal(true)}
                className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-[#BA1A1A] font-semibold transition-colors flex items-center gap-1 cursor-pointer border border-red-200"
                title="Kosongkan seluruh skor game, set, dan riwayat lembar wasit (0-0)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Kosongkan Skor Wasit (0-0)</span>
              </button>
            </div>

            {/* Tombol Selesai dan Publikasikan Skor ke Sistem Tamu */}
            <button
              type="button"
              onClick={handleOpenFinishConfirmModal}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-700/20 active:scale-98"
              title="Selesaikan pertandingan ini dan publikasikan skor resmi ke sistem tamu serta otomatis loloskan pemenang di bracket"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Selesai dan Publikasikan Skor ke Sistem Tamu</span>
            </button>
          </div>
        </div>

        {/* Referee Official Notes & Log Sheet */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notes by Referee */}
          <div className="p-5 rounded-2xl bg-white border border-[#D8DFDE] space-y-3 shadow-xs">
            <h4 className="text-xs font-mono font-bold uppercase text-[#191C1C] tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#006A6A]" />
              <span>Catatan Berita Acara Wasit (Official Match Sheet)</span>
            </h4>
            <textarea
              rows={4}
              value={officialRefereeNotes}
              onChange={(e) => setOfficialRefereeNotes(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] text-xs text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
              placeholder="Tuliskan catatan kejadian lapangan, medical timeout, atau kartu pelanggaran..."
            />
            <div className="flex items-center justify-between text-[11px] text-[#6F7978]">
              <span>Status Dokumen: Disahkan Wasit Kepala FIP</span>
              <button
                onClick={() => {
                  setPublishSuccessMessage('Catatan berita acara wasit berhasil disimpan.');
                  setTimeout(() => setPublishSuccessMessage(null), 3000);
                }}
                className="font-bold text-[#006A6A] hover:underline"
              >
                Simpan Catatan
              </button>
            </div>
          </div>

          {/* Point by Point History Log */}
          <div className="p-5 rounded-2xl bg-white border border-[#D8DFDE] space-y-3 shadow-xs">
            <h4 className="text-xs font-mono font-bold uppercase text-[#6F7978] tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#006A6A]" />
              <span>Log Skor Wasit Real-time</span>
            </h4>
            <div className="space-y-1.5 text-xs text-[#3D5A57] font-mono max-h-44 overflow-y-auto pr-1">
              {scoreHistory.length === 0 ? (
                <div className="p-4 text-center text-[#6F7978] bg-[#F6FAF9] rounded-xl border border-dashed border-[#D8DFDE] text-xs">
                  Belum ada riwayat skor pertandingan tercatat (data skoring wasit dikosongkan).
                </div>
              ) : (
                scoreHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-lg bg-[#F6FAF9] border border-[#D8DFDE] text-[#191C1C]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006A6A] shrink-0" />
                    <span className="truncate">{item}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
            </div>
          )
        )}

        {/* Bottom Exit Bar */}
        {!(activePortalTab === 'referee' && liveTournaments.length === 0) && (
          <div className="p-4 rounded-2xl bg-[#EEF4F3] border border-[#D8DFDE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#3D5A57]">
              <ShieldCheck className="w-4 h-4 text-[#006A6A]" />
              <span>Mode Wasit Aktif. Semua penambahan poin tersimpan secara lokal dan dapat disinkronkan ke tamu.</span>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold border border-neutral-300 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout Wasit</span>
              </button>
              <button
                onClick={onBackToGuest}
                className="px-4 py-2 rounded-xl bg-white hover:bg-[#D8DFDE] text-[#191C1C] font-bold border border-[#CBD5D4] transition-all cursor-pointer"
              >
                ← Kembali ke Mode Tamu
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL PERINGATAN & KONFIRMASI: SELESAIKAN PERTANDINGAN & PUBLIKASIKAN KE SISTEM TAMU */}
      {showFinishConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-[#D8DFDE] shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header Icon & Title */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0 shadow-xs">
                  <AlertTriangle className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-amber-800 tracking-wider">
                    Peringatan & Konfirmasi Meja Wasit
                  </span>
                  <h3 className="text-lg font-black text-[#191C1C] font-display">
                    Selesaikan Pertandingan & Publikasikan
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFinishConfirmModal(false)}
                className="p-1.5 rounded-xl text-[#6F7978] hover:text-[#191C1C] hover:bg-[#F6FAF9] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Kotak Peringatan & Pertanyaan Sesuai Permintaan User */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2">
              <p className="text-sm font-black text-amber-950 leading-relaxed">
                Apakah pertandingan sudah selesai dan akan mempublikasikan skor ke sistem tamu?
              </p>
              <p className="text-xs text-amber-800 leading-relaxed">
                Jika Anda memilih <strong>Ya</strong>, maka pertandingan ini resmi dinyatakan selesai. Tim yang menang akan <strong>otomatis lolos ke babak berikutnya di bagan sistem gugur (bracket)</strong> dan hasil akhir langsung tercatat di sistem tamu.
              </p>
            </div>

            {/* Ringkasan Skor & Babak Pertandingan */}
            <div className="p-4 rounded-2xl bg-[#F6FAF9] border border-[#D8DFDE] space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#D8DFDE] text-[#6F7978] font-mono text-[11px]">
                <span className="font-bold text-[#191C1C]">{selectedTourneyData?.name || 'Turnamen Aktif'}</span>
                <span className="font-bold text-[#006A6A]">{matchPhase} (Court #{activeCourt})</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[#191C1C] text-sm">{teamAName}</div>
                  <div className="font-mono font-bold text-[#006A6A]">
                    Set: {currentSetA} · Games: {gamesTeamA} · Poin: {pointLabels[courtScoreA]}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[#191C1C] text-sm">{teamBName}</div>
                  <div className="font-mono font-bold text-[#006A6A]">
                    Set: {currentSetB} · Games: {gamesTeamB} · Poin: {pointLabels[courtScoreB]}
                  </div>
                </div>
              </div>
            </div>

            {/* Pilihan Tim Pemenang untuk Meloloskan ke Bracket */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase font-bold text-[#3D5A57]">
                Pilih Tim Pemenang yang Otomatis Lolos ke Babak Selanjutnya:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedWinnerChoice('A')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    selectedWinnerChoice === 'A'
                      ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/30'
                      : 'bg-[#F6FAF9] border-[#D8DFDE] hover:border-[#006A6A]'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-mono text-[#6F7978] uppercase block">Tim A</span>
                    <span className="text-xs font-bold text-[#191C1C] truncate block">{teamAName}</span>
                  </div>
                  {selectedWinnerChoice === 'A' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-[#D8DFDE]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedWinnerChoice('B')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    selectedWinnerChoice === 'B'
                      ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/30'
                      : 'bg-[#F6FAF9] border-[#D8DFDE] hover:border-[#006A6A]'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-mono text-[#6F7978] uppercase block">Tim B</span>
                    <span className="text-xs font-bold text-[#191C1C] truncate block">{teamBName}</span>
                  </div>
                  {selectedWinnerChoice === 'B' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-[#D8DFDE]" />
                  )}
                </button>
              </div>
            </div>

            {/* Tombol Pilihan Ya dan Tidak Sesuai Permintaan User */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowFinishConfirmModal(false)}
                className="px-5 py-2.5 rounded-xl border border-[#D8DFDE] bg-white hover:bg-neutral-100 text-[#191C1C] font-bold text-xs cursor-pointer transition-all shadow-xs"
              >
                Tidak
              </button>

              <button
                type="button"
                onClick={handleConfirmFinishAndPublish}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs cursor-pointer shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2 active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Ya</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DIALOG BOX: KONFIRMASI KOSONGKAN SKOR WASIT (0-0) */}
      {showResetScoreConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#D8DFDE] shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header Icon & Title */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-300 flex items-center justify-center text-[#BA1A1A] shrink-0 shadow-xs">
                  <RotateCcw className="w-6 h-6 text-[#BA1A1A]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-red-700 tracking-wider">
                    Peringatan Meja Wasit
                  </span>
                  <h3 className="text-lg font-black text-[#191C1C] font-display">
                    Kosongkan Skor Wasit (0-0)?
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResetScoreConfirmModal(false)}
                className="p-1.5 rounded-xl text-[#6F7978] hover:text-[#191C1C] hover:bg-[#F6FAF9] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Kotak Peringatan */}
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-950 space-y-1.5">
              <p className="text-xs font-bold leading-relaxed">
                Apakah Anda yakin ingin mengosongkan seluruh skor lembar wasit ini menjadi 0-0?
              </p>
              <p className="text-[11px] text-red-800 leading-relaxed">
                Tindakan ini akan mereset seluruh game point, games, sets, dan riwayat skoring untuk pertandingan ini. Ini tidak dapat di-undo.
              </p>
            </div>

            {/* Ringkasan Pertandingan Yang Sedang Dipilih */}
            <div className="p-3.5 rounded-2xl bg-[#F6FAF9] border border-[#D8DFDE] text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-[#6F7978] text-[10px]">
                <span>Pertandingan Terpilih:</span>
                <span className="font-bold text-[#006A6A]">{matchPhase} · Court #{activeCourt}</span>
              </div>
              <div className="font-sans font-bold text-[#191C1C] text-sm">
                {teamAName} <span className="text-[#006A6A]">vs</span> {teamBName}
              </div>
              <div className="text-[11px] text-[#3D5A57] pt-1 border-t border-[#D8DFDE]">
                Skor saat ini: Set {currentSetA}-{currentSetB} · Games {gamesTeamA}-{gamesTeamB} · Poin {pointLabels[courtScoreA]}-{pointLabels[courtScoreB]}
              </div>
            </div>

            {/* Tombol Aksi Batal / Ya Kosongkan */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowResetScoreConfirmModal(false)}
                className="px-5 py-2.5 rounded-xl border border-[#D8DFDE] bg-white hover:bg-neutral-100 text-[#191C1C] font-bold text-xs cursor-pointer transition-all shadow-xs"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleConfirmResetScore}
                className="px-6 py-2.5 rounded-xl bg-[#BA1A1A] hover:bg-red-700 text-white font-black text-xs cursor-pointer shadow-md shadow-red-600/20 transition-all flex items-center gap-2 active:scale-98"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ya, Kosongkan Skor (0-0)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
