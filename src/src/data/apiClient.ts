import { FullTournamentDetail } from './padelProTournamentsData';
import { ClubMember } from './clubMembersStorage';
import { PoolGroupData } from './tournamentGroupStorage';
import { KnockoutBracketData } from './bracketStorage';
import { RefereeScoringState } from './refereeStorage';

// Local storage backup keys for offline resilience
const TOURNAMENTS_KEY = 'lagilagipadel_custom_tournaments';
const MEMBERS_KEY = 'lagilagipadel_club_members';
const GROUPS_PREFIX = 'lagilagipadel_groups_';
const BRACKET_PREFIX = 'lagilagipadel_bracket_';
const REFEREE_KEY = 'lagilagipadel_referee_state';

let lastKnownServerSync: string = '';
let isSyncing = false;
let serverOnline = true;

export interface ServerSyncStatus {
  online: boolean;
  lastSyncTime: string;
  tournamentsCount: number;
  membersCount: number;
}

let syncStatusListeners: ((status: ServerSyncStatus) => void)[] = [];

export function subscribeToSyncStatus(listener: (status: ServerSyncStatus) => void) {
  syncStatusListeners.push(listener);
  return () => {
    syncStatusListeners = syncStatusListeners.filter((l) => l !== listener);
  };
}

function notifySyncStatus(status: ServerSyncStatus) {
  syncStatusListeners.forEach((l) => l(status));
}

/**
 * Universal anti-cached GET request that appends timestamp query parameter
 * and sends strict Cache-Control headers to defeat aggressive browser caching.
 */
async function apiGet<T>(endpoint: string): Promise<T> {
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${endpoint}${separator}_t=${Date.now()}`;
  const res = await fetch(url, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

// ----------------- TOURNAMENTS API ----------------- //

export async function apiFetchTournaments(): Promise<FullTournamentDetail[]> {
  try {
    const data = await apiGet<FullTournamentDetail[]>('/api/tournaments');
    localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(data));
    serverOnline = true;
    window.dispatchEvent(new CustomEvent('lagilagipadel_tournaments_updated', { detail: { tournaments: data } }));
    return data;
  } catch (err) {
    console.warn('[Sync] Falling back to local cache for tournaments:', err);
    serverOnline = false;
    const cached = localStorage.getItem(TOURNAMENTS_KEY);
    return cached ? JSON.parse(cached) : [];
  }
}

export async function apiUploadTournamentBanner(file: File): Promise<{ success: boolean; url?: string; path?: string; fileName?: string; error?: string }> {
  try {
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Gagal membaca berkas gambar.'));
      reader.readAsDataURL(file);
    });

    const res = await fetch('/api/upload/banner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileData: base64Data,
        fileName: file.name
      })
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Upload gagal dengan status ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      url: data.url,
      path: data.path,
      fileName: data.fileName
    };
  } catch (err: any) {
    console.error('[API] Error uploading tournament banner:', err);
    return {
      success: false,
      error: err.message || 'Gagal mengunggah banner ke server.'
    };
  }
}

export async function apiSaveTournament(tourney: FullTournamentDetail): Promise<FullTournamentDetail> {
  // Optimistically update local
  try {
    const raw = localStorage.getItem(TOURNAMENTS_KEY);
    const list: FullTournamentDetail[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex((t) => t.id === tourney.id);
    if (idx >= 0) list[idx] = tourney;
    else list.unshift(tourney);
    localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(list));
  } catch (e) {}

  try {
    const res = await fetch('/api/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tourney)
    });
    if (!res.ok) throw new Error(`Failed to save tournament: ${res.statusText}`);
    const saved = await res.json();
    window.dispatchEvent(new CustomEvent('lagilagipadel_tournaments_updated', { detail: { tournaments: [saved] } }));
    return saved;
  } catch (err) {
    console.error('[API] Error saving tournament to server:', err);
    window.dispatchEvent(new CustomEvent('lagilagipadel_tournaments_updated', { detail: { tournaments: [] } }));
    return tourney;
  }
}

export async function apiDeleteTournament(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/tournaments/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Failed to delete tournament: ${res.statusText}`);
    
    // Update local cache
    const raw = localStorage.getItem(TOURNAMENTS_KEY);
    if (raw) {
      const list: FullTournamentDetail[] = JSON.parse(raw);
      localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(list.filter((t) => t.id !== id)));
    }
    window.dispatchEvent(new CustomEvent('lagilagipadel_tournaments_updated', { detail: { deletedId: id } }));
    return true;
  } catch (err) {
    console.error('[API] Error deleting tournament:', err);
    return false;
  }
}

export async function apiUpdateTournamentStatus(id: string, status: 'Live' | 'Akan Datang' | 'Selesai'): Promise<FullTournamentDetail | null> {
  try {
    const res = await fetch(`/api/tournaments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error(`Failed to update status`);
    const updated = await res.json();
    window.dispatchEvent(new CustomEvent('lagilagipadel_tournaments_updated', { detail: { updatedTournament: updated } }));
    return updated;
  } catch (err) {
    console.error('[API] Error updating tournament status:', err);
    return null;
  }
}

// ----------------- CLUB MEMBERS API ----------------- //

export async function apiFetchMembers(): Promise<ClubMember[]> {
  try {
    const data = await apiGet<ClubMember[]>('/api/members');
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(data));
    serverOnline = true;
    window.dispatchEvent(new CustomEvent('lagilagipadel_members_updated', { detail: { members: data } }));
    return data;
  } catch (err) {
    console.warn('[Sync] Falling back to local cache for members:', err);
    serverOnline = false;
    const cached = localStorage.getItem(MEMBERS_KEY);
    return cached ? JSON.parse(cached) : [];
  }
}

export async function apiSaveMember(member: ClubMember, isNew?: boolean): Promise<ClubMember> {
  try {
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...member, isNew: Boolean(isNew) })
    });
    if (!res.ok) throw new Error(`Failed to save member: ${res.statusText}`);
    const saved = await res.json();
    
    // Update local cache
    const members = await apiFetchMembers();
    window.dispatchEvent(new CustomEvent('lagilagipadel_members_updated', { detail: { members } }));
    return saved;
  } catch (err) {
    console.error('[API] Error saving member:', err);
    return member;
  }
}

export async function apiDeleteMember(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Failed to delete member`);
    const members = await apiFetchMembers();
    window.dispatchEvent(new CustomEvent('lagilagipadel_members_updated', { detail: { members } }));
    return true;
  } catch (err) {
    console.error('[API] Error deleting member:', err);
    return false;
  }
}

// ----------------- TOURNAMENT GROUPS & ALLOCATION API ----------------- //

export async function apiFetchGroups(tournamentId: string): Promise<PoolGroupData[]> {
  if (!tournamentId) return [];
  try {
    const data = await apiGet<PoolGroupData[]>(`/api/groups/${tournamentId}`);
    localStorage.setItem(`${GROUPS_PREFIX}${tournamentId}`, JSON.stringify(data));
    return data;
  } catch (err) {
    console.warn(`[Sync] Fallback to cache for groups ${tournamentId}:`, err);
    const cached = localStorage.getItem(`${GROUPS_PREFIX}${tournamentId}`);
    return cached ? JSON.parse(cached) : [];
  }
}

function syncSavedTournamentLocally(tourney: FullTournamentDetail | undefined, tournamentId?: string) {
  if (tourney) {
    try {
      const raw = localStorage.getItem(TOURNAMENTS_KEY);
      const list: FullTournamentDetail[] = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex((t) => t.id === tourney.id);
      if (idx >= 0) list[idx] = tourney;
      else list.unshift(tourney);
      localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('lagilagipadel_tournaments_updated', { detail: { tournaments: list, updatedTournament: tourney } }));
    } catch (e) {
      console.warn('[Sync] Local tourney cache update error:', e);
    }
  } else if (tournamentId) {
    apiFetchTournaments().catch(() => {});
  }
}

export async function apiSaveGroups(tournamentId: string, pools: PoolGroupData[]): Promise<PoolGroupData[]> {
  localStorage.setItem(`${GROUPS_PREFIX}${tournamentId}`, JSON.stringify(pools));
  try {
    const res = await fetch(`/api/groups/${tournamentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pools })
    });
    if (!res.ok) throw new Error(`Failed to save groups: ${res.statusText}`);
    const data = await res.json();
    const savedPools = data.pools || data;
    syncSavedTournamentLocally(data.tournament, tournamentId);
    window.dispatchEvent(new CustomEvent('lagilagipadel_groups_updated', { detail: { tournamentId, pools: savedPools } }));
    return savedPools;
  } catch (err) {
    console.error('[API] Error saving groups:', err);
    window.dispatchEvent(new CustomEvent('lagilagipadel_groups_updated', { detail: { tournamentId, pools } }));
    return pools;
  }
}

export interface AssignMemberApiParams {
  tournamentId: string;
  targetPool: string;
  member1Id: string;
  member2Id?: string;
  customTeamName?: string;
  seed?: number;
}

export async function apiAssignMemberToPool(params: AssignMemberApiParams): Promise<PoolGroupData[]> {
  try {
    const res = await fetch(`/api/groups/${params.tournamentId}/assign-member`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menaruh member ke pool.');
    }
    const data = await res.json();
    const updatedPools = data.pools;
    localStorage.setItem(`${GROUPS_PREFIX}${params.tournamentId}`, JSON.stringify(updatedPools));
    syncSavedTournamentLocally(data.tournament, params.tournamentId);
    window.dispatchEvent(new CustomEvent('lagilagipadel_groups_updated', { detail: { tournamentId: params.tournamentId, pools: updatedPools } }));
    return updatedPools;
  } catch (err) {
    console.error('[API] Error assigning member to pool:', err);
    throw err;
  }
}

export async function apiRemoveTeamFromPool(tournamentId: string, teamId: string): Promise<PoolGroupData[]> {
  try {
    const res = await fetch(`/api/groups/${tournamentId}/remove-team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId })
    });
    if (!res.ok) throw new Error('Failed to remove team');
    const data = await res.json();
    localStorage.setItem(`${GROUPS_PREFIX}${tournamentId}`, JSON.stringify(data.pools));
    syncSavedTournamentLocally(data.tournament, tournamentId);
    window.dispatchEvent(new CustomEvent('lagilagipadel_groups_updated', { detail: { tournamentId, pools: data.pools } }));
    return data.pools;
  } catch (err) {
    console.error('[API] Error removing team:', err);
    throw err;
  }
}

export async function apiMoveTeamToPool(tournamentId: string, teamId: string, targetPool: string): Promise<PoolGroupData[]> {
  try {
    const res = await fetch(`/api/groups/${tournamentId}/move-team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, targetPool })
    });
    if (!res.ok) throw new Error('Failed to move team');
    const data = await res.json();
    localStorage.setItem(`${GROUPS_PREFIX}${tournamentId}`, JSON.stringify(data.pools));
    syncSavedTournamentLocally(data.tournament, tournamentId);
    window.dispatchEvent(new CustomEvent('lagilagipadel_groups_updated', { detail: { tournamentId, pools: data.pools } }));
    return data.pools;
  } catch (err) {
    console.error('[API] Error moving team:', err);
    throw err;
  }
}

// ----------------- BRACKETS API ----------------- //

export async function apiFetchBracket(tournamentId: string): Promise<KnockoutBracketData> {
  if (!tournamentId) throw new Error('tournamentId required');
  try {
    const data = await apiGet<KnockoutBracketData>(`/api/brackets/${tournamentId}`);
    localStorage.setItem(`${BRACKET_PREFIX}${tournamentId}`, JSON.stringify(data));
    return data;
  } catch (err) {
    console.warn(`[Sync] Fallback to cache for bracket ${tournamentId}:`, err);
    const cached = localStorage.getItem(`${BRACKET_PREFIX}${tournamentId}`);
    if (cached) return JSON.parse(cached);
    throw err;
  }
}

export async function apiSaveBracket(tournamentId: string, bracket: KnockoutBracketData): Promise<KnockoutBracketData> {
  localStorage.setItem(`${BRACKET_PREFIX}${tournamentId}`, JSON.stringify(bracket));
  try {
    const res = await fetch(`/api/brackets/${tournamentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bracket })
    });
    if (!res.ok) throw new Error(`Failed to save bracket: ${res.statusText}`);
    const saved = await res.json();
    window.dispatchEvent(new CustomEvent('lagilagipadel_bracket_updated', { detail: { tournamentId, bracket: saved } }));
    return saved;
  } catch (err) {
    console.error('[API] Error saving bracket to server:', err);
    window.dispatchEvent(new CustomEvent('lagilagipadel_bracket_updated', { detail: { tournamentId, bracket } }));
    return bracket;
  }
}

// ----------------- REFEREE LIVE SCORING API ----------------- //

export async function apiFetchRefereeState(): Promise<RefereeScoringState> {
  try {
    const data = await apiGet<RefereeScoringState>('/api/referee/state');
    localStorage.setItem(REFEREE_KEY, JSON.stringify(data));
    return data;
  } catch (err) {
    const cached = localStorage.getItem(REFEREE_KEY);
    if (cached) return JSON.parse(cached);
    throw err;
  }
}

export async function apiSaveRefereeState(state: RefereeScoringState): Promise<RefereeScoringState> {
  localStorage.setItem(REFEREE_KEY, JSON.stringify(state));
  try {
    const res = await fetch('/api/referee/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    });
    if (!res.ok) throw new Error(`Failed to save referee state`);
    const saved = await res.json();
    window.dispatchEvent(new CustomEvent('lagilagipadel_referee_state_changed', { detail: { state: saved } }));
    return saved;
  } catch (err) {
    console.error('[API] Error saving referee state:', err);
    return state;
  }
}

// ----------------- SYSTEM RESET & SEED API ----------------- //

export async function apiResetSystem(cleanSlate = false): Promise<void> {
  try {
    const res = await fetch('/api/system/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cleanSlate })
    });
    if (!res.ok) throw new Error('Failed to reset system');
    
    // Clear local storage
    if (cleanSlate) {
      localStorage.clear();
    }
    // Refetch all and dispatch
    await apiFetchTournaments();
    await apiFetchMembers();
    window.dispatchEvent(new CustomEvent('lagilagipadel_tournaments_updated', { detail: {} }));
    window.dispatchEvent(new CustomEvent('lagilagipadel_members_updated', { detail: {} }));
    window.dispatchEvent(new CustomEvent('lagilagipadel_scoring_reset', { detail: { resetToEmpty: cleanSlate } }));
  } catch (err) {
    console.error('[API] Reset system failed:', err);
  }
}

export async function apiSeedDefault(): Promise<void> {
  try {
    const res = await fetch('/api/system/seed', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to seed system');
    await apiFetchTournaments();
    await apiFetchMembers();
    window.dispatchEvent(new CustomEvent('lagilagipadel_tournaments_updated', { detail: {} }));
    window.dispatchEvent(new CustomEvent('lagilagipadel_members_updated', { detail: {} }));
    window.dispatchEvent(new CustomEvent('lagilagipadel_scoring_reset', { detail: { resetToDefault: true } }));
  } catch (err) {
    console.error('[API] Seed default failed:', err);
  }
}

// ----------------- BACKGROUND MULTI-DEVICE REAL-TIME SYNC ----------------- //

let pollInterval: any = null;

export function startBackgroundSync(intervalMs = 1000): () => void {
  if (pollInterval) return () => {};

  const checkSync = async () => {
    if (isSyncing) return;
    isSyncing = true;
    try {
      const data = await apiGet<any>('/api/sync/summary');
      serverOnline = true;

      notifySyncStatus({
        online: true,
        lastSyncTime: data.lastUpdated || new Date().toISOString(),
        tournamentsCount: data.tournamentsCount,
        membersCount: data.membersCount
      });

      if (data.lastUpdated && data.lastUpdated !== lastKnownServerSync) {
        lastKnownServerSync = data.lastUpdated;
        
        // Data has changed on the server (by another device or admin)!
        // Pull fresh tournaments, members, and referee state
        const [freshTourneys, freshMembers, freshReferee] = await Promise.all([
          apiFetchTournaments(),
          apiFetchMembers(),
          apiFetchRefereeState()
        ]);

        // Also pull fresh groups and brackets for each tournament
        await Promise.all(
          freshTourneys.map(async (t) => {
            try {
              const [pools, bracket] = await Promise.all([
                apiFetchGroups(t.id),
                apiFetchBracket(t.id)
              ]);
              window.dispatchEvent(
                new CustomEvent('lagilagipadel_groups_updated', { detail: { tournamentId: t.id, pools } })
              );
              window.dispatchEvent(
                new CustomEvent('lagilagipadel_bracket_updated', { detail: { tournamentId: t.id, bracket } })
              );
            } catch (e) {}
          })
        );

        window.dispatchEvent(new CustomEvent('lagilagipadel_tournaments_updated', { detail: { tournaments: freshTourneys } }));
        window.dispatchEvent(new CustomEvent('lagilagipadel_members_updated', { detail: { members: freshMembers } }));
        window.dispatchEvent(new CustomEvent('lagilagipadel_referee_state_changed', { detail: freshReferee }));
      }
    } catch (err) {
      serverOnline = false;
      notifySyncStatus({
        online: false,
        lastSyncTime: new Date().toISOString(),
        tournamentsCount: 0,
        membersCount: 0
      });
    } finally {
      isSyncing = false;
    }
  };

  // Run immediately then periodically
  checkSync();
  pollInterval = setInterval(checkSync, intervalMs);

  return () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  };
}

// ----------------- AUTH & ACCOUNTS (SHA-256) ----------------- //

export interface AuthUser {
  username: string;
  account_type: 'admin' | 'wasit';
  name: string;
  role: string;
}

export interface StoredAccountItem {
  username: string;
  account_type: 'admin' | 'wasit';
  name: string;
  created_at: string;
}

export async function sha256Browser(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function apiLogin(
  username: string,
  pass: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: pass })
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Login gagal.' };
    }
    return { success: true, user: data.user };
  } catch (err: any) {
    const cleanUser = username.trim().toLowerCase();
    const hash = await sha256Browser(pass.trim());

    // Offline / direct fallback accounts map
    const OFFLINE_ACCOUNTS: Record<string, { hash: string; account_type: 'admin' | 'wasit'; name: string; role: string }> = {
      admin: {
        hash: '9b5a9616c3149dca0a2c4d82d19b4650f6a7433673ea72e6d04fc8c57b44952b',
        account_type: 'admin',
        name: 'admin',
        role: 'Super Admin / Panitia Pusat'
      },
      amarapati: {
        hash: '8e27902b278f2be3e676728c38f6b173e860901b1915c86e1a9af30fd7f35b0e',
        account_type: 'admin',
        name: 'amarapati',
        role: 'Super Admin / Panitia Pusat'
      },
      wasit1: {
        hash: '2350370b5e70b82cea6a60b6200f3dabb422f0f8d8b85935f73e63906069009c',
        account_type: 'wasit',
        name: 'Wasit 1',
        role: 'Wasit Pertandingan'
      },
      wasit2: {
        hash: '4b7f1c8a444c045172e4bad8f01f25476dd006e13d5fb8a225e34c6bc75a8b2e',
        account_type: 'wasit',
        name: 'Wasit 2',
        role: 'Wasit Pertandingan'
      },
      wasit3: {
        hash: 'f3965c3cf29845f86beffc8b232d604198a0403549fe467325ac08fb2ac03552',
        account_type: 'wasit',
        name: 'Wasit 3',
        role: 'Wasit Pertandingan'
      },
      wasit4: {
        hash: '218c16ce193e9013b36dc4f39e1e577db08773259714ca94c1a37bceaf6b46b6',
        account_type: 'wasit',
        name: 'Wasit 4',
        role: 'Wasit Pertandingan'
      },
      wasit5: {
        hash: 'a24f35dc78869002cc13ea2849d642e869a89bd5c45108cebcf0f5de9121d2b5',
        account_type: 'wasit',
        name: 'Wasit 5',
        role: 'Wasit Pertandingan'
      },
      wasit6: {
        hash: '1b303dc0cfc8ccb00c5cf9c8f1f96cf7d30a96f1aea647bebbfaea2f1e29a3ae',
        account_type: 'wasit',
        name: 'Wasit 6',
        role: 'Wasit Pertandingan'
      }
    };

    const matched = OFFLINE_ACCOUNTS[cleanUser];
    if (matched && matched.hash === hash) {
      return {
        success: true,
        user: {
          username: cleanUser,
          account_type: matched.account_type,
          name: matched.name,
          role: matched.role
        }
      };
    }

    return {
      success: false,
      error: 'Username atau kata sandi / PIN yang Anda masukkan tidak sesuai.'
    };
  }
}

export async function apiFetchAccounts(): Promise<StoredAccountItem[]> {
  try {
    const res = await fetch('/api/auth/accounts');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    return [
      { username: 'admin', account_type: 'admin', name: 'admin', created_at: '2026-09-30T11:39:57.276Z' },
      { username: 'amarapati', account_type: 'admin', name: 'amarapati', created_at: '2026-09-30T11:39:57.276Z' },
      { username: 'wasit1', account_type: 'wasit', name: 'Wasit 1', created_at: '2026-09-30T11:39:57.276Z' },
      { username: 'wasit2', account_type: 'wasit', name: 'Wasit 2', created_at: '2026-09-30T11:39:57.276Z' },
      { username: 'wasit3', account_type: 'wasit', name: 'Wasit 3', created_at: '2026-09-30T11:39:57.276Z' },
      { username: 'wasit4', account_type: 'wasit', name: 'Wasit 4', created_at: '2026-09-30T11:39:57.276Z' },
      { username: 'wasit5', account_type: 'wasit', name: 'Wasit 5', created_at: '2026-09-30T11:39:57.276Z' },
      { username: 'wasit6', account_type: 'wasit', name: 'Wasit 6', created_at: '2026-09-30T11:39:57.276Z' }
    ];
  }
}

export async function apiSaveAccount(data: {
  username: string;
  password?: string;
  account_type: string;
  name?: string;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export async function apiDeleteAccount(username: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/auth/accounts/${encodeURIComponent(username)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}
