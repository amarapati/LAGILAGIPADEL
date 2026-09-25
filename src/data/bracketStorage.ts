import { PADEL_TOURNAMENTS_DATA, KnockoutMatch } from './padelProTournamentsData';

export interface KnockoutBracketData {
  roundOf16?: KnockoutMatch[];
  quarters: KnockoutMatch[];
  semis: KnockoutMatch[];
  grandFinal: KnockoutMatch;
  bronzeMatch?: KnockoutMatch;
}

const STORAGE_PREFIX = 'lagilagipadel_bracket_';

// Default template for Rookie Fix Mix and others
export const getDefaultBracket = (tournamentId: string): KnockoutBracketData => {
  const tourney = PADEL_TOURNAMENTS_DATA[tournamentId] || PADEL_TOURNAMENTS_DATA['rookie-mix'];
  if (tourney && tourney.knockoutBracket) {
    return JSON.parse(JSON.stringify(tourney.knockoutBracket));
  }

  // Fallback default
  return JSON.parse(JSON.stringify(PADEL_TOURNAMENTS_DATA['rookie-mix'].knockoutBracket));
};

export const getStoredBracket = (tournamentId: string): KnockoutBracketData => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${tournamentId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.grandFinal && parsed.quarters) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading stored bracket:', err);
  }
  return getDefaultBracket(tournamentId);
};

export const saveStoredBracket = (tournamentId: string, bracket: KnockoutBracketData): void => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${tournamentId}`, JSON.stringify(bracket));
    // Dispatch custom event for real-time reactive sync across active components
    window.dispatchEvent(
      new CustomEvent('lagilagipadel_bracket_updated', {
        detail: { tournamentId, bracket }
      })
    );
  } catch (err) {
    console.error('Error saving stored bracket:', err);
  }
};

export const resetStoredBracket = (tournamentId: string): KnockoutBracketData => {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${tournamentId}`);
    const defaultData = getDefaultBracket(tournamentId);
    window.dispatchEvent(
      new CustomEvent('lagilagipadel_bracket_updated', {
        detail: { tournamentId, bracket: defaultData }
      })
    );
    return defaultData;
  } catch (err) {
    console.error('Error resetting stored bracket:', err);
    return getDefaultBracket(tournamentId);
  }
};
