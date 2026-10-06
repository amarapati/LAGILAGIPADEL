import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Plus,
  Edit2,
  Trash2,
  Search,
  Calendar,
  MapPin,
  Users,
  Award,
  Radio,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
  GitFork,
  Upload,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { apiUploadTournamentBanner } from '../data/apiClient';
import {
  getStoredTournaments,
  saveTournament,
  deleteTournament,
  updateTournamentStatus,
  resetToDefaultTournaments
} from '../data/tournamentStorage';
import {
  getStoredTournamentGroups,
  saveStoredTournamentGroups,
  PoolGroupData
} from '../data/tournamentGroupStorage';
import {
  generateBracketForPoolCount,
  saveStoredBracket,
  KnockoutStartingStage,
  getAvailableKnockoutStagesForPools,
  getDefaultStageForPools
} from '../data/bracketStorage';
import { clearAllSystemData, resetAllSystemDataToDefault } from '../data/systemResetStorage';
import { getStoredMembers } from '../data/clubMembersStorage';
import { FullTournamentDetail } from '../data/padelProTournamentsData';

interface AdminTournamentManagerProps {
  onOpenTournamentDetail?: (tournamentId: string) => void;
  onNavigateToBracket?: (tournamentId: string) => void;
  onNavigateToReferee?: (tournamentId: string) => void;
}

export const AdminTournamentManager: React.FC<AdminTournamentManagerProps> = ({
  onOpenTournamentDetail,
  onNavigateToBracket,
  onNavigateToReferee
}) => {
  const [tournaments, setTournaments] = useState<FullTournamentDetail[]>(() =>
    getStoredTournaments()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'Live' | 'Akan Datang' | 'Selesai'>('semua');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTournamentId, setEditingTournamentId] = useState<string | null>(null);
  const [tournamentToDelete, setTournamentToDelete] = useState<FullTournamentDetail | null>(null);
  const [tournamentToComplete, setTournamentToComplete] = useState<FullTournamentDetail | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [membersCount, setMembersCount] = useState<number>(() => getStoredMembers().length);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formId, setFormId] = useState('');
  const [formOrganizer, setFormOrganizer] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formStatus, setFormStatus] = useState<'Live' | 'Akan Datang' | 'Selesai'>('Akan Datang');
  const [formCategories, setFormCategories] = useState('');
  const [formTotalCourts, setFormTotalCourts] = useState<number>(4);
  const [formTotalTeams, setFormTotalTeams] = useState<number>(32);
  const [formTotalPools, setFormTotalPools] = useState<number>(4);
  const [formKnockoutStage, setFormKnockoutStage] = useState<KnockoutStartingStage>('quarters');
  const [formPrizePool, setFormPrizePool] = useState('');
  const [formRules, setFormRules] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formBannerUrl, setFormBannerUrl] = useState('');
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerUploadError, setBannerUploadError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  // Handler unggah gambar banner 16:9 ke server uploads/banner/
  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setBannerUploadError('Ukuran file maksimal 10MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setBannerUploadError('Berkas harus berupa gambar (JPG, PNG, WEBP, GIF).');
      return;
    }

    setBannerUploadError(null);
    setIsUploadingBanner(true);

    try {
      const result = await apiUploadTournamentBanner(file);
      if (result.success && result.url) {
        setFormBannerUrl(result.url);
        showToast('Gambar banner turnamen (16:9) berhasil diunggah ke server!');
      } else {
        setBannerUploadError(result.error || 'Gagal mengunggah gambar banner.');
      }
    } catch (err: any) {
      setBannerUploadError(err.message || 'Terjadi kesalahan saat mengunggah banner.');
    } finally {
      setIsUploadingBanner(false);
      e.target.value = '';
    }
  };

  const handleRemoveBanner = () => {
    setFormBannerUrl('');
    setBannerUploadError(null);
    showToast('Banner dihapus dari data turnamen.');
  };

  // Handler saat jumlah pool aktif diubah (otomatis sesuaikan opsi babak sistem gugur)
  const handleTotalPoolsChange = (newCount: number) => {
    setFormTotalPools(newCount);
    const availableStages = getAvailableKnockoutStagesForPools(newCount);
    if (!availableStages.some((s) => s.id === formKnockoutStage)) {
      setFormKnockoutStage(getDefaultStageForPools(newCount));
    }
  };

  // Sync with storage events
  useEffect(() => {
    const handleTournamentsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.tournaments) {
        setTournaments(customEvent.detail.tournaments);
      } else {
        setTournaments(getStoredTournaments());
      }
    };

    const handleMembersUpdated = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.members) {
        setMembersCount(customEvent.detail.members.length);
      } else {
        setMembersCount(getStoredMembers().length);
      }
    };

    window.addEventListener('lagilagipadel_tournaments_updated', handleTournamentsUpdated);
    window.addEventListener('lagilagipadel_members_updated', handleMembersUpdated);
    return () => {
      window.removeEventListener('lagilagipadel_tournaments_updated', handleTournamentsUpdated);
      window.removeEventListener('lagilagipadel_members_updated', handleMembersUpdated);
    };
  }, []);

  // Quick Status Toggle Handler with Confirmation for Selesai
  const handleQuickStatusChange = (
    tourney: FullTournamentDetail,
    newStatus: 'Live' | 'Akan Datang' | 'Selesai'
  ) => {
    if (tourney.status === newStatus) return;
    if (newStatus === 'Selesai') {
      // Buka dialog konfirmasi untuk menghindari salah pencet
      setTournamentToComplete(tourney);
      return;
    }
    updateTournamentStatus(tourney.id, newStatus);
    showToast(`Status "${tourney.name}" berhasil diubah menjadi: ${newStatus}`);
  };

  // Confirm Complete Tournament Handler
  const handleConfirmCompleteTournament = () => {
    if (!tournamentToComplete) return;
    updateTournamentStatus(tournamentToComplete.id, 'Selesai');
    showToast(`Status "${tournamentToComplete.name}" resmi diubah menjadi Selesai.`);
    setTournamentToComplete(null);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingTournamentId(null);
    setFormId(`tourney-${Date.now().toString().slice(-6)}`);
    setFormName('');
    setFormOrganizer('LagiLagiPadel Solo');
    setFormLocation('Sanum Padel Solo Baru');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormStatus('Akan Datang');
    setFormCategories('Rookie Men, Rookie Women, Mixed Doubles');
    setFormTotalCourts(5);
    setFormTotalTeams(32);
    setFormTotalPools(4);
    setFormKnockoutStage(getDefaultStageForPools(4));
    setFormPrizePool('');
    setFormRules('Race to 4 Games · Golden Point Active · Auto Knockout Draw');
    setFormDescription('');
    setFormBannerUrl('');
    setBannerUploadError(null);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (tourney: FullTournamentDetail) => {
    setEditingTournamentId(tourney.id);
    setFormId(tourney.id);
    setFormName(tourney.name);
    setFormOrganizer(tourney.organizer || 'MOTION');
    setFormLocation(tourney.location || 'All In Padel');
    setFormDate(tourney.date || '2026-09-06');
    setFormStatus(tourney.status || 'Akan Datang');
    setFormCategories(tourney.categories ? tourney.categories.join(', ') : 'Rookie Mix');
    setFormTotalCourts(tourney.totalCourts || 4);
    setFormTotalTeams(tourney.totalTeams || 32);
    setFormBannerUrl(tourney.bannerUrl || '');
    setBannerUploadError(null);
    const existingPoolsCount = tourney.groupStandings?.pools?.filter((p) => p !== 'Semua Pool').length || 4;
    const finalPools = existingPoolsCount > 0 ? existingPoolsCount : 4;
    setFormTotalPools(finalPools);

    let detectedStage: KnockoutStartingStage = getDefaultStageForPools(finalPools);
    if (tourney.knockoutBracket?.roundOf16 && tourney.knockoutBracket.roundOf16.length > 0) {
      detectedStage = 'roundOf16';
    } else if (tourney.knockoutBracket?.quarters && tourney.knockoutBracket.quarters.length > 0) {
      detectedStage = 'quarters';
    } else if (tourney.knockoutBracket?.semis && tourney.knockoutBracket.semis.length > 0) {
      detectedStage = 'semis';
    } else if (tourney.knockoutBracket?.grandFinal) {
      detectedStage = 'final';
    }

    const availableStages = getAvailableKnockoutStagesForPools(finalPools);
    if (availableStages.some((s) => s.id === detectedStage)) {
      setFormKnockoutStage(detectedStage);
    } else {
      setFormKnockoutStage(getDefaultStageForPools(finalPools));
    }

    setFormPrizePool(tourney.prizePool || '');
    setFormRules(tourney.rules || 'Race to 4 Games · Golden Point');
    setFormDescription(tourney.description || '');
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Save Tournament Form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formName.trim()) errors.name = 'Nama turnamen wajib diisi.';
    if (!formOrganizer.trim()) errors.organizer = 'Nama penyelenggara wajib diisi.';
    if (!formLocation.trim()) errors.location = 'Lokasi / venue wajib diisi.';
    if (!formDate.trim()) errors.date = 'Tanggal wajib diisi.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const categoriesArray = formCategories
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    // Existing object if editing
    const existingTourney = editingTournamentId
      ? tournaments.find((t) => t.id === editingTournamentId)
      : null;

    const prevPoolCount = existingTourney?.groupStandings?.pools?.filter((p) => p !== 'Semua Pool').length || 4;
    const hasPrevR16 = !!(existingTourney?.knockoutBracket?.roundOf16 && existingTourney.knockoutBracket.roundOf16.length > 0);
    const hasPrevQF = !!(existingTourney?.knockoutBracket?.quarters && existingTourney.knockoutBracket.quarters.length > 0);
    const hasPrevSF = !!(existingTourney?.knockoutBracket?.semis && existingTourney.knockoutBracket.semis.length > 0);
    const prevStage: KnockoutStartingStage = hasPrevR16 ? 'roundOf16' : hasPrevQF ? 'quarters' : hasPrevSF ? 'semis' : 'final';

    let finalKnockoutBracket = existingTourney?.knockoutBracket;
    if (!finalKnockoutBracket || prevPoolCount !== formTotalPools || prevStage !== formKnockoutStage) {
      finalKnockoutBracket = generateBracketForPoolCount(formTotalPools, formKnockoutStage);
    }

    // Ensure rounds that should not exist in the selected format are strictly emptied
    if (formKnockoutStage === 'final') {
      finalKnockoutBracket = {
        ...finalKnockoutBracket,
        roundOf16: [],
        quarters: [],
        semis: []
      };
    } else if (formKnockoutStage === 'semis') {
      finalKnockoutBracket = {
        ...finalKnockoutBracket,
        roundOf16: [],
        quarters: []
      };
    } else if (formKnockoutStage === 'quarters') {
      finalKnockoutBracket = {
        ...finalKnockoutBracket,
        roundOf16: []
      };
    }

    const payload: FullTournamentDetail = {
      ...(existingTourney || ({} as FullTournamentDetail)),
      id: formId.trim() || `tourney-${Date.now()}`,
      name: formName.trim(),
      organizer: formOrganizer.trim(),
      location: formLocation.trim(),
      date: formDate.trim(),
      status: formStatus,
      categories: categoriesArray.length > 0 ? categoriesArray : ['Umum'],
      totalCourts: Number(formTotalCourts) || 4,
      totalTeams: Number(formTotalTeams) || 32,
      prizePool: formPrizePool.trim(),
      rules: formRules.trim() || 'Standar FIP / Race to 4 Games',
      description: formDescription.trim() || 'Turnamen resmi padel.',
      bannerUrl: formBannerUrl.trim() ? formBannerUrl.trim() : undefined,
      winners: existingTourney?.winners || {
        notes: `Turnamen ${formName} belum mencatatkan pemenang akhir.`,
        podium: []
      },
      participants: existingTourney?.participants || [],
      matches: existingTourney?.matches || [],
      knockoutBracket: finalKnockoutBracket,
      groupStandings: {
        pools: [
          'Semua Pool',
          ...Array.from({ length: formTotalPools }, (_, i) => `Pool ${String.fromCharCode(65 + i)}`)
        ],
        standings: existingTourney?.groupStandings?.standings || []
      }
    };

    saveTournament(payload);
    saveStoredBracket(payload.id, payload.knockoutBracket);

    // Synchronize tournament pool groups with selected total pool count
    try {
      const generatedPoolNames = Array.from(
        { length: formTotalPools },
        (_, i) => `Pool ${String.fromCharCode(65 + i)}`
      );

      let updatedPools: PoolGroupData[];
      if (!editingTournamentId) {
        // Turnamen baru dibuat: biarkan pool kosong (0 pasangan/tim) agar admin menyusun pasangan sendiri
        updatedPools = generatedPoolNames.map((poolName) => ({
          poolName,
          teams: []
        }));
      } else {
        const currentGroups = getStoredTournamentGroups(payload.id);
        updatedPools = generatedPoolNames.map((poolName) => {
          const existing = currentGroups.find((g) => g.poolName === poolName);
          return existing || { poolName, teams: [] };
        });

        // Preserve teams from any removed pools by shifting them into the last active pool
        currentGroups.forEach((g) => {
          if (!generatedPoolNames.includes(g.poolName) && g.teams.length > 0) {
            const lastPool = updatedPools[updatedPools.length - 1];
            if (lastPool) {
              g.teams.forEach((t) => {
                lastPool.teams.push({ ...t, pool: lastPool.poolName });
              });
            }
          }
        });
      }

      saveStoredTournamentGroups(payload.id, updatedPools);
    } catch (e) {
      console.warn('Could not sync tournament pool groups:', e);
    }

    setIsModalOpen(false);
    showToast(
      editingTournamentId
        ? `Turnamen "${payload.name}" berhasil diperbarui!`
        : `Turnamen baru "${payload.name}" berhasil dibuat!`
    );
  };

  // Confirm Delete Handler
  const handleConfirmDelete = () => {
    if (!tournamentToDelete) return;
    deleteTournament(tournamentToDelete.id);
    showToast(`Turnamen "${tournamentToDelete.name}" telah dihapus.`);
    setTournamentToDelete(null);
  };

  // Reset to default / Kosongkan data dialog
  const handleOpenResetModal = () => {
    setIsResetModalOpen(true);
  };

  // Perform Total Wipe (Kosongkan semua data)
  const handleConfirmClearAllData = () => {
    clearAllSystemData();
    setIsResetModalOpen(false);
    showToast('Seluruh data pemain, turnamen, bracket, halaman wasit & hasil skor, serta hall of fame telah berhasil dikosongkan!');
  };

  // Perform Demo Defaults Restore
  const handleConfirmRestoreDemo = () => {
    resetAllSystemDataToDefault();
    setIsResetModalOpen(false);
    showToast('Data sistem berhasil dipulihkan ke contoh turnamen dan pemain bawaan.');
  };

  // Filtered List
  const filteredTournaments = tournaments.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'semua' ? true : t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Metric counts
  const liveCount = tournaments.filter((t) => t.status === 'Live').length;
  const upcomingCount = tournaments.filter((t) => t.status === 'Akan Datang').length;
  const completedCount = tournaments.filter((t) => t.status === 'Selesai').length;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-xl bg-white border border-[#006A6A]/30 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#006A6A] shrink-0" />
          <p className="text-xs text-[#191C1C] font-semibold leading-relaxed flex-1">
            {toastMsg}
          </p>
          <button
            onClick={() => setToastMsg(null)}
            className="text-[#6F7978] hover:text-[#191C1C] p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner & Action Bar (Aligned with other Admin Portals) */}
      <div className="p-6 rounded-3xl bg-white border border-[#D8DFDE] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-[#191C1C] font-display flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[#006A6A]" />
              <span>Kelola Turnamen & Status Pertandingan</span>
            </h2>
            <p className="text-xs text-[#6F7978]">
              Buat kejuaraan baru, perbarui data kompetisi, hapus turnamen, serta ubah status pertandingan Live, Akan Datang, maupun Selesai.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#006A6A] hover:bg-[#007A7C] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Turnamen Baru</span>
            </button>
          </div>
        </div>

        {/* Highlight KPI Stats Cards (Aligned with other Admin Portals) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {/* Total Turnamen */}
          <div className="p-4 rounded-2xl bg-[#F6FAF9] border border-[#D8DFDE] space-y-1">
            <div className="text-[11px] font-mono text-[#6F7978] uppercase">Total Turnamen</div>
            <div className="text-2xl font-black text-[#191C1C] font-display flex items-baseline gap-1.5">
              <span>{tournaments.length}</span>
              <span className="text-xs text-[#006A6A] font-bold">Kompetisi</span>
            </div>
            <div className="text-[10px] text-[#3D5A57]">Terdaftar di sistem</div>
          </div>

          {/* Turnamen Live */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border-2 border-emerald-300 space-y-1 shadow-xs ring-1 ring-emerald-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-emerald-900 font-bold uppercase">Turnamen Live</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-950 font-display flex items-baseline gap-1.5">
              <span>{liveCount}</span>
              <span className="text-xs text-emerald-800 font-bold">Aktif</span>
            </div>
            <div className="text-[10px] text-emerald-800">Sedang bertanding di lapangan</div>
          </div>

          {/* Akan Datang */}
          <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-1">
            <div className="text-[11px] font-mono text-purple-900 uppercase">Akan Datang</div>
            <div className="text-2xl font-black text-purple-950 font-display flex items-baseline gap-1.5">
              <span>{upcomingCount}</span>
              <span className="text-xs text-purple-700 font-bold">Jadwal</span>
            </div>
            <div className="text-[10px] text-purple-800">Tahap pendaftaran & drawing</div>
          </div>

          {/* Selesai / Arsip */}
          <div className="p-4 rounded-2xl bg-[#F6FAF9] border border-[#D8DFDE] space-y-1">
            <div className="text-[11px] font-mono text-[#6F7978] uppercase">Selesai / Arsip</div>
            <div className="text-2xl font-black text-[#191C1C] font-display flex items-baseline gap-1.5">
              <span>{completedCount}</span>
              <span className="text-xs text-[#3D5A57] font-bold">Arsip</span>
            </div>
            <div className="text-[10px] text-[#3D5A57]">Podium & rekap juara tercatat</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#D8DFDE] shadow-2xs">
        {/* Status Filter Tabs (Interactive Segmented Control) */}
        <div className="flex items-center gap-1 p-1 bg-[#EEF4F3] rounded-lg overflow-x-auto">
          <button
            onClick={() => setStatusFilter('semua')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              statusFilter === 'semua'
                ? 'bg-white text-[#191C1C] shadow-2xs'
                : 'text-[#6F7978] hover:text-[#191C1C]'
            }`}
          >
            Semua ({tournaments.length})
          </button>
          <button
            onClick={() => setStatusFilter('Live')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'Live'
                ? 'bg-[#006A6A] text-white shadow-2xs'
                : 'text-[#6F7978] hover:text-[#191C1C]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Live ({liveCount})
          </button>
          <button
            onClick={() => setStatusFilter('Akan Datang')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'Akan Datang'
                ? 'bg-[#6E4D8B] text-white shadow-2xs'
                : 'text-[#6F7978] hover:text-[#191C1C]'
            }`}
          >
            <Clock className="w-3 h-3" />
            Akan Datang ({upcomingCount})
          </button>
          <button
            onClick={() => setStatusFilter('Selesai')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'Selesai'
                ? 'bg-[#3D5A57] text-white shadow-2xs'
                : 'text-[#6F7978] hover:text-[#191C1C]'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Selesai ({completedCount})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6F7978] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari turnamen, venue, atau penyelenggara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F6FAF9] border border-[#D8DFDE] rounded-lg text-[#191C1C] placeholder-[#6F7978] focus:outline-none focus:border-[#006A6A] transition-all"
          />
        </div>
      </div>

      {/* Tournaments List Table & Cards */}
      <div className="bg-white rounded-xl border border-[#D8DFDE] shadow-2xs overflow-hidden">
        {filteredTournaments.length === 0 ? (
          <div className="p-12 text-center">
            <Trophy className="w-10 h-10 text-[#6F7978]/40 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#191C1C]">Tidak Ada Turnamen Ditemukan</h3>
            <p className="text-xs text-[#3D5A57] mt-1 max-w-sm mx-auto">
              Tidak ada data yang cocok dengan filter atau kata kunci pencarian Anda.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="mt-4 px-4 py-2 text-xs font-bold text-white bg-[#006A6A] hover:bg-[#005252] rounded-xl transition-all"
            >
              + Buat Turnamen Pertama
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#D8DFDE]">
            {filteredTournaments.map((tourney) => {
              return (
                <div
                  key={tourney.id}
                  className="p-4 sm:p-5 hover:bg-[#F6FAF9]/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Left Column: Info, Banner & Details */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {tourney.bannerUrl && (
                      <div className="aspect-video w-24 sm:w-28 rounded-xl overflow-hidden border border-[#D8DFDE] bg-neutral-900 shrink-0 shadow-2xs self-start group/thumb relative">
                        <img
                          src={tourney.bannerUrl}
                          alt={tourney.name}
                          className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-bold text-[#006A6A]">
                          {tourney.organizer || 'MOTION'}
                        </span>
                        <span className="text-[#6F7978]" aria-hidden="true">·</span>
                        <span className="text-[#3D5A57] flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#006A6A]" />
                          <span className="font-mono tabular-nums">{tourney.date}</span>
                        </span>
                        <span className="text-[#6F7978]" aria-hidden="true">·</span>
                        <span className="text-[#3D5A57] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#006A6A]" />
                          <span>{tourney.location}</span>
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-extrabold text-[#191C1C] font-display tracking-tight">
                        {tourney.name}
                      </h3>

                    {/* Metadata line without pills */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6F7978]">
                      <span>{tourney.categories?.join(', ') || 'Rookie Mix'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{tourney.totalCourts} Lapangan</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{tourney.totalTeams} Tim</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums text-[#006A6A] font-bold">
                        {tourney.groupStandings?.pools?.filter((p) => p !== 'Semua Pool').length || 4} Pool Aktif
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-purple-700 font-semibold">
                        {tourney.knockoutBracket?.roundOf16 && tourney.knockoutBracket.roundOf16.length > 0
                          ? 'Babak 16 Besar s.d. Final'
                          : tourney.knockoutBracket?.quarters && tourney.knockoutBracket.quarters.length > 0
                          ? 'Perempat Final s.d. Final'
                          : tourney.knockoutBracket?.semis && tourney.knockoutBracket.semis.length > 0
                          ? 'Semifinal & Final'
                          : 'Grand Final'}
                      </span>
                      {tourney.prizePool &&
                        tourney.prizePool.trim() !== '' &&
                        tourney.prizePool.trim() !== '-' &&
                        tourney.prizePool.toLowerCase() !== 'trofi & sertifikat' && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-[#6E4D8B]">{tourney.prizePool}</span>
                          </>
                        )}
                    </div>
                  </div>
                </div>

                  {/* Middle Column: Quick Status Switcher (Interactive 3-State Control) */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-[#6F7978] uppercase tracking-wider">
                        Status Pertandingan:
                      </div>
                      <div className="inline-flex p-1 bg-[#F0F5F5] border border-[#D8DFDE] rounded-xl gap-1">
                        {/* Live Button */}
                        <button
                          type="button"
                          onClick={() => handleQuickStatusChange(tourney, 'Live')}
                          title="Ubah status ke Live (Sedang Bertanding)"
                          className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                            tourney.status === 'Live'
                              ? 'bg-[#006A6A] text-white shadow-xs'
                              : 'text-[#6F7978] hover:text-[#191C1C] hover:bg-white/60'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              tourney.status === 'Live'
                                ? 'bg-emerald-300 animate-pulse'
                                : 'bg-[#6F7978]'
                            }`}
                          ></span>
                          <span>Live</span>
                        </button>

                        {/* Akan Datang Button */}
                        <button
                          type="button"
                          onClick={() => handleQuickStatusChange(tourney, 'Akan Datang')}
                          title="Ubah status ke Akan Datang"
                          className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                            tourney.status === 'Akan Datang'
                              ? 'bg-[#6E4D8B] text-white shadow-xs'
                              : 'text-[#6F7978] hover:text-[#191C1C] hover:bg-white/60'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>Akan Datang</span>
                        </button>

                        {/* Selesai Button */}
                        <button
                          type="button"
                          onClick={() => handleQuickStatusChange(tourney, 'Selesai')}
                          title="Ubah status ke Selesai"
                          className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                            tourney.status === 'Selesai'
                              ? 'bg-[#3D5A57] text-white shadow-xs'
                              : 'text-[#6F7978] hover:text-[#191C1C] hover:bg-white/60'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Selesai</span>
                        </button>
                      </div>
                    </div>

                    {/* Right Column: Actions */}
                    <div className="flex items-center gap-1.5 pt-2 sm:pt-0">
                      {onOpenTournamentDetail && (
                        <button
                          onClick={() => onOpenTournamentDetail(tourney.id)}
                          title="Buka tampilan detail turnamen"
                          className="p-2 text-[#006A6A] hover:bg-[#EEF4F3] border border-[#D8DFDE] rounded-lg transition-colors text-xs font-semibold flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Lihat</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenEditModal(tourney)}
                        title="Edit data turnamen"
                        className="p-2 text-[#191C1C] hover:bg-[#EEF4F3] border border-[#D8DFDE] rounded-lg transition-colors text-xs font-semibold flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#006A6A]" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      <button
                        onClick={() => setTournamentToDelete(tourney)}
                        title="Hapus turnamen ini"
                        className="p-2 text-[#BA1A1A] hover:bg-red-50 border border-[#D8DFDE] hover:border-red-200 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Buat / Edit Turnamen */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#D8DFDE] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col my-auto animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#D8DFDE] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#006A6A]/10 flex items-center justify-center text-[#006A6A]">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#191C1C] font-display">
                    {editingTournamentId ? 'Edit Data Turnamen' : 'Buat Turnamen Baru'}
                  </h3>
                  <p className="text-xs text-[#3D5A57]">
                    Lengkapi identitas, kategori, status pertandingan, dan kuota tim.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#6F7978] hover:text-[#191C1C] rounded-lg hover:bg-[#EEF4F3] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveForm} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Nama Turnamen */}
              <div>
                <label className="block text-xs font-bold text-[#191C1C] uppercase tracking-wider mb-1">
                  Nama Turnamen *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Solo Padel Championship 2026"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#F6FAF9] border border-[#D8DFDE] rounded-xl text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                />
                {formErrors.name && (
                  <p className="text-[11px] text-[#BA1A1A] mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Banner Turnamen (Aspek Rasio 16:9) */}
              <div className="p-4 rounded-2xl bg-[#F6FAF9] border border-[#D8DFDE] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#191C1C] uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#006A6A]" />
                    <span>Banner Turnamen (Aspek Rasio 16:9)</span>
                  </label>
                </div>
                <p className="text-[11px] text-[#6F7978] leading-relaxed">
                  Upload banner turnamen. Gambar berformat ini akan ditampilkan di Daftar Turnamen dan halaman detail turnamen. Jika tidak diunggah, tidak ada gambar yang ditampilkan di mode tamu.
                </p>

                {formBannerUrl ? (
                  <div className="space-y-2">
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-[#D8DFDE] bg-neutral-900 shadow-xs group">
                      <img
                        src={formBannerUrl}
                        alt="Preview Banner Turnamen"
                        className="w-full h-full object-cover"
                      />
                      {/* Action Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5">
                        <label className="px-3 py-1.5 rounded-xl bg-white text-[#191C1C] text-xs font-bold cursor-pointer shadow-md hover:bg-neutral-100 flex items-center gap-1.5 transition-all">
                          <Upload className="w-3.5 h-3.5 text-[#006A6A]" />
                          <span>Ganti Banner</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleBannerFileChange}
                            disabled={isUploadingBanner}
                            className="sr-only"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveBanner}
                          disabled={isUploadingBanner}
                          className="px-3 py-1.5 rounded-xl bg-[#BA1A1A] text-white text-xs font-bold cursor-pointer shadow-md hover:bg-red-700 flex items-center gap-1.5 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-mono text-white font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>16:9 Banner Aktif</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 text-[#3D5A57]">
                      <span className="truncate max-w-xs font-mono text-[10px] text-[#6F7978]">
                        Path server: {formBannerUrl}
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveBanner}
                        className="text-[#BA1A1A] hover:underline font-bold text-xs cursor-pointer shrink-0"
                      >
                        Hapus Banner
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label
                      className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all aspect-video w-full max-h-52 ${
                        isUploadingBanner
                          ? 'border-[#006A6A] bg-[#006A6A]/5'
                          : 'border-[#D8DFDE] hover:border-[#006A6A] bg-white hover:bg-[#EEF4F3]'
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleBannerFileChange}
                        disabled={isUploadingBanner}
                        className="sr-only"
                      />
                      {isUploadingBanner ? (
                        <div className="flex flex-col items-center gap-2 text-[#006A6A]">
                          <Loader2 className="w-7 h-7 animate-spin text-[#006A6A]" />
                          <span className="text-xs font-bold">Mengunggah banner ke server...</span>
                          <span className="text-[10px] text-[#6F7978]">
                            Menyimpan gambar ke folder.
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="w-10 h-10 rounded-xl bg-[#006A6A]/10 text-[#006A6A] flex items-center justify-center mb-1">
                            <Upload className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-[#191C1C]">
                            Pilih atau Tarik Gambar Banner Turnamen
                          </span>
                          <span className="text-[10px] text-[#6F7978]">
                            JPG, PNG, WEBP · Maksimal 10MB
                          </span>
                        </div>
                      )}
                    </label>
                  </div>
                )}

                {bannerUploadError && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-[#BA1A1A] text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{bannerUploadError}</span>
                  </div>
                )}
              </div>

              {/* Status Pertandingan */}
              <div>
                <label className="block text-xs font-bold text-[#191C1C] uppercase tracking-wider mb-1.5">
                  Status Turnamen
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <label
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${
                      formStatus === 'Akan Datang'
                        ? 'border-[#6E4D8B] bg-[#6E4D8B]/5 text-[#6E4D8B] font-bold'
                        : 'border-[#D8DFDE] bg-white text-[#6F7978] hover:bg-[#F6FAF9]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="Akan Datang"
                      checked={formStatus === 'Akan Datang'}
                      onChange={() => setFormStatus('Akan Datang')}
                      className="sr-only"
                    />
                    <Clock className="w-4 h-4 mb-1" />
                    <span className="text-xs">Akan Datang</span>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${
                      formStatus === 'Live'
                        ? 'border-[#006A6A] bg-[#006A6A]/5 text-[#006A6A] font-bold'
                        : 'border-[#D8DFDE] bg-white text-[#6F7978] hover:bg-[#F6FAF9]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="Live"
                      checked={formStatus === 'Live'}
                      onChange={() => setFormStatus('Live')}
                      className="sr-only"
                    />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mb-1 animate-pulse"></span>
                    <span className="text-xs">Live</span>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${
                      formStatus === 'Selesai'
                        ? 'border-[#3D5A57] bg-[#3D5A57]/5 text-[#3D5A57] font-bold'
                        : 'border-[#D8DFDE] bg-white text-[#6F7978] hover:bg-[#F6FAF9]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="Selesai"
                      checked={formStatus === 'Selesai'}
                      onChange={() => setFormStatus('Selesai')}
                      className="sr-only"
                    />
                    <CheckCircle2 className="w-4 h-4 mb-1" />
                    <span className="text-xs">Selesai</span>
                  </label>
                </div>
              </div>

              {/* Penyelenggara & Lokasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#191C1C] uppercase tracking-wider mb-1">
                    Penyelenggara *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: LagiLagiPadel Solo"
                    value={formOrganizer}
                    onChange={(e) => setFormOrganizer(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#F6FAF9] border border-[#D8DFDE] rounded-xl text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#191C1C] uppercase tracking-wider mb-1">
                    Lokasi / Venue *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Sanum Padel Solo Baru (5 Courts)"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#F6FAF9] border border-[#D8DFDE] rounded-xl text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                  />
                </div>
              </div>

              {/* Tanggal & Total Hadiah */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#191C1C] uppercase tracking-wider mb-1">
                    Tanggal Pelaksanaan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 2026-10-15 atau 15 - 18 Okt 2026"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#F6FAF9] border border-[#D8DFDE] rounded-xl text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#191C1C] uppercase tracking-wider mb-1">
                    Total Hadiah (Prize Pool)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Rp 25.000.000 + 4 Trofi Eksklusif"
                    value={formPrizePool}
                    onChange={(e) => setFormPrizePool(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#F6FAF9] border border-[#D8DFDE] rounded-xl text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                  />
                </div>
              </div>

              {/* Lapangan, Kuota Tim & Dropdown Total Pool Aktif */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#191C1C] uppercase tracking-wider mb-1">
                    Jumlah Lapangan
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={formTotalCourts}
                    onChange={(e) => setFormTotalCourts(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs bg-[#F6FAF9] border border-[#D8DFDE] rounded-xl text-[#191C1C] focus:outline-none focus:border-[#006A6A] font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#191C1C] uppercase tracking-wider mb-1">
                    Kuota Total Tim
                  </label>
                  <input
                    type="number"
                    min="4"
                    max="128"
                    value={formTotalTeams}
                    onChange={(e) => setFormTotalTeams(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs bg-[#F6FAF9] border border-[#D8DFDE] rounded-xl text-[#191C1C] focus:outline-none focus:border-[#006A6A] font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#191C1C] uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Total Pool Aktif *</span>
                    <span className="text-[10px] text-[#006A6A] font-mono font-bold">
                      {formTotalPools} Pool
                    </span>
                  </label>
                  <select
                    value={formTotalPools}
                    onChange={(e) => handleTotalPoolsChange(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs bg-[#F6FAF9] border border-[#D8DFDE] rounded-xl text-[#191C1C] focus:outline-none focus:border-[#006A6A] font-bold cursor-pointer"
                  >
                    <option value={2}>2 Pool (Pool A - B)</option>
                    <option value={3}>3 Pool (Pool A - C)</option>
                    <option value={4}>4 Pool (Pool A - D) · Standar 16/32 Tim</option>
                    <option value={5}>5 Pool (Pool A - E)</option>
                    <option value={6}>6 Pool (Pool A - F)</option>
                    <option value={8}>8 Pool (Pool A - H) · Turnamen Besar</option>
                    <option value={10}>10 Pool (Pool A - J)</option>
                    <option value={12}>12 Pool (Pool A - L)</option>
                    <option value={16}>16 Pool (Pool A - P)</option>
                  </select>
                </div>
              </div>

              {/* Preview Susunan Pool yang Diaktifkan */}
              <div className="p-3 rounded-xl bg-[#EEF4F3] border border-[#D8DFDE] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-1.5 text-xs text-[#006A6A] font-bold">
                  <Layers className="w-3.5 h-3.5 shrink-0 text-[#006A6A]" />
                  <span>Pool Aktif yang Diterbitkan ({formTotalPools} Pool):</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {Array.from({ length: formTotalPools }, (_, i) => String.fromCharCode(65 + i)).map((letter) => (
                    <span
                      key={letter}
                      className="px-2 py-0.5 rounded-md bg-white border border-[#D8DFDE] text-[10px] font-mono font-bold text-[#006A6A] shadow-2xs"
                    >
                      Pool {letter}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dropdown Babak Pertandingan (Knockout Playoff) - Sesuai Jumlah Pool */}
              <div className="p-4 rounded-2xl bg-[#F6FAF9] border border-[#D8DFDE] space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#191C1C] uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <GitFork className="w-3.5 h-3.5 text-[#006A6A]" />
                      <span>Babak Pertandingan Sistem Gugur *</span>
                    </span>
                    <span className="text-[10px] text-[#006A6A] font-mono font-bold">
                      {getAvailableKnockoutStagesForPools(formTotalPools).find((s) => s.id === formKnockoutStage)?.badge || 'Otomatis'}
                    </span>
                  </label>
                  <select
                    value={formKnockoutStage}
                    onChange={(e) => setFormKnockoutStage(e.target.value as KnockoutStartingStage)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#D8DFDE] rounded-xl text-[#191C1C] focus:outline-none focus:border-[#006A6A] font-bold cursor-pointer shadow-2xs"
                  >
                    {getAvailableKnockoutStagesForPools(formTotalPools).map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.label} · [{stage.badge}]
                      </option>
                    ))}
                  </select>
                  <div className="mt-1.5 text-[11px] text-[#6F7978] leading-relaxed flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006A6A] shrink-0" />
                    <span>
                      {getAvailableKnockoutStagesForPools(formTotalPools).find((s) => s.id === formKnockoutStage)?.desc}
                    </span>
                  </div>
                </div>

                {/* Alur Babak Pertandingan (Flow Preview) */}
                <div className="pt-2 border-t border-[#D8DFDE] flex items-center gap-2 text-[11px] text-[#3D5A57] flex-wrap font-medium">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#6F7978]">Alur Pertandingan:</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-[#D8DFDE] font-semibold text-[#006A6A]">
                    {formTotalPools} Pool Grup
                  </span>
                  <span>➔</span>
                  {formKnockoutStage === 'roundOf16' && (
                    <>
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 font-semibold text-purple-700">
                        Babak 16 Besar (8 Laga)
                      </span>
                      <span>➔</span>
                    </>
                  )}
                  {(formKnockoutStage === 'roundOf16' || formKnockoutStage === 'quarters') && (
                    <>
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 font-semibold text-blue-700">
                        Perempat Final (4 Laga)
                      </span>
                      <span>➔</span>
                    </>
                  )}
                  {formKnockoutStage !== 'final' && (
                    <>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 font-semibold text-amber-700">
                        Semifinal (2 Laga)
                      </span>
                      <span>➔</span>
                    </>
                  )}
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 font-bold text-emerald-800">
                    Grand Final {formKnockoutStage !== 'final' ? '& Juara 3' : ''}
                  </span>
                </div>
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-xs font-bold text-[#191C1C] uppercase tracking-wider mb-1">
                  Kategori Peserta (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Rookie Men, Rookie Women, Mixed Doubles"
                  value={formCategories}
                  onChange={(e) => setFormCategories(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#F6FAF9] border border-[#D8DFDE] rounded-xl text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                />
              </div>

              {/* Aturan & Format */}
              <div>
                <label className="block text-xs font-bold text-[#191C1C] uppercase tracking-wider mb-1">
                  Format Pertandingan & Aturan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Race to 4 Games · Golden Point Active · Auto Knockout"
                  value={formRules}
                  onChange={(e) => setFormRules(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#F6FAF9] border border-[#D8DFDE] rounded-xl text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-bold text-[#191C1C] uppercase tracking-wider mb-1">
                  Deskripsi Turnamen
                </label>
                <textarea
                  rows={3}
                  placeholder="Keterangan singkat tentang turnamen..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#F6FAF9] border border-[#D8DFDE] rounded-xl text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-[#D8DFDE] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#6F7978] hover:text-[#191C1C] bg-[#F6FAF9] rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#006A6A] hover:bg-[#005252] rounded-xl transition-all shadow-sm"
                >
                  {editingTournamentId ? 'Simpan Perubahan' : 'Terbitkan Turnamen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {tournamentToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#BA1A1A]/30 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-[#BA1A1A] flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-[#191C1C] text-center font-display">
              Hapus Turnamen?
            </h3>
            <p className="text-xs text-[#3D5A57] text-center mt-2">
              Apakah Anda yakin ingin menghapus turnamen{' '}
              <strong className="text-[#191C1C]">"{tournamentToDelete.name}"</strong>? Data jadwal, bagan, dan klasemen terkait turnamen ini akan dihapus dari peramban.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setTournamentToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-[#6F7978] hover:text-[#191C1C] bg-[#F6FAF9] rounded-xl transition-colors flex-1"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-[#BA1A1A] hover:bg-red-700 rounded-xl transition-all shadow-sm flex-1"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Default / Kosongkan Data Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#BA1A1A]/30 shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-150 my-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#D8DFDE]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-[#BA1A1A] flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#191C1C] font-display">
                    Reset Default & Kosongkan Data
                  </h3>
                  <p className="text-xs text-[#3D5A57]">
                    Kelola data sistem: bersihkan total atau muat data demo.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="p-1 text-[#6F7978] hover:text-[#191C1C] rounded-lg hover:bg-[#EEF4F3] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current System Status Badges */}
            <div className="my-4 space-y-3">
              <div className="text-[11px] font-bold text-[#6F7978] uppercase tracking-wider">
                Status Data Saat Ini:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] text-center">
                  <div className="text-[10px] text-[#6F7978] font-bold uppercase">Turnamen</div>
                  <div className="text-lg font-extrabold text-[#191C1C] font-mono tabular-nums">{tournaments.length}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] text-center">
                  <div className="text-[10px] text-[#6F7978] font-bold uppercase">Pemain Klub</div>
                  <div className="text-lg font-extrabold text-[#191C1C] font-mono tabular-nums">{membersCount}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] text-center">
                  <div className="text-[10px] text-[#6F7978] font-bold uppercase">Hall of Fame</div>
                  <div className="text-xs font-bold text-[#6E4D8B] mt-1">Podium & Medali</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] text-center">
                  <div className="text-[10px] text-[#6F7978] font-bold uppercase">Wasit & Skor</div>
                  <div className="text-xs font-bold text-[#006A6A] mt-1">Skor 0 - 0 (Bersih)</div>
                </div>
              </div>
            </div>

            {/* Detailed Explanation */}
            <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200/80 text-xs text-[#191C1C] space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-[#BA1A1A]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Pilihan Tindakan Reset Sistem:</span>
              </div>
              <p className="text-[11px] text-[#3D5A57] leading-relaxed">
                Pilih opsi di bawah sesuai kebutuhan Anda. Tombol merah akan <strong>mengosongkan seluruh data</strong> pemain, turnamen, bagan, <strong>halaman lembar wasit & hasil skor pertandingan (0-0)</strong>, serta rekapitulasi <strong>Hall of Fame</strong> menjadi 0 sehingga sistem bersih tanpa sisa data demo bawaan.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 space-y-2.5">
              {/* Primary Action requested by user */}
              <button
                type="button"
                onClick={handleConfirmClearAllData}
                className="w-full py-2.5 px-4 rounded-xl bg-[#BA1A1A] hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Kosongkan Semua Data (Pemain, Turnamen, Bracket, Halaman Wasit & Skor, Hall of Fame)</span>
              </button>

              {/* Secondary Demo Recovery Action */}
              <button
                type="button"
                onClick={handleConfirmRestoreDemo}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#EEF4F3] border border-[#D8DFDE] text-[#006A6A] hover:text-[#005252] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Muat Ulang Contoh Data Demo Bawaan Pabrik</span>
              </button>

              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-[#6F7978] hover:text-[#191C1C] transition-colors cursor-pointer"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI: UBAH STATUS TURNAMEN MENJADI SELESAI */}
      {tournamentToComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-[#D8DFDE] shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header Icon & Title */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0 shadow-xs">
                  <AlertTriangle className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#191C1C] font-display">
                    Ubah Status Menjadi Selesai?
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTournamentToComplete(null)}
                className="p-1.5 rounded-xl text-[#6F7978] hover:text-[#191C1C] hover:bg-[#F6FAF9] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Kotak Peringatan Sesuai Permintaan */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2 text-xs">
              <p className="font-bold text-sm text-amber-950">
                Apakah Anda yakin ingin mengubah status turnamen ini menjadi Selesai?
              </p>
              <p className="text-amber-800 leading-relaxed">
                Turnamen yang berstatus <strong>Selesai</strong> tidak akan lagi muncul di dropdown lembar skoring wasit untuk mencegah salah memasukkan skor.
              </p>
            </div>

            {/* Detail Turnamen Info Ringkas */}
            <div className="p-4 rounded-2xl bg-[#F6FAF9] border border-[#D8DFDE] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#6F7978] font-medium">Nama Turnamen:</span>
                <span className="font-bold text-[#191C1C]">{tournamentToComplete.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6F7978] font-medium">Lokasi:</span>
                <span className="font-semibold text-[#191C1C]">{tournamentToComplete.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6F7978] font-medium">Status Saat Ini:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  tournamentToComplete.status === 'Live'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {tournamentToComplete.status}
                </span>
              </div>
            </div>

            {/* Action Buttons: Batal & Ya, Selesaikan */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setTournamentToComplete(null)}
                className="px-5 py-2.5 rounded-xl border border-[#D8DFDE] bg-white hover:bg-neutral-100 text-[#191C1C] font-bold text-xs cursor-pointer transition-all shadow-xs"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleConfirmCompleteTournament}
                className="px-6 py-2.5 rounded-xl bg-[#3D5A57] hover:bg-[#2A403E] text-white font-black text-xs cursor-pointer shadow-md transition-all flex items-center gap-2 active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Ya, Selesaikan Turnamen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
