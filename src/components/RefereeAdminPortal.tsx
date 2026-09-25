import React, { useState, useEffect, useRef } from 'react';
import {
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
  Crown
} from 'lucide-react';
import { PADEL_TOURNAMENTS_DATA } from '../data/padelProTournamentsData';
import { SuperAdminBracketManager } from './SuperAdminBracketManager';

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
  } | null>(null);

  // Portal Tab: Super Admin Bracket Manager vs Wasit Digital Scorekeeper
  const [activePortalTab, setActivePortalTab] = useState<'bracket' | 'referee'>('bracket');

  // Tournament and match selection
  const [selectedTourneyId, setSelectedTourneyId] = useState<string>('rookie-mix');
  const [activeCourt, setActiveCourt] = useState<number>(2);
  const [matchPhase, setMatchPhase] = useState<string>('Grand Final');

  // Referee Scoring Sheet State
  const [teamAName, setTeamAName] = useState<string>('Olivia & Rico');
  const [teamBName, setTeamBName] = useState<string>('Kartika & Dodie');
  const [courtScoreA, setCourtScoreA] = useState<number>(2); // 0=0, 1=15, 2=30, 3=40
  const [courtScoreB, setCourtScoreB] = useState<number>(1);
  const [gamesTeamA, setGamesTeamA] = useState<number>(3);
  const [gamesTeamB, setGamesTeamB] = useState<number>(2);
  const [currentSetA, setCurrentSetA] = useState<number>(1);
  const [currentSetB, setCurrentSetB] = useState<number>(0);
  const [currentServer, setCurrentServer] = useState<'A' | 'B'>('A');
  const [goldenPointActive, setGoldenPointActive] = useState<boolean>(false);
  const [officialRefereeNotes, setOfficialRefereeNotes] = useState<string>('Pertandingan berjalan kondusif sesuai regulasi FIP Padel Pro.');
  const [publishSuccessMessage, setPublishSuccessMessage] = useState<string | null>(null);

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
  }[]>([]);

  // Match live log
  const [scoreHistory, setScoreHistory] = useState<string[]>([
    'Game 1 dimenangkan Tim A (40-15)',
    'Game 2 dimenangkan Tim B (Golden Point 40-40)',
    'Game 3 dimenangkan Tim A (40-30)',
    'Game 4 dimenangkan Tim B (40-0)',
    'Game 5 dimenangkan Tim A (40-30)'
  ]);

  const pointLabels = ['0', '15', '30', '40'];

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
        golden: goldenPointActive
      },
      ...prev.slice(0, 10)
    ]);
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
    setHistoryStack(rest);
    setScoreHistory((prev) => [`[UNDO] Wasit membatalkan poin terakhir`, ...prev]);
  };

  const resetCurrentGame = () => {
    pushHistorySnapshot();
    setCourtScoreA(0);
    setCourtScoreB(0);
    setGoldenPointActive(false);
    setScoreHistory((prev) => [`Game di-reset wasit menjadi 0-0`, ...prev]);
  };

  const handlePublishToLive = () => {
    const summary = `${matchPhase}: ${teamAName} (${gamesTeamA}) vs ${teamBName} (${gamesTeamB}) - Set [${currentSetA}-${currentSetB}]`;
    if (onPublishScore) {
      onPublishScore(selectedTourneyId, summary);
    }
    setPublishSuccessMessage(`Skor resmi Court ${activeCourt} berhasil dipublikasikan ke papan informasi turnamen!`);
    setTimeout(() => {
      setPublishSuccessMessage(null);
    }, 4000);
  };

  // Handle Login Submission
  const handleLoginSubmit = (e: React.FormEvent) => {
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

    const account = AUTHORIZED_ACCOUNTS[cleanUser];
    if (!account) {
      setAuthError(`Username "${cleanUser}" tidak terdaftar atau tidak memiliki akses wasit/admin.`);
      return;
    }

    if (!account.password.includes(cleanPass)) {
      setAuthError(`Kata sandi / PIN salah untuk akun "${cleanUser}".`);
      return;
    }

    // Login successful
    setIsAuthenticated(true);
    setLoggedInUser({
      username: cleanUser,
      name: account.name,
      role: account.role
    });
    if (cleanUser === 'admin') {
      setActivePortalTab('bracket');
    }
    setAuthError('');
  };

  const handleQuickLogin = (quickUser: string, quickPass: string) => {
    setUsername(quickUser);
    setPassword(quickPass);
    setAuthError('');
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
              className="w-full py-3 rounded-xl bg-[#006A6A] hover:bg-[#007A7C] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#006A6A]/20 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Masuk ke Lembar Skoring Wasit</span>
            </button>
          </form>

          {/* Akun Demo / Bantuan Pengujian Cepat */}
          <div className="p-3.5 rounded-2xl bg-[#EEF4F3] border border-[#D8DFDE] space-y-2">
            <span className="text-[10px] font-mono uppercase text-[#006A6A] font-bold block tracking-wider">
              Pilihan Akun Resmi untuk Pengujian Cepat:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('wasit', '1234')}
                className="p-2 rounded-lg bg-white hover:bg-emerald-50 border border-[#D8DFDE] hover:border-emerald-300 text-left transition-all cursor-pointer group"
              >
                <div className="font-bold text-[#191C1C] group-hover:text-emerald-700 flex items-center justify-between">
                  <span>wasit</span>
                  <span className="text-[9px] font-mono px-1 rounded bg-neutral-100">PIN: 1234</span>
                </div>
                <div className="text-[10px] text-[#6F7978]">Wasit Utama FIP</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="p-2 rounded-lg bg-white hover:bg-emerald-50 border border-[#D8DFDE] hover:border-emerald-300 text-left transition-all cursor-pointer group"
              >
                <div className="font-bold text-[#191C1C] group-hover:text-emerald-700 flex items-center justify-between">
                  <span>admin</span>
                  <span className="text-[9px] font-mono px-1 rounded bg-neutral-100">admin123</span>
                </div>
                <div className="text-[10px] text-[#6F7978]">Super Admin Turnamen</div>
              </button>
            </div>
            <p className="text-[10px] text-[#6F7978] leading-tight pt-1">
              Klik salah satu akun di atas untuk mengisi formulir otomatis, lalu tekan tombol Masuk.
            </p>
          </div>

          {/* Tombol Batalkan / Kembali ke Tamu */}
          <div className="pt-2 border-t border-[#D8DFDE] text-center">
            <button
              onClick={onBackToGuest}
              className="text-xs font-semibold text-[#6F7978] hover:text-[#006A6A] transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>← Kembali ke Halaman Utama (Tamu)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedTourneyData = PADEL_TOURNAMENTS_DATA[selectedTourneyId] || PADEL_TOURNAMENTS_DATA['rookie-mix'];

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
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  OFFICIAL ACCESS
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-mono hidden sm:block">
                Lembar Skoring Elektronik Resmi · Terverifikasi
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
              <span>Keluar / Logout</span>
            </button>

            <button
              onClick={onBackToGuest}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#006A6A] hover:bg-[#007A7C] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <span>Halaman Tamu</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Dual Portal Tabs: Super Admin Bracket & Wasit Skoring */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-[#D8DFDE] shadow-xs">
          <button
            type="button"
            onClick={() => setActivePortalTab('bracket')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activePortalTab === 'bracket'
                ? 'bg-[#006A6A] text-white shadow-sm'
                : 'text-[#3D5A57] hover:text-[#006A6A] hover:bg-[#F6FAF9]'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-300" />
            <span>Kelola Bracket Knock Out (Super Admin)</span>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-amber-400 text-amber-950 font-black">
              BAGAN SISTEM GUGUR
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActivePortalTab('referee')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activePortalTab === 'referee'
                ? 'bg-[#006A6A] text-white shadow-sm'
                : 'text-[#3D5A57] hover:text-[#006A6A] hover:bg-[#F6FAF9]'
            }`}
          >
            <Radio className="w-4 h-4 text-red-400 animate-pulse" />
            <span>Lembar Skoring Wasit Digital (Live Match)</span>
          </button>
        </div>

        {/* TAB 1: SUPER ADMIN BRACKET MANAGER */}
        {activePortalTab === 'bracket' && (
          <div className="animate-in fade-in duration-200">
            <SuperAdminBracketManager
              initialTournamentId={selectedTourneyId}
              onBracketSaved={() => {
                setPublishSuccessMessage('Bagan sistem gugur berhasil disimpan dan dipublikasikan!');
                setTimeout(() => setPublishSuccessMessage(null), 4000);
              }}
            />
          </div>
        )}

        {/* TAB 2: REFEREE LIVE SCORING SHEET */}
        {activePortalTab === 'referee' && (
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
              <span className="text-[11px] font-mono uppercase text-[#006A6A] font-bold tracking-wider">
                Konfigurasi Pertandingan Aktif
              </span>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#D8DFDE] text-xs">
            {/* Select Tournament */}
            <div>
              <label className="block text-[#6F7978] font-mono text-[11px] uppercase font-bold mb-1">
                Turnamen:
              </label>
              <select
                value={selectedTourneyId}
                onChange={(e) => setSelectedTourneyId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D8DFDE] bg-[#F6FAF9] text-[#191C1C] font-semibold focus:outline-none focus:border-[#006A6A]"
              >
                <option value="rookie-mix">LagiLagiPadel Rookie Fix Mix (Kemang)</option>
                <option value="padelpro-open">Jakarta Padel Pro Open 2026 (Satrio)</option>
                <option value="beginner-cup">Kemang Weekend Beginner Cup</option>
                <option value="jak-masters">Jakarta Masters Invitational</option>
              </select>
            </div>

            {/* Select Court */}
            <div>
              <label className="block text-[#6F7978] font-mono text-[11px] uppercase font-bold mb-1">
                Nomor Lapangan (Court):
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5, 6].map((courtNum) => (
                  <button
                    key={courtNum}
                    type="button"
                    onClick={() => setActiveCourt(courtNum)}
                    className={`flex-1 py-2 rounded-xl font-bold font-mono text-xs transition-all cursor-pointer ${
                      activeCourt === courtNum
                        ? 'bg-[#006A6A] text-white shadow-xs'
                        : 'bg-[#F6FAF9] text-[#3D5A57] border border-[#D8DFDE] hover:border-[#006A6A]'
                    }`}
                  >
                    C{courtNum}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Phase */}
            <div>
              <label className="block text-[#6F7978] font-mono text-[11px] uppercase font-bold mb-1">
                Babak Pertandingan:
              </label>
              <select
                value={matchPhase}
                onChange={(e) => {
                  setMatchPhase(e.target.value);
                  if (e.target.value === 'Grand Final') {
                    setTeamAName('Olivia & Rico');
                    setTeamBName('Kartika & Dodie');
                  } else if (e.target.value === 'Semifinal 1') {
                    setTeamAName('Olivia & Rico');
                    setTeamBName('Fajar & Dimas');
                  } else if (e.target.value === 'Perebutan Juara 3') {
                    setTeamAName('Fajar & Dimas');
                    setTeamBName('Kartika & Dodie');
                  } else {
                    setTeamAName('Tim A Pool');
                    setTeamBName('Tim B Pool');
                  }
                }}
                className="w-full px-3 py-2 rounded-xl border border-[#D8DFDE] bg-[#F6FAF9] text-[#191C1C] font-semibold focus:outline-none focus:border-[#006A6A]"
              >
                <option value="Grand Final">Grand Final (Gold Match)</option>
                <option value="Perebutan Juara 3">Perebutan Juara 3 (Bronze Match)</option>
                <option value="Semifinal 1">Semifinal 1</option>
                <option value="Semifinal 2">Semifinal 2</option>
                <option value="Pool A Match">Pool A Match</option>
                <option value="Pool B Match">Pool B Match</option>
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
                  {selectedTourneyData.name}
                </span>
                <span className="text-xs text-[#6F7978]">·</span>
                <span className="text-xs font-mono font-bold text-[#191C1C]">
                  {matchPhase} (Court #{activeCourt})
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#191C1C]">
                Official Electronic Score Sheet (Wasit Digital)
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

          {/* Teams Input Edit (Wasit bisa edit nama pasangan bila perlu) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
            <div>
              <label className="block text-[11px] font-mono text-[#6F7978] uppercase mb-1">
                Nama Pasangan Tim A:
              </label>
              <input
                type="text"
                value={teamAName}
                onChange={(e) => setTeamAName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#D8DFDE] text-xs font-bold text-[#191C1C] bg-[#F6FAF9] focus:outline-none focus:border-[#006A6A]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#6F7978] uppercase mb-1">
                Nama Pasangan Tim B:
              </label>
              <input
                type="text"
                value={teamBName}
                onChange={(e) => setTeamBName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#D8DFDE] text-xs font-bold text-[#191C1C] bg-[#F6FAF9] focus:outline-none focus:border-[#006A6A]"
              />
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
                onClick={resetCurrentGame}
                className="px-3.5 py-2 rounded-xl bg-[#F6FAF9] hover:bg-[#EEF4F3] text-red-700 font-semibold transition-colors flex items-center gap-1 cursor-pointer border border-[#D8DFDE]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Game (0-0)</span>
              </button>
            </div>

            <button
              onClick={handlePublishToLive}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-700/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publikasikan Skor ke Sistem Tamu</span>
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
              {scoreHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[#F6FAF9] border border-[#D8DFDE] text-[#191C1C]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006A6A] shrink-0" />
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
          </div>
        )}

        {/* Bottom Exit Bar */}
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
      </div>
    </div>
  );
};
