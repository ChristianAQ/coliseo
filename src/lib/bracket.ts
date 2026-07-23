import type { Match, Participant, PairingMode } from '@/types';

let uid = 0;
const genId = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${uid++}`;

export function nextPowerOfTwo(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

/**
 * Genera el orden de siembra estándar de un cuadro de N (potencia de 2),
 * de forma que los mejores seeds queden lo más separados posible
 * (1 vs N, 2 vs N-1 en la final "teórica", etc).
 */
export function generateSeedOrder(size: number): number[] {
  if (size === 1) return [1];
  let seeds = [1, 2];
  let current = 2;
  while (current < size) {
    const s = current * 2;
    const next: number[] = [];
    for (const seed of seeds) {
      next.push(seed, s + 1 - seed);
    }
    seeds = next;
    current = s;
  }
  return seeds;
}

/**
 * Ordena los participantes según el modo elegido (orden de entrada o aleatorio)
 * y les asigna un número de seed 1..n.
 */
export function assignSeeds(participants: Participant[], mode: PairingMode): Participant[] {
  const list = [...participants];
  if (mode === 'RANDOM') {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
  }
  return list.map((p, i) => ({ ...p, seed: i + 1 }));
}

export const BYE: Participant = { id: '__BYE__', name: 'BYE', seed: -1, isBye: true };

function findMatch(matches: Match[], id: string | null | undefined) {
  return matches.find((m) => m.id === id) ?? null;
}

/**
 * Hace avanzar al ganador (y, si aplica, al perdedor) a los partidos enlazados.
 * Se usa tanto para resultados reales como para resolver BYEs, y es válida
 * para eliminación simple y doble (usa los mismos campos de enlace).
 */
function propagateWinner(matches: Match[], match: Match, winner: Participant, loser: Participant) {
  if (match.nextMatchId) {
    const next = findMatch(matches, match.nextMatchId);
    if (next) {
      if (match.nextMatchSlot === 'A') next.participantA = winner;
      else next.participantB = winner;
    }
  }
  if (match.loserNextMatchId) {
    const next = findMatch(matches, match.loserNextMatchId);
    if (next) {
      if (match.loserNextMatchSlot === 'A') next.participantA = loser;
      else next.participantB = loser;
    }
  }
}

/**
 * Resuelve en cascada todos los partidos con BYE: si un lado es BYE, el otro
 * avanza automáticamente. Si AMBOS lados son BYE (puede pasar en el cuadro de
 * perdedores de la eliminación doble cuando dos ramas mueren a la vez), se
 * propaga un "BYE fantasma" para que el siguiente partido también se resuelva
 * solo, en vez de quedarse bloqueado esperando un rival que nunca llegará.
 *
 * IMPORTANTE: el BYE se propaga también como "perdedor" (a loserNextMatchId).
 * Antes esto se bloqueaba deliberadamente, lo que dejaba el partido por el
 * 3er puesto con una plaza vacía para siempre en cualquier torneo pequeño
 * (3-4 participantes) donde una semifinal se decidía por BYE: el hueco nunca
 * llegaba y el partido quedaba "Por determinar" de forma permanente.
 */
function resolveByes(matches: Match[]): Match[] {
  let changed = true;
  while (changed) {
    changed = false;
    for (const m of matches) {
      if (m.status === 'COMPLETED') continue;
      const aIsBye = m.participantA?.isBye ?? false;
      const bIsBye = m.participantB?.isBye ?? false;
      if (m.participantA && m.participantB && (aIsBye || bIsBye)) {
        const bothBye = aIsBye && bIsBye;
        const winner = bothBye ? BYE : aIsBye ? m.participantB : m.participantA;
        const loser = bothBye ? BYE : aIsBye ? m.participantA : m.participantB;
        m.winnerId = bothBye ? null : winner!.id;
        m.status = 'COMPLETED';
        m.scoreA = null;
        m.scoreB = null;
        propagateWinner(matches, m, winner!, loser!);
        changed = true;
      } else if (m.participantA && m.participantB) {
        m.status = 'READY';
      }
    }
  }
  return matches;
}

/* ------------------------------------------------------------------ */
/*  Eliminación simple                                                 */
/* ------------------------------------------------------------------ */

export function generateSingleEliminationMatches(
  participants: Participant[],
  pairingMode: PairingMode,
  includeThirdPlace: boolean,
): Match[] {
  const seeded = assignSeeds(participants, pairingMode);
  const size = nextPowerOfTwo(seeded.length);
  const order = generateSeedOrder(size);

  const bySeed = new Map<number, Participant>();
  seeded.forEach((p) => bySeed.set(p.seed, p));
  const slots: Participant[] = order.map((seedNum) => bySeed.get(seedNum) ?? BYE);

  const totalRounds = Math.log2(size);
  const matches: Match[] = [];
  const roundMatches: Match[][] = [];

  for (let round = 1; round <= totalRounds; round++) {
    const count = size / 2 ** round;
    const thisRound: Match[] = [];
    for (let pos = 0; pos < count; pos++) {
      thisRound.push({
        id: genId('m'),
        bracket: 'MAIN',
        round,
        position: pos,
        participantA: round === 1 ? slots[pos * 2] : null,
        participantB: round === 1 ? slots[pos * 2 + 1] : null,
        scoreA: null,
        scoreB: null,
        winnerId: null,
        status: 'PENDING',
        nextMatchId: null,
        nextMatchSlot: null,
        label: round === totalRounds ? 'Final' : undefined,
      });
    }
    roundMatches.push(thisRound);
    matches.push(...thisRound);
  }

  for (let round = 1; round < totalRounds; round++) {
    roundMatches[round - 1].forEach((m, i) => {
      const nextMatch = roundMatches[round][Math.floor(i / 2)];
      m.nextMatchId = nextMatch.id;
      m.nextMatchSlot = i % 2 === 0 ? 'A' : 'B';
    });
  }

  if (includeThirdPlace && totalRounds >= 2) {
    const semis = roundMatches[totalRounds - 2];
    const thirdPlaceMatch: Match = {
      id: genId('m3'),
      bracket: 'MAIN',
      round: totalRounds,
      position: 1,
      participantA: null,
      participantB: null,
      scoreA: null,
      scoreB: null,
      winnerId: null,
      status: 'PENDING',
      nextMatchId: null,
      nextMatchSlot: null,
      label: '3er puesto',
    };
    semis.forEach((m, i) => {
      m.loserNextMatchId = thirdPlaceMatch.id;
      m.loserNextMatchSlot = i % 2 === 0 ? 'A' : 'B';
    });
    matches.push(thirdPlaceMatch);
  }

  matches.forEach((m) => {
    if (m.round === 1 && m.participantA && m.participantB) m.status = 'READY';
  });

  return resolveByes(matches);
}

export function isTournamentComplete(matches: Match[]): boolean {
  const real = matches.filter((m) => m.label !== '3er puesto');
  if (real.length === 0) return false;
  const finalRound = Math.max(...real.map((m) => m.round));
  return real.filter((m) => m.round === finalRound).every((m) => m.status === 'COMPLETED');
}

export function getRoundLabel(round: number, totalRounds: number): string {
  const diff = totalRounds - round;
  if (diff === 0) return 'Final';
  if (diff === 1) return 'Semifinales';
  if (diff === 2) return 'Cuartos de final';
  if (diff === 3) return 'Octavos de final';
  return `Ronda ${round}`;
}

/* ------------------------------------------------------------------ */
/*  Eliminación doble                                                  */
/* ------------------------------------------------------------------ */

function makeMatch(bracket: Match['bracket'], round: number, position: number, label?: string): Match {
  return {
    id: genId('dm'),
    bracket,
    round,
    position,
    participantA: null,
    participantB: null,
    scoreA: null,
    scoreB: null,
    winnerId: null,
    status: 'PENDING',
    nextMatchId: null,
    nextMatchSlot: null,
    loserNextMatchId: null,
    loserNextMatchSlot: null,
    label,
  };
}

/**
 * Genera cuadro de ganadores + cuadro de perdedores + gran final (con posible
 * partido decisivo/"bracket reset" si quien viene del cuadro de perdedores
 * gana la primera gran final).
 */
export function generateDoubleEliminationMatches(
  participants: Participant[],
  pairingMode: PairingMode,
): Match[] {
  const seeded = assignSeeds(participants, pairingMode);
  const size = nextPowerOfTwo(seeded.length);
  const order = generateSeedOrder(size);
  const bySeed = new Map<number, Participant>();
  seeded.forEach((p) => bySeed.set(p.seed, p));
  const slots: Participant[] = order.map((seedNum) => bySeed.get(seedNum) ?? BYE);

  const k = Math.log2(size);
  const matches: Match[] = [];

  // ---- Cuadro de ganadores (idéntico a eliminación simple) ----
  const wbRounds: Match[][] = [];
  for (let r = 1; r <= k; r++) {
    const count = size / 2 ** r;
    const round: Match[] = [];
    for (let pos = 0; pos < count; pos++) {
      const m = makeMatch('WINNERS', r, pos, r === k ? 'Final WB' : undefined);
      if (r === 1) {
        m.participantA = slots[pos * 2];
        m.participantB = slots[pos * 2 + 1];
      }
      round.push(m);
    }
    wbRounds.push(round);
    matches.push(...round);
  }
  for (let r = 1; r < k; r++) {
    wbRounds[r - 1].forEach((m, i) => {
      const next = wbRounds[r][Math.floor(i / 2)];
      m.nextMatchId = next.id;
      m.nextMatchSlot = i % 2 === 0 ? 'A' : 'B';
    });
  }

  if (k === 1) {
    // Caso trivial: solo 2 participantes -> la única final YA es la gran final.
    const gf = wbRounds[0][0];
    gf.bracket = 'GRAND_FINAL';
    gf.label = 'Gran Final';
    matches.forEach((m) => {
      if (m.participantA && m.participantB) m.status = 'READY';
    });
    return resolveByes(matches);
  }

  // ---- Cuadro de perdedores ----
  let lbRoundIndex = 0;
  let survivors: Match[] = []; // partidos LB cuyo GANADOR alimenta la siguiente ronda LB

  const pairInternally = (feeders: Match[]): Match[] => {
    lbRoundIndex++;
    const round: Match[] = [];
    for (let i = 0; i < feeders.length; i += 2) {
      const m = makeMatch('LOSERS', lbRoundIndex, i / 2);
      feeders[i].nextMatchId = m.id;
      feeders[i].nextMatchSlot = 'A';
      feeders[i + 1].nextMatchId = m.id;
      feeders[i + 1].nextMatchSlot = 'B';
      round.push(m);
    }
    return round;
  };

  for (let wbRound = 1; wbRound <= k - 1; wbRound++) {
    const wbLoserSources = wbRounds[wbRound - 1];
    lbRoundIndex++;
    let round: Match[];
    const wasDropRound = survivors.length > 0;

    if (!wasDropRound) {
      // Primera ronda LB: se empareja a los propios perdedores de la WB-R1 entre sí.
      round = [];
      for (let i = 0; i < wbLoserSources.length; i += 2) {
        const m = makeMatch('LOSERS', lbRoundIndex, i / 2);
        wbLoserSources[i].loserNextMatchId = m.id;
        wbLoserSources[i].loserNextMatchSlot = 'A';
        wbLoserSources[i + 1].loserNextMatchId = m.id;
        wbLoserSources[i + 1].loserNextMatchSlot = 'B';
        round.push(m);
      }
    } else {
      // Ronda de "caída": los supervivientes LB se cruzan con los nuevos perdedores de la WB.
      round = survivors.map((survivorMatch, i) => {
        const m = makeMatch('LOSERS', lbRoundIndex, i);
        survivorMatch.nextMatchId = m.id;
        survivorMatch.nextMatchSlot = 'A';
        wbLoserSources[i].loserNextMatchId = m.id;
        wbLoserSources[i].loserNextMatchSlot = 'B';
        return m;
      });
    }

    matches.push(...round);
    survivors = round;

    // Tras una ronda de "caída" con más de un partido, hay una ronda interna
    // de consolidación que reduce el cuadro de perdedores a la mitad antes de
    // recibir la siguiente tanda de perdedores de la WB. La ronda inicial de
    // emparejamiento puro (arriba) YA hace esa reducción, así que no se repite.
    if (wasDropRound && round.length > 1) {
      const consolidation = pairInternally(round);
      matches.push(...consolidation);
      survivors = consolidation;
    }
  }

  // Final del cuadro de perdedores: superviviente LB vs. perdedor de la final WB.
  lbRoundIndex++;
  const wbFinal = wbRounds[k - 1][0];
  const lbFinal = makeMatch('LOSERS', lbRoundIndex, 0, 'Final LB');
  survivors[0].nextMatchId = lbFinal.id;
  survivors[0].nextMatchSlot = 'A';
  wbFinal.loserNextMatchId = lbFinal.id;
  wbFinal.loserNextMatchSlot = 'B';
  matches.push(lbFinal);

  // ---- Gran Final (+ posible partido decisivo) ----
  const grandFinal = makeMatch('GRAND_FINAL', 1, 0, 'Gran Final');
  wbFinal.nextMatchId = grandFinal.id;
  wbFinal.nextMatchSlot = 'A'; // campeón del cuadro de ganadores (invicto)
  lbFinal.nextMatchId = grandFinal.id;
  lbFinal.nextMatchSlot = 'B'; // campeón del cuadro de perdedores
  matches.push(grandFinal);

  const grandFinalReset = makeMatch('GRAND_FINAL', 2, 0, 'Gran Final (decisivo)');
  matches.push(grandFinalReset);

  matches.forEach((m) => {
    if (m.round === 1 && m.bracket === 'WINNERS' && m.participantA && m.participantB) {
      m.status = 'READY';
    }
  });

  return resolveByes(matches);
}

/**
 * Aplica un resultado tanto en eliminación simple como doble. Detecta el caso
 * especial de la primera Gran Final: si gana quien viene del cuadro de
 * perdedores, activa el partido decisivo; si gana quien venía invicto del
 * cuadro de ganadores, el torneo termina ahí.
 */
export function reportMatchResult(matches: Match[], matchId: string, scoreA: number, scoreB: number): Match[] {
  const cloned = matches.map((m) => ({ ...m }));
  const match = findMatch(cloned, matchId);
  if (!match || !match.participantA || !match.participantB) return cloned;
  if (scoreA === scoreB) return cloned; // no se permiten empates en eliminación

  const winner = scoreA > scoreB ? match.participantA : match.participantB;
  const loser = scoreA > scoreB ? match.participantB : match.participantA;

  match.scoreA = scoreA;
  match.scoreB = scoreB;
  match.winnerId = winner.id;
  match.status = 'COMPLETED';

  propagateWinner(cloned, match, winner, loser);

  if (match.bracket === 'GRAND_FINAL' && match.round === 1) {
    const reset = cloned.find((m) => m.bracket === 'GRAND_FINAL' && m.round === 2);
    if (reset) {
      // Se reinicia primero por si se está corrigiendo un resultado ya introducido.
      reset.participantA = null;
      reset.participantB = null;
      reset.scoreA = null;
      reset.scoreB = null;
      reset.winnerId = null;
      reset.status = 'PENDING';
      if (winner.id === match.participantB.id) {
        // Ganó quien venía del cuadro de perdedores: ambos quedan con 1 derrota, hace falta el decisivo.
        reset.participantA = match.participantA;
        reset.participantB = match.participantB;
        reset.status = 'READY';
      }
    }
  }

  return resolveByes(cloned);
}

export function isDoubleEliminationComplete(matches: Match[]): boolean {
  const gf1 = matches.find((m) => m.bracket === 'GRAND_FINAL' && m.round === 1);
  const gf2 = matches.find((m) => m.bracket === 'GRAND_FINAL' && m.round === 2);
  if (!gf1 || gf1.status !== 'COMPLETED') return false;
  if (gf1.winnerId === gf1.participantA?.id) return true;
  return !!gf2 && gf2.status === 'COMPLETED';
}

export function getDoubleEliminationChampionId(matches: Match[]): string | null {
  const gf1 = matches.find((m) => m.bracket === 'GRAND_FINAL' && m.round === 1);
  const gf2 = matches.find((m) => m.bracket === 'GRAND_FINAL' && m.round === 2);
  if (!gf1 || gf1.status !== 'COMPLETED') return null;
  if (gf1.winnerId === gf1.participantA?.id) return gf1.winnerId;
  if (gf2 && gf2.status === 'COMPLETED') return gf2.winnerId;
  return null;
}

/** El perdedor de la final del cuadro de perdedores queda en 3er puesto de forma natural. */
export function getDoubleEliminationThirdPlaceId(matches: Match[]): string | null {
  const lbRounds = matches.filter((m) => m.bracket === 'LOSERS').map((m) => m.round);
  if (lbRounds.length === 0) return null;
  const lbFinal = matches.find((m) => m.bracket === 'LOSERS' && m.round === Math.max(...lbRounds));
  if (!lbFinal || lbFinal.status !== 'COMPLETED' || !lbFinal.winnerId) return null;
  const loserParticipant =
    lbFinal.participantA?.id === lbFinal.winnerId ? lbFinal.participantB : lbFinal.participantA;
  return loserParticipant && !loserParticipant.isBye ? loserParticipant.id : null;
}
