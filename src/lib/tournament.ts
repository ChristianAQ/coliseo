import type { Match, Participant, Tournament } from '@/types';
import {
  isTournamentComplete as isSingleEliminationComplete,
  isDoubleEliminationComplete,
  getDoubleEliminationChampionId,
  getDoubleEliminationThirdPlaceId,
  generateSingleEliminationMatches,
} from './bracket';
import { computeStandings, isGroupStageComplete } from './roundRobin';

export function isTournamentComplete(t: Pick<Tournament, 'format' | 'matches' | 'phase'>): boolean {
  switch (t.format) {
    case 'SINGLE_ELIMINATION':
      return isSingleEliminationComplete(t.matches);
    case 'DOUBLE_ELIMINATION':
      return isDoubleEliminationComplete(t.matches);
    case 'ROUND_ROBIN':
      return isGroupStageComplete(t.matches);
    case 'LEAGUE':
      if (t.phase === 'GROUP') return false;
      return isSingleEliminationComplete(t.matches.filter((m) => m.bracket === 'MAIN'));
  }
}

export function getChampionId(t: Pick<Tournament, 'format' | 'matches' | 'phase' | 'participants'>): string | null {
  if (!isTournamentComplete(t)) return null;
  switch (t.format) {
    case 'SINGLE_ELIMINATION': {
      const final = t.matches.find((m) => m.label === 'Final');
      return final?.winnerId ?? null;
    }
    case 'DOUBLE_ELIMINATION':
      return getDoubleEliminationChampionId(t.matches);
    case 'ROUND_ROBIN': {
      const standings = computeStandings(t.participants, t.matches);
      return standings[0]?.participant.id ?? null;
    }
    case 'LEAGUE': {
      const final = t.matches.find((m) => m.bracket === 'MAIN' && m.label === 'Final');
      return final?.winnerId ?? null;
    }
  }
}

export function getThirdPlaceId(t: Pick<Tournament, 'format' | 'matches' | 'participants'>): string | null {
  if (t.format === 'DOUBLE_ELIMINATION') return getDoubleEliminationThirdPlaceId(t.matches);
  if (t.format === 'SINGLE_ELIMINATION' || t.format === 'LEAGUE') {
    const m = t.matches.find((mm) => mm.label === '3er puesto');
    return m?.status === 'COMPLETED' ? m.winnerId : null;
  }
  if (t.format === 'ROUND_ROBIN') {
    if (!isGroupStageComplete(t.matches)) return null;
    const standings = computeStandings(t.participants, t.matches);
    return standings[2]?.participant.id ?? null;
  }
  return null;
}

function loserOf(match: Match | undefined): string | null {
  if (!match || !match.winnerId || !match.participantA || !match.participantB) return null;
  return match.participantA.id === match.winnerId ? match.participantB.id : match.participantA.id;
}

/** Subcampeón: quien pierde la última final (o el 2º de la tabla en formatos de liga sin playoffs). */
export function getRunnerUpId(t: Pick<Tournament, 'format' | 'matches' | 'phase' | 'participants'>): string | null {
  if (!isTournamentComplete(t)) return null;
  switch (t.format) {
    case 'SINGLE_ELIMINATION':
      return loserOf(t.matches.find((m) => m.label === 'Final'));
    case 'DOUBLE_ELIMINATION': {
      const gf2 = t.matches.find((m) => m.bracket === 'GRAND_FINAL' && m.round === 2);
      const gf1 = t.matches.find((m) => m.bracket === 'GRAND_FINAL' && m.round === 1);
      const decisive = gf2 && gf2.status === 'COMPLETED' ? gf2 : gf1;
      return loserOf(decisive);
    }
    case 'ROUND_ROBIN': {
      const standings = computeStandings(t.participants, t.matches);
      return standings[1]?.participant.id ?? null;
    }
    case 'LEAGUE':
      return loserOf(t.matches.find((m) => m.bracket === 'MAIN' && m.label === 'Final'));
  }
}

/**
 * A partir de la clasificación de la fase de liga, genera el cuadro
 * eliminatorio de playoffs con los N mejores (seeded por posición en la
 * tabla) y lo añade a los partidos del torneo.
 */
export function generateLeaguePlayoffs(
  participants: Participant[],
  groupMatches: Match[],
  qualifiersCount: number,
): Match[] {
  const standings = computeStandings(participants, groupMatches);
  const qualified = standings.slice(0, qualifiersCount).map((row) => row.participant);
  const playoffMatches = generateSingleEliminationMatches(qualified, 'ORDER', qualifiersCount >= 4);
  return [...groupMatches, ...playoffMatches];
}
