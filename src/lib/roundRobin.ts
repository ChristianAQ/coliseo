import type { Match, Participant, PairingMode, StandingRow } from '@/types';
import { assignSeeds, BYE } from './bracket';

let uid = 0;
const genId = (prefix: string) => `rr_${prefix}_${Date.now().toString(36)}_${uid++}`;

/**
 * Genera el calendario de una liga (todos contra todos, una vuelta) usando el
 * método del círculo: se fija un participante y se rota el resto ronda a
 * ronda, garantizando que cada par se enfrenta exactamente una vez y que en
 * cada ronda se juegan el máximo de partidos simultáneos posible.
 * Si el número de participantes es impar, se añade un BYE de relleno: quien
 * le "toque" ese BYE en una ronda simplemente descansa esa ronda.
 */
export function generateRoundRobinMatches(participants: Participant[], pairingMode: PairingMode): Match[] {
  const seeded = assignSeeds(participants, pairingMode);
  const list: Participant[] = [...seeded];
  if (list.length % 2 !== 0) list.push(BYE);

  const total = list.length;
  const rounds = total - 1;
  const half = total / 2;
  const arr = [...list];
  const matches: Match[] = [];

  for (let r = 0; r < rounds; r++) {
    let position = 0;
    for (let i = 0; i < half; i++) {
      const home = arr[i];
      const away = arr[total - 1 - i];
      if (!home.isBye && !away.isBye) {
        matches.push({
          id: genId('m'),
          bracket: 'GROUP',
          round: r + 1,
          position: position++,
          participantA: home,
          participantB: away,
          scoreA: null,
          scoreB: null,
          winnerId: null,
          status: 'READY',
        });
      }
    }
    // Rotación: el primer participante queda fijo, el resto rota una posición.
    const fixed = arr[0];
    const rest = arr.slice(1);
    rest.unshift(rest.pop()!);
    arr.splice(0, arr.length, fixed, ...rest);
  }

  return matches;
}

/** Aplica un resultado de liga. A diferencia de la eliminación, se admiten empates. */
export function reportGroupMatchResult(
  matches: Match[],
  matchId: string,
  scoreA: number,
  scoreB: number,
): Match[] {
  return matches.map((m) => {
    if (m.id !== matchId || !m.participantA || !m.participantB) return m;
    const winnerId = scoreA === scoreB ? null : scoreA > scoreB ? m.participantA.id : m.participantB.id;
    return { ...m, scoreA, scoreB, winnerId, status: 'COMPLETED' };
  });
}

/** Clasificación: 3 puntos por victoria, 1 por empate, 0 por derrota. */
export function computeStandings(participants: Participant[], matches: Match[]): StandingRow[] {
  const rows = new Map<string, StandingRow>();
  participants.forEach((p) => {
    rows.set(p.id, { participant: p, played: 0, wins: 0, draws: 0, losses: 0, points: 0, scoreFor: 0, scoreAgainst: 0 });
  });

  for (const m of matches) {
    if (m.status !== 'COMPLETED' || !m.participantA || !m.participantB) continue;
    const a = rows.get(m.participantA.id);
    const b = rows.get(m.participantB.id);
    if (!a || !b) continue;
    const sa = m.scoreA ?? 0;
    const sb = m.scoreB ?? 0;
    a.played++;
    b.played++;
    a.scoreFor += sa;
    a.scoreAgainst += sb;
    b.scoreFor += sb;
    b.scoreAgainst += sa;
    if (sa === sb) {
      a.draws++;
      b.draws++;
      a.points += 1;
      b.points += 1;
    } else if (sa > sb) {
      a.wins++;
      b.losses++;
      a.points += 3;
    } else {
      b.wins++;
      a.losses++;
      b.points += 3;
    }
  }

  return Array.from(rows.values()).sort((x, y) => {
    if (y.points !== x.points) return y.points - x.points;
    const diffX = x.scoreFor - x.scoreAgainst;
    const diffY = y.scoreFor - y.scoreAgainst;
    if (diffY !== diffX) return diffY - diffX;
    if (y.scoreFor !== x.scoreFor) return y.scoreFor - x.scoreFor;
    return x.participant.name.localeCompare(y.participant.name);
  });
}

export function isGroupStageComplete(matches: Match[]): boolean {
  const group = matches.filter((m) => m.bracket === 'GROUP');
  return group.length > 0 && group.every((m) => m.status === 'COMPLETED');
}

export function groupRoundsCount(matches: Match[]): number {
  const group = matches.filter((m) => m.bracket === 'GROUP');
  if (group.length === 0) return 0;
  return Math.max(...group.map((m) => m.round));
}

/** Devuelve, para el nº de participantes dado, la opción de clasificados por defecto. */
export function defaultQualifiers(participantCount: number): number {
  if (participantCount >= 4) return 4;
  return 2;
}

/** Opciones válidas de clasificados (potencias de 2, sin superar el nº de participantes). */
export function availableQualifierOptions(participantCount: number): number[] {
  return [2, 4, 8, 16].filter((n) => n <= participantCount);
}
