import React, { useState, useEffect, useRef } from 'react';
import {
  UserPlus,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Camera,
  Upload,
  Sparkles,
  ShieldCheck,
  Edit2,
  Trash2,
  Filter,
  Trophy,
  Award,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  X,
  AlertCircle,
  Eye,
  RefreshCw,
  User
} from 'lucide-react';
import {
  ClubMember,
  getStoredMembers,
  saveStoredMembers,
  addStoredMember,
  updateStoredMember,
  deleteStoredMember,
  clearAllMembers,
  resetToDefaultMembers,
  toggleGroupQualifiedStatus,
  PRESET_AVATARS,
  DEFAULT_MEMBER_AVATAR
} from '../data/clubMembersStorage';
import { apiFetchMembers, apiSaveMember, apiDeleteMember } from '../data/apiClient';

interface AdminMemberManagerProps {
  onMemberUpdated?: () => void;
}

export const AdminMemberManager: React.FC<AdminMemberManagerProps> = ({ onMemberUpdated }) => {
  const [members, setMembers] = useState<ClubMember[]>(() => getStoredMembers());
  const [isLoading, setIsLoading] = useState<boolean>(() => getStoredMembers().length === 0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterFilter, setFilterFilter] = useState<'all' | 'qualified' | 'men' | 'women'>('all');

  // Modal State: Add or Edit Member
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  // Modal State: Delete Member Confirmation
  const [deletingMember, setDeletingMember] = useState<ClubMember | null>(null);

  // Form State
  const [formName, setFormName] = useState<string>('');
  const [formNickname, setFormNickname] = useState<string>('');
  const [formId, setFormId] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formCity, setFormCity] = useState<string>('');
  const [formGender, setFormGender] = useState<'Laki-laki' | 'Perempuan' | 'Mix'>('Laki-laki');
  const [formPhotoUrl, setFormPhotoUrl] = useState<string>('');

  // Special parameter for Group Qualified Member (Admin specific)
  const [formIsGroupQualified, setFormIsGroupQualified] = useState<boolean>(false);
  const [formQualifiedTournament, setFormQualifiedTournament] = useState<string>('Rookie Fix Mix Motion x Winny Grosir');
  const [formQualifiedPool, setFormQualifiedPool] = useState<string>('Pool A');
  const [formQualifiedPhase, setFormQualifiedPhase] = useState<string>('Lolos Fase Grup (Playoff Qualified)');

  // Achievements
  const [formGold, setFormGold] = useState<number>(0);
  const [formSilver, setFormSilver] = useState<number>(0);
  const [formBronze, setFormBronze] = useState<number>(0);
  const [formDefaultPartner, setFormDefaultPartner] = useState<string>('');

  // Toast / notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick photo upload ref for member list
  const quickPhotoInputRef = useRef<HTMLInputElement>(null);
  const [quickUploadMemberId, setQuickUploadMemberId] = useState<string | null>(null);

  // Sync state on mount and events
  useEffect(() => {
    let isMounted = true;
    apiFetchMembers()
      .then((fresh) => {
        if (isMounted) {
          if (fresh && fresh.length > 0) {
            setMembers(fresh);
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setIsLoading(false);
          console.warn('[AdminMemberManager] Initial load error:', err);
        }
      });

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.members && Array.isArray(customEvent.detail.members)) {
        setMembers(customEvent.detail.members);
      } else {
        setMembers(getStoredMembers());
      }
      setIsLoading(false);
    };

    window.addEventListener('lagilagipadel_members_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('lagilagipadel_members_updated', handleUpdate);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Helper to safely generate next unique Member ID
  const generateNextId = (sourceList?: ClubMember[]) => {
    const list =
      sourceList && sourceList.length > 0
        ? sourceList
        : members.length > 0
        ? members
        : getStoredMembers();
    const existingIds = new Set<string>();
    const numbers: number[] = [];

    list.forEach((m) => {
      if (m && m.id) {
        existingIds.add(m.id.toUpperCase());
        const match = m.id.match(/\d+$/);
        if (match) {
          const n = parseInt(match[0], 10);
          if (!isNaN(n)) numbers.push(n);
        }
      }
    });

    let nextNum = (numbers.length > 0 ? Math.max(...numbers) : 0) + 1;
    let candidate = `LLP-MBR-${String(nextNum).padStart(3, '0')}`;
    while (existingIds.has(candidate.toUpperCase())) {
      nextNum++;
      candidate = `LLP-MBR-${String(nextNum).padStart(3, '0')}`;
    }
    return candidate;
  };

  const handleResetMembers = () => {
    if (members.length === 0) {
      resetToDefaultMembers();
      showToast('Data demo member klub berhasil dipulihkan (16 pemain).');
    } else {
      if (window.confirm('Kosongkan semua data pemain klub?')) {
        clearAllMembers();
        showToast('Seluruh data pemain klub telah dikosongkan.');
      }
    }
  };

  const handleOpenAddModal = async () => {
    setEditingMemberId(null);
    setFormName('');
    setFormNickname('');

    let currentList = members;
    if (currentList.length === 0) {
      try {
        const fresh = await apiFetchMembers();
        if (fresh && fresh.length > 0) {
          currentList = fresh;
          setMembers(fresh);
        }
      } catch (e) {}
    }

    setFormId(generateNextId(currentList));
    setFormPhone('');
    setFormEmail('');
    setFormCity('');
    setFormGender('Laki-laki');
    setFormPhotoUrl('');
    setFormIsGroupQualified(false);
    setFormQualifiedTournament('');
    setFormQualifiedPool('');
    setFormQualifiedPhase('Lolos Fase Grup (Playoff Qualified)');
    setFormGold(0);
    setFormSilver(0);
    setFormBronze(0);
    setFormDefaultPartner('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member: ClubMember) => {
    setEditingMemberId(member.id);
    setFormName(member.name);
    setFormNickname(member.nickname || '');
    setFormId(member.id);
    setFormPhone(member.phone);
    setFormEmail(member.email);
    setFormCity(member.city);
    setFormGender(member.gender);
    setFormPhotoUrl(member.photoUrl);
    setFormIsGroupQualified(member.isGroupQualified);
    setFormQualifiedTournament(member.qualifiedTournament || 'Rookie Fix Mix Motion x Winny Grosir');
    setFormQualifiedPool(member.qualifiedPool || 'Pool A');
    setFormQualifiedPhase(member.qualifiedPhase || 'Lolos Fase Grup (Playoff Qualified)');
    setFormGold(member.achievements?.gold || 0);
    setFormSilver(member.achievements?.silver || 0);
    setFormBronze(member.achievements?.bronze || 0);
    setFormDefaultPartner(member.achievements?.partnerDefault || '');
    setIsModalOpen(true);
  };

  // Handle image upload from computer (FileReader to Data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isQuickUpload = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Harap pilih file gambar (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (isQuickUpload && quickUploadMemberId) {
        // Quick update photo for existing member
        const current = getStoredMembers();
        const updated = current.map((m) =>
          m.id === quickUploadMemberId ? { ...m, photoUrl: dataUrl } : m
        );
        saveStoredMembers(updated);
        setMembers(updated);
        showToast(`Foto profil pemain ${quickUploadMemberId} berhasil diperbarui!`);
        if (onMemberUpdated) onMemberUpdated();
      } else {
        // Set in modal form
        setFormPhotoUrl(dataUrl);
        showToast('Foto berhasil diunggah! Tekan Simpan untuk menerapkan.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerQuickPhoto = (memberId: string) => {
    setQuickUploadMemberId(memberId);
    quickPhotoInputRef.current?.click();
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      alert('Nama member tidak boleh kosong.');
      return;
    }

    // ID is strictly provided by system
    let targetId = editingMemberId
      ? editingMemberId
      : (formId.trim().toUpperCase() || generateNextId());

    // If new member, double-check for ID collision against all sources
    if (!editingMemberId) {
      const currentList = members.length > 0 ? members : getStoredMembers();
      if (currentList.some((m) => m.id.toUpperCase() === targetId.toUpperCase())) {
        const resolvedId = generateNextId(currentList);
        showToast(`ID "${targetId}" sudah digunakan. ID baru otomatis disesuaikan menjadi: ${resolvedId}`);
        targetId = resolvedId;
      }
    }

    const memberPayload: ClubMember = {
      id: targetId,
      name: formName.trim(),
      nickname: formNickname.trim() || undefined,
      photoUrl: formPhotoUrl.trim(),
      phone: formPhone.trim() || '',
      email: formEmail.trim() || '',
      city: formCity.trim(),
      gender: formGender,
      joinedDate: editingMemberId
        ? members.find((m) => m.id === editingMemberId)?.joinedDate || '25 Sep 2026'
        : '25 Sep 2026',
      status: 'Aktif',
      isGroupQualified: formIsGroupQualified,
      qualifiedTournament: formIsGroupQualified ? formQualifiedTournament : undefined,
      qualifiedPool: formIsGroupQualified ? formQualifiedPool : undefined,
      qualifiedPhase: formIsGroupQualified ? formQualifiedPhase : undefined,
      achievements: {
        gold: formGold,
        silver: formSilver,
        bronze: formBronze,
        tournaments: formIsGroupQualified ? [formQualifiedTournament] : ['LagiLagi Padel Open'],
        partnerDefault: formDefaultPartner || undefined
      }
    };

    try {
      if (editingMemberId) {
        await apiSaveMember(memberPayload, false);
        showToast(`Data member "${memberPayload.name}" (${memberPayload.id}) berhasil diperbarui di server!`);
      } else {
        const saved = await apiSaveMember(memberPayload, true);
        showToast(`Member baru "${saved.name}" (${saved.id}) berhasil tersimpan ke database server!`);
      }

      const freshList = await apiFetchMembers();
      setMembers(freshList);
      setIsModalOpen(false);
      if (onMemberUpdated) onMemberUpdated();
    } catch (err: any) {
      showToast('Gagal menyimpan member: ' + (err.message || 'Koneksi database terganggu'));
    }
  };

  const handleDeleteMember = (member: ClubMember) => {
    setDeletingMember(member);
  };

  const handleConfirmDelete = async () => {
    if (!deletingMember) return;
    try {
      await apiDeleteMember(deletingMember.id);
      const updated = await apiFetchMembers();
      setMembers(updated);
      showToast(`Member "${deletingMember.name}" (${deletingMember.id}) berhasil dihapus dari database server.`);
      if (onMemberUpdated) onMemberUpdated();
    } catch (e) {
      showToast('Gagal menghapus member dari database server.');
    }
    setDeletingMember(null);
  };

  const handleToggleQualified = async (member: ClubMember) => {
    const nextState = !member.isGroupQualified;
    const targetMember: ClubMember = {
      ...member,
      isGroupQualified: nextState,
      qualifiedTournament: 'Rookie Fix Mix Motion x Winny Grosir',
      qualifiedPool: 'Pool A',
      qualifiedPhase: nextState ? 'Lolos Fase Grup (Playoff Qualified)' : 'Belum Kualifikasi'
    };
    try {
      await apiSaveMember(targetMember, false);
      const freshList = await apiFetchMembers();
      setMembers(freshList);
      showToast(
        nextState
          ? `Status ${member.name} diubah: LOLOS FASE GRUP (Playoff Qualified)!`
          : `Status ${member.name} diubah: Belum Lolos.`
      );
      if (onMemberUpdated) onMemberUpdated();
    } catch (e) {
      showToast('Gagal memperbarui status kualifikasi di database server.');
    }
  };

  // Filter and search
  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchQuery =
      searchQuery === '' ||
      m.name.toLowerCase().includes(q) ||
      (m.nickname && m.nickname.toLowerCase().includes(q)) ||
      m.id.toLowerCase().includes(q) ||
      (m.city && m.city.toLowerCase().includes(q));

    if (!matchQuery) return false;

    if (filterFilter === 'qualified') return m.isGroupQualified;
    if (filterFilter === 'men') return m.gender === 'Laki-laki';
    if (filterFilter === 'women') return m.gender === 'Perempuan';
    return true;
  });

  const totalQualifiedCount = members.filter((m) => m.isGroupQualified).length;

  return (
    <div className="space-y-6">
      {/* Hidden Quick File Input */}
      <input
        type="file"
        ref={quickPhotoInputRef}
        onChange={(e) => handleFileUpload(e, true)}
        accept="image/*"
        className="hidden"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 shadow-md flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs font-bold text-emerald-700 underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Top Banner & Action Bar */}
      <div className="p-6 rounded-3xl bg-white border border-[#D8DFDE] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-[#191C1C] font-display flex items-center gap-2">
              <Users className="w-6 h-6 text-[#006A6A]" />
              <span>Manajemen Member Klub</span>
            </h2>
            <p className="text-xs text-[#6F7978]">
              Tambah member baru, unggah foto, dan pantau parameter khusus member yang lolos fase grup turnamen.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={async () => {
                setIsLoading(true);
                try {
                  const fresh = await apiFetchMembers();
                  if (fresh && fresh.length > 0) {
                    setMembers(fresh);
                    showToast(`Data ${fresh.length} member berhasil disinkronkan dari server.`);
                  }
                } catch (e) {
                  showToast('Gagal menyinkronkan data member.');
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-[#F6FAF9] hover:bg-[#EEF4F3] border border-[#D8DFDE] text-[#3D5A57] text-xs font-bold transition-all cursor-pointer shrink-0 disabled:opacity-50"
              title="Segarkan data member dari server database"
            >
              <RefreshCw className={`w-4 h-4 text-[#006A6A] ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#006A6A] hover:bg-[#007A7C] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Member Klub Baru</span>
            </button>
          </div>
        </div>

        {/* Highlight KPI Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {/* Total Members */}
          <div className="p-4 rounded-2xl bg-[#F6FAF9] border border-[#D8DFDE] space-y-1">
            <div className="text-[11px] font-mono text-[#6F7978] uppercase">Total Member Terdaftar</div>
            <div className="text-2xl font-black text-[#191C1C] font-display flex items-baseline gap-1.5">
              <span>{members.length}</span>
              <span className="text-xs text-[#006A6A] font-bold">Pemain</span>
            </div>
            <div className="text-[10px] text-[#3D5A57]">Terhubung system-wide</div>
          </div>

          {/* PARAMETER KHUSUS: Member Lolos Fase Grup */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border-2 border-emerald-300 space-y-1 shadow-xs ring-1 ring-emerald-200">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-mono text-emerald-900 font-bold uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Lolos Fase Grup</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <div className="text-2xl font-black text-emerald-950 font-display flex items-baseline gap-1.5">
              <span>{totalQualifiedCount}</span>
              <span className="text-xs text-emerald-700 font-bold">Lolos Playoff</span>
            </div>
            <div className="text-[10px] text-emerald-800 font-medium">
              Parameter khusus admin aktif
            </div>
          </div>

          {/* Podium Juara */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1">
            <div className="text-[11px] font-mono text-amber-900 uppercase flex items-center gap-1 font-bold">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>Hall of Fame Titlers</span>
            </div>
            <div className="text-2xl font-black text-amber-950 font-display flex items-baseline gap-1.5">
              <span>{members.filter((m) => (m.achievements?.gold || 0) > 0).length}</span>
              <span className="text-xs text-amber-700 font-bold">Kampiun Emas</span>
            </div>
            <div className="text-[10px] text-amber-800">Tampil di Hall of Fame</div>
          </div>

          {/* Foto Terverifikasi */}
          <div className="p-4 rounded-2xl bg-[#F6FAF9] border border-[#D8DFDE] space-y-1">
            <div className="text-[11px] font-mono text-[#6F7978] uppercase flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-[#006A6A]" />
              <span>Foto Profil Aktif</span>
            </div>
            <div className="text-2xl font-black text-[#191C1C] font-display flex items-baseline gap-1.5">
              <span>{members.filter((m) => !!m.photoUrl).length}</span>
              <span className="text-xs text-[#006A6A] font-bold">Foto Siap</span>
            </div>
            <div className="text-[10px] text-[#3D5A57]">Tampil di Bracket & List Peserta</div>
          </div>
        </div>

        {/* Search & Filter Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#D8DFDE]">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-[#6F7978] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama member, ID (LLP-MBR-xxx), atau kota..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] text-xs text-[#191C1C] placeholder-[#6F7978] focus:outline-none focus:border-[#006A6A] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterFilter === 'all'
                  ? 'bg-[#006A6A] text-white shadow-xs'
                  : 'bg-[#F6FAF9] text-[#6F7978] hover:text-[#191C1C] border border-[#D8DFDE]'
              }`}
            >
              Semua ({members.length})
            </button>
            <button
              onClick={() => setFilterFilter('qualified')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filterFilter === 'qualified'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Lolos Fase Grup ({totalQualifiedCount})</span>
            </button>
            <button
              onClick={() => setFilterFilter('men')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterFilter === 'men'
                  ? 'bg-[#006A6A] text-white shadow-xs'
                  : 'bg-[#F6FAF9] text-[#6F7978] hover:text-[#191C1C] border border-[#D8DFDE]'
              }`}
            >
              Laki-laki
            </button>
            <button
              onClick={() => setFilterFilter('women')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterFilter === 'women'
                  ? 'bg-[#006A6A] text-white shadow-xs'
                  : 'bg-[#F6FAF9] text-[#6F7978] hover:text-[#191C1C] border border-[#D8DFDE]'
              }`}
            >
              Perempuan
            </button>
          </div>
        </div>
      </div>

      {/* Member Cards / Table */}
      <div className="bg-white rounded-3xl border border-[#D8DFDE] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#D8DFDE] flex items-center justify-between">
          <div className="text-xs font-bold text-[#191C1C] flex items-center gap-2">
            <span>Daftar Member Klub ({filteredMembers.length} Ditemukan)</span>
            <span className="text-[10px] text-[#6F7978] font-mono font-normal">
              · Klik foto untuk unggah foto baru seketika
            </span>
          </div>

          <div className="text-[11px] font-mono text-[#006A6A]">
            Identitas Unik: <span className="font-bold">LLP-MBR-***</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#EEF4F3] border-b border-[#D8DFDE] text-[#6F7978] font-mono text-[11px] uppercase">
                <th className="py-3.5 px-4 text-center">Foto</th>
                <th className="py-3.5 px-4">ID Unik Member</th>
                <th className="py-3.5 px-4">Nama Lengkap & Panggilan</th>
                <th className="py-3.5 px-4">Kota</th>
                <th className="py-3.5 px-4 text-center">Parameter: Lolos Fase Grup</th>
                <th className="py-3.5 px-4 text-center">Prestasi</th>
                <th className="py-3.5 px-4 text-center">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8DFDE]">
              {isLoading && members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6F7978]">
                    <div className="max-w-sm mx-auto space-y-2">
                      <RefreshCw className="w-8 h-8 text-[#006A6A] animate-spin mx-auto" />
                      <p className="font-bold text-[#191C1C]">Memuat daftar member klub...</p>
                      <p className="text-xs">Menyinkronkan data pemain dari database pusat.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6F7978]">
                    <div className="max-w-sm mx-auto space-y-2">
                      <Users className="w-8 h-8 text-[#006A6A]/40 mx-auto" />
                      <p className="font-bold text-[#191C1C]">Tidak ada member yang cocok</p>
                      <p className="text-xs">Coba sesuaikan kata kunci pencarian atau tambah member baru.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-[#F6FAF9]/80 transition-colors">
                    {/* Foto Member (Click to Quick Upload) */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="relative inline-block group">
                        {member.photoUrl && member.photoUrl !== DEFAULT_MEMBER_AVATAR ? (
                          <img
                            src={member.photoUrl}
                            alt={member.name}
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm ring-1 ring-[#D8DFDE] group-hover:opacity-80 transition-opacity"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-[#006A6A]/10 border-2 border-white shadow-sm ring-1 ring-[#006A6A]/30 flex items-center justify-center text-[#006A6A] group-hover:bg-[#006A6A]/20 transition-colors">
                            <User className="w-6 h-6 text-[#006A6A]" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleTriggerQuickPhoto(member.id)}
                          className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Klik untuk ganti / unggah foto pemain ini"
                        >
                          <Camera className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </td>

                    {/* ID Unik System-Wide */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-[#006A6A] bg-[#006A6A]/10 px-2.5 py-1 rounded-lg border border-[#006A6A]/20 inline-block text-[11px]">
                        {member.id}
                      </div>
                      <div className="text-[10px] text-[#6F7978] mt-0.5">
                        Gabung: {member.joinedDate}
                      </div>
                    </td>

                    {/* Nama Member */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#191C1C] text-sm flex items-center gap-1.5">
                        <span>{member.name}</span>
                      </div>
                      <div className="text-[11px] text-[#6F7978]">
                        Alias: <span className="font-semibold text-[#3D5A57]">{member.nickname || '-'}</span> · {member.gender}
                      </div>
                      <div className="text-[10px] text-[#6F7978] flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#006A6A]" />
                          {member.phone}
                        </span>
                      </div>
                    </td>

                    {/* Kota */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#191C1C] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#006A6A]" />
                        <span>{member.city || '-'}</span>
                      </div>
                    </td>

                    {/* PARAMETER KHUSUS: LOLOS FASE GRUP */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="space-y-1 inline-flex flex-col items-center">
                        <button
                          type="button"
                          onClick={() => handleToggleQualified(member)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                            member.isGroupQualified
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600 border border-neutral-300'
                          }`}
                          title="Klik untuk mengubah status lolos fase grup"
                        >
                          {member.isGroupQualified ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Lolos Fase Grup ✓</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Belum Lolos</span>
                            </>
                          )}
                        </button>

                        {member.isGroupQualified && member.qualifiedTournament && (
                          <div className="text-[10px] text-emerald-800 font-mono">
                            {member.qualifiedPool ? `[${member.qualifiedPool}] ` : ''}
                            {member.qualifiedTournament.split(' ')[0]}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Prestasi */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 font-mono text-[11px]">
                        {(member.achievements?.gold || 0) > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold" title="Juara 1 Emas">
                            🥇 {member.achievements.gold}
                          </span>
                        )}
                        {(member.achievements?.silver || 0) > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 border border-slate-300 font-bold" title="Juara 2 Perak">
                            🥈 {member.achievements.silver}
                          </span>
                        )}
                        {(member.achievements?.bronze || 0) > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-900 border border-orange-300 font-bold" title="Juara 3 Perunggu">
                            🥉 {member.achievements.bronze}
                          </span>
                        )}
                        {(!member.achievements || (!member.achievements.gold && !member.achievements.silver && !member.achievements.bronze)) && (
                          <span className="text-[#6F7978]">-</span>
                        )}
                      </div>
                    </td>

                    {/* Aksi Edit & Delete */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(member)}
                          className="p-1.5 rounded-lg bg-[#EEF4F3] hover:bg-[#006A6A] text-[#006A6A] hover:text-white transition-all cursor-pointer"
                          title="Edit data member"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTriggerQuickPhoto(member.id)}
                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white transition-all cursor-pointer"
                          title="Unggah foto baru"
                        >
                          <Upload className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(member)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-all cursor-pointer"
                          title="Hapus member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: TAMBAH / EDIT MEMBER KLUB */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#D8DFDE] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#D8DFDE]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#006A6A]/10 text-[#006A6A] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#191C1C] font-display">
                    {editingMemberId ? 'Edit Data Member Klub' : 'Tambah Member Klub Baru'}
                  </h3>
                  <p className="text-xs text-[#6F7978]">
                    Data akan terhubung system-wide ke list pemain, bracket knockout, dan hall of fame.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-[#6F7978] hover:text-[#191C1C] hover:bg-[#F6FAF9] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveMember} className="space-y-5">
              {/* PHOTO UPLOAD & PREVIEW SECTION */}
              <div className="p-4 rounded-2xl bg-[#F6FAF9] border border-[#D8DFDE] space-y-3">
                <label className="block text-xs font-mono font-bold text-[#3D5A57] uppercase">
                  Foto Profil Pemain (Tampil di Tamu, Bracket, List Peserta & Hall of Fame):
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative">
                    {formPhotoUrl && formPhotoUrl !== DEFAULT_MEMBER_AVATAR ? (
                      <img
                        src={formPhotoUrl}
                        alt="Preview Foto"
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-[#006A6A]"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-[#006A6A]/10 border-2 border-white shadow-md ring-2 ring-[#006A6A] flex items-center justify-center text-[#006A6A]">
                        <User className="w-10 h-10 text-[#006A6A]" />
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-[#006A6A] text-white font-mono text-[9px] font-bold">
                      PROFIL
                    </span>
                  </div>

                  <div className="space-y-2 flex-1 text-center sm:text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleFileUpload(e, false)}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-[#006A6A] hover:bg-[#007A7C] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Unggah Foto dari Komputer</span>
                      </button>

                      {formPhotoUrl && formPhotoUrl !== DEFAULT_MEMBER_AVATAR && (
                        <button
                          type="button"
                          onClick={() => setFormPhotoUrl('')}
                          className="px-3 py-2 rounded-xl bg-white hover:bg-neutral-100 border border-[#D8DFDE] text-[#6F7978] hover:text-[#191C1C] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Gunakan Ikon Default</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6F7978]">
                      Mendukung format JPG, PNG, WEBP. Jika tidak mengunggah foto, sistem otomatis menggunakan ikon profil standar bertema LagiLagi Padel.
                    </p>
                  </div>
                </div>
              </div>

              {/* IDENTITAS UNIK & NAMA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-[#3D5A57] uppercase">
                    ID Member:
                  </label>
                  <input
                    type="text"
                    required
                    readOnly
                    disabled
                    value={formId}
                    placeholder="LLP-MBR-***"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 border border-[#D8DFDE] text-xs font-mono font-bold text-[#006A6A] cursor-not-allowed select-none opacity-85"
                  />
                  <p className="text-[10px] text-[#6F7978]">
                    Disediakan otomatis oleh sistem dan tidak dapat diubah. ID ini mengikat pemain di bracket, peserta, dan hall of fame.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-[#3D5A57] uppercase">
                    Nama Lengkap Pemain *:
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Kartika Aditoputro"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8DFDE] text-xs font-bold text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                  />
                </div>
              </div>

              {/* ALIAS, GENDER, KOTA */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-[#3D5A57] uppercase">
                    Nama Panggilan / Alias:
                  </label>
                  <input
                    type="text"
                    value={formNickname}
                    onChange={(e) => setFormNickname(e.target.value)}
                    placeholder="Contoh: Tika"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8DFDE] text-xs text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-[#3D5A57] uppercase">
                    Gender / Kategori:
                  </label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8DFDE] text-xs text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                  >
                    <option value="Laki-laki">Laki-laki (Men)</option>
                    <option value="Perempuan">Perempuan (Women)</option>
                    <option value="Mix">Mix (Campuran)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-[#3D5A57] uppercase">
                    Kota:
                  </label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="Solo"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8DFDE] text-xs text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                  />
                </div>
              </div>

              {/* PARAMETER KHUSUS: LOLOS FASE GRUP (Playoff Qualified) */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border-2 border-emerald-300 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-black uppercase text-emerald-900 tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>Parameter Khusus Admin: Kualifikasi Fase Grup</span>
                    </span>
                    <h4 className="text-xs font-bold text-emerald-950">
                      Tandai Member Ini Sebagai "Lolos Fase Grup (Playoff)"
                    </h4>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsGroupQualified}
                      onChange={(e) => setFormIsGroupQualified(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {formIsGroupQualified && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-emerald-200">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-emerald-900 font-bold uppercase">
                        Turnamen yang Diloloskan:
                      </label>
                      <input
                        type="text"
                        value={formQualifiedTournament}
                        onChange={(e) => setFormQualifiedTournament(e.target.value)}
                        placeholder="Rookie Fix Mix"
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-xs text-[#191C1C]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-emerald-900 font-bold uppercase">
                        Pool / Grup:
                      </label>
                      <input
                        type="text"
                        value={formQualifiedPool}
                        onChange={(e) => setFormQualifiedPool(e.target.value)}
                        placeholder="Pool A"
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-xs text-[#191C1C]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-emerald-900 font-bold uppercase">
                        Fase Kualifikasi:
                      </label>
                      <input
                        type="text"
                        value={formQualifiedPhase}
                        onChange={(e) => setFormQualifiedPhase(e.target.value)}
                        placeholder="Top 2 Pool A (Playoff)"
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-xs text-[#191C1C]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* KONTAK: HP & EMAIL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-[#3D5A57] uppercase">
                    Nomor WhatsApp / HP:
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="0812-8822-9011"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8DFDE] text-xs text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-[#3D5A57] uppercase">
                    Alamat Email:
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="kartika@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8DFDE] text-xs text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                  />
                </div>
              </div>

              {/* MEDALI / HALL OF FAME PRESTASI */}
              <div className="p-3.5 rounded-2xl bg-[#F6FAF9] border border-[#D8DFDE] space-y-2">
                <label className="block text-xs font-mono font-bold text-[#3D5A57] uppercase">
                  Koleksi Medali & Trofi Resmi (Koneksi Hall of Fame):
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-amber-800 font-bold block mb-1">
                      🥇 Juara 1 (Gold)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formGold}
                      onChange={(e) => setFormGold(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D8DFDE] text-xs font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-700 font-bold block mb-1">
                      🥈 Juara 2 (Silver)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formSilver}
                      onChange={(e) => setFormSilver(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D8DFDE] text-xs font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-orange-800 font-bold block mb-1">
                      🥉 Juara 3 (Bronze)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formBronze}
                      onChange={(e) => setFormBronze(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D8DFDE] text-xs font-bold text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D8DFDE]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#D8DFDE] text-[#6F7978] hover:text-[#191C1C] text-xs font-bold cursor-pointer"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#006A6A] hover:bg-[#007A7C] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  {editingMemberId ? 'Simpan Perubahan Member' : 'Tambahkan Member Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS MEMBER */}
      {deletingMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#D8DFDE] max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#191C1C] font-display">
                  Konfirmasi Hapus Member
                </h3>
                <p className="text-xs text-[#6F7978] leading-relaxed">
                  Apakah Anda yakin ingin menghapus member ini dari database klub? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            {/* Member Details Preview */}
            <div className="p-3.5 rounded-2xl bg-[#F6FAF9] border border-[#D8DFDE] flex items-center gap-3">
              <img
                src={deletingMember.photoUrl}
                alt={deletingMember.name}
                className="w-12 h-12 rounded-xl object-cover border border-[#D8DFDE] shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-[#191C1C] truncate">
                  {deletingMember.name} {deletingMember.nickname ? `(${deletingMember.nickname})` : ''}
                </div>
                <div className="text-[11px] font-mono text-[#006A6A] font-bold">
                  {deletingMember.id}
                </div>
                <div className="text-[10px] text-[#6F7978] truncate">
                  {deletingMember.city || 'Member'} · {deletingMember.gender}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#D8DFDE]">
              <button
                type="button"
                onClick={() => setDeletingMember(null)}
                className="px-4 py-2.5 rounded-xl border border-[#D8DFDE] text-[#6F7978] hover:text-[#191C1C] text-xs font-bold transition-colors cursor-pointer"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Member</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
