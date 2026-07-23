export type TournamentFormat =
  | 'SINGLE_ELIMINATION'
  | 'DOUBLE_ELIMINATION'
  | 'ROUND_ROBIN'
  | 'LEAGUE';

export type ParticipantType = 'PLAYER' | 'TEAM';

export type PairingMode = 'ORDER' | 'RANDOM';

export type TournamentPhase = 'GROUP' | 'PLAYOFFS';

export interface Participant {
  id: string;
  name: string;
  seed: number;
  isBye?: boolean;
}

export type BracketName = 'WINNERS' | 'LOSERS' | 'GRAND_FINAL' | 'MAIN' | 'GROUP';

export type MatchStatus = 'PENDING' | 'READY' | 'COMPLETED';

export interface Match {
  id: string;
  bracket: BracketName;
  round: number;
  /** Posición dentro de la ronda, de arriba a abajo */
  position: number;
  participantA: Participant | null;
  participantB: Participant | null;
  scoreA: number | null;
  scoreB: number | null;
  winnerId: string | null;
  status: MatchStatus;
  label?: string; // p.ej. "Final", "3er puesto", "Final WB"...
  nextMatchId?: string | null;
  nextMatchSlot?: 'A' | 'B' | null;
  /** A qué partido cae el perdedor (3er puesto en eliminación simple, cuadro de perdedores en doble eliminación) */
  loserNextMatchId?: string | null;
  loserNextMatchSlot?: 'A' | 'B' | null;
}

export interface StandingRow {
  participant: Participant;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  scoreFor: number;
  scoreAgainst: number;
}

/** Números de participantes permitidos en formatos de cuadro (Single/Double Elimination) */
export const BRACKET_SIZES = [2, 4, 8, 16, 32] as const;
export type BracketSize = (typeof BRACKET_SIZES)[number];

/** Opciones de clasificados a playoffs disponibles en formato Liga */
export const QUALIFIER_OPTIONS = [2, 4, 8, 16] as const;

export interface TournamentConfig {
  name: string;
  format: TournamentFormat;
  thirdPlaceMatch: boolean;
  participantType: ParticipantType;
  participantCount: number;
  participants: Participant[];
  pairingMode: PairingMode;
  /** Solo formato Liga: cuántos clasifican a la fase eliminatoria */
  qualifiersCount: number;
}

export interface Tournament extends TournamentConfig {
  id: string;
  createdAt: string;
  matches: Match[];
  currentRound: number;
  isComplete: boolean;
  /** Solo formato Liga: en qué fase está */
  phase: TournamentPhase;
}

export const FORMAT_LABELS: Record<TournamentFormat, string> = {
  SINGLE_ELIMINATION: 'Eliminación simple',
  DOUBLE_ELIMINATION: 'Eliminación doble',
  ROUND_ROBIN: 'Todos contra todos',
  LEAGUE: 'Liga',
};

export const FORMAT_DESCRIPTIONS: Record<TournamentFormat, string> = {
  SINGLE_ELIMINATION: 'El perdedor de cada partido queda eliminado inmediatamente.',
  DOUBLE_ELIMINATION: 'Un participante queda eliminado tras perder dos partidos.',
  ROUND_ROBIN: 'Todos los participantes juegan contra todos. Gana quien más puntos sume.',
  LEAGUE: 'Todos contra todos y los mejores clasificados juegan una fase eliminatoria.',
};
