import { apiFetchRefereeState, apiSaveRefereeState } from './apiClient';

export interface RefereeScoringState {
  teamAName: string;
  teamBName: string;
  courtScoreA: number; // 0=0, 1=15, 2=30, 3=40
  courtScoreB: number;
  gamesTeamA: number;
  gamesTeamB: number;
  currentSetA: number;
  currentSetB: number;
  currentServer: 'A' | 'B';
  goldenPointActive: boolean;
  scoreHistory: string[];
  officialRefereeNotes: string;
  activeCourt: number;
  matchPhase: string;
  selectedTourneyId: string;
  isCleared: boolean;
}

export const EMPTY_REFEREE_STATE: RefereeScoringState = {
  teamAName: 'Tim A (TBD)',
  teamBName: 'Tim B (TBD)',
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
  activeCourt: 1,
  matchPhase: 'Babak Pertandingan',
  selectedTourneyId: '',
  isCleared: true,
};

export const DEFAULT_REFEREE_STATE: RefereeScoringState = {
  teamAName: 'Olivia & Rico',
  teamBName: 'Kartika & Dodie',
  courtScoreA: 2,
  courtScoreB: 1,
  gamesTeamA: 3,
  gamesTeamB: 2,
  currentSetA: 1,
  currentSetB: 0,
  currentServer: 'A',
  goldenPointActive: false,
  scoreHistory: [
    'Game 1 dimenangkan Tim A (40-15)',
    'Game 2 dimenangkan Tim B (Golden Point 40-40)',
    'Game 3 dimenangkan Tim A (40-30)'
  ],
  officialRefereeNotes: 'Pertandingan berjalan kondusif sesuai regulasi FIP Padel Pro.',
  activeCourt: 2,
  matchPhase: 'Grand Final',
  selectedTourneyId: 'rookie-mix',
  isCleared: false,
};

export const REFEREE_STORAGE_KEY = 'lagilagipadel_referee_state';

let memoryRefereeState: RefereeScoringState = DEFAULT_REFEREE_STATE;

// Trigger initial load directly from MySQL server API on module load
if (typeof window !== 'undefined') {
  apiFetchRefereeState()
    .then((state) => {
      if (state) memoryRefereeState = state;
    })
    .catch(() => {});

  window.addEventListener('lagilagipadel_referee_state_changed', (e: Event) => {
    const ce = e as CustomEvent;
    if (ce.detail?.state) {
      memoryRefereeState = ce.detail.state;
    }
  });

  window.addEventListener('lagilagipadel_scoring_reset', (e: Event) => {
    const ce = e as CustomEvent;
    if (ce.detail?.state) {
      memoryRefereeState = ce.detail.state;
    }
  });
}

export const getStoredRefereeState = (): RefereeScoringState => {
  return memoryRefereeState;
};

export const saveStoredRefereeState = (state: RefereeScoringState): void => {
  memoryRefereeState = state;
  try {
    localStorage.setItem(REFEREE_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {}
  
  // Persist directly to MySQL database server
  apiSaveRefereeState(state).catch((err) => {
    console.warn('[Sync] Server referee state error:', err);
  });
  window.dispatchEvent(
    new CustomEvent('lagilagipadel_referee_state_changed', {
      detail: { state }
    })
  );
};

export const clearStoredRefereeState = (): void => {
  memoryRefereeState = EMPTY_REFEREE_STATE;
  try {
    localStorage.setItem(REFEREE_STORAGE_KEY, JSON.stringify(EMPTY_REFEREE_STATE));
  } catch (err) {}
  apiSaveRefereeState(EMPTY_REFEREE_STATE).catch(() => {});
  window.dispatchEvent(
    new CustomEvent('lagilagipadel_scoring_reset', {
      detail: { state: EMPTY_REFEREE_STATE, cleared: true }
    })
  );
};

export const restoreStoredRefereeState = (): void => {
  memoryRefereeState = DEFAULT_REFEREE_STATE;
  try {
    localStorage.setItem(REFEREE_STORAGE_KEY, JSON.stringify(DEFAULT_REFEREE_STATE));
  } catch (err) {}
  apiSaveRefereeState(DEFAULT_REFEREE_STATE).catch(() => {});
  window.dispatchEvent(
    new CustomEvent('lagilagipadel_scoring_reset', {
      detail: { state: DEFAULT_REFEREE_STATE, resetToDefault: true }
    })
  );
};
