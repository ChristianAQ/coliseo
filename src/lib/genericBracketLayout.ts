import type { Match } from '@/types';

export const GB_CARD_WIDTH = 216;
export const GB_CARD_HEIGHT = 88;
const ROW_GAP = 20;
const ROUND_GAP = 48;
const PADDING = 20;

export interface GenericLayout {
  positions: Map<string, { x: number; y: number }>;
  connectors: { path: string }[];
  width: number;
  height: number;
  roundsOrder: number[];
}

/**
 * Distribuye los partidos de un conjunto de rondas (no necesariamente con
 * potencias de dos, como el cuadro de perdedores) en columnas, centrando
 * verticalmente cada ronda respecto a la más alta. Dibuja los conectores
 * buscando, para cada partido, a qué partido avanza su ganador/perdedor.
 */
export function computeGenericLayout(matches: Match[]): GenericLayout {
  if (matches.length === 0) {
    return { positions: new Map(), connectors: [], width: 0, height: 0, roundsOrder: [] };
  }
  const roundsOrder = Array.from(new Set(matches.map((m) => m.round))).sort((a, b) => a - b);
  const byRound = new Map<number, Match[]>();
  roundsOrder.forEach((r) =>
    byRound.set(
      r,
      matches.filter((m) => m.round === r).sort((a, b) => a.position - b.position),
    ),
  );

  const maxCount = Math.max(...roundsOrder.map((r) => byRound.get(r)!.length));
  const maxHeight = maxCount * GB_CARD_HEIGHT + (maxCount - 1) * ROW_GAP;

  const positions = new Map<string, { x: number; y: number }>();
  roundsOrder.forEach((r, ri) => {
    const list = byRound.get(r)!;
    const blockHeight = list.length * GB_CARD_HEIGHT + (list.length - 1) * ROW_GAP;
    const offsetY = (maxHeight - blockHeight) / 2;
    const x = PADDING + ri * (GB_CARD_WIDTH + ROUND_GAP);
    list.forEach((m, i) => {
      const y = PADDING + offsetY + i * (GB_CARD_HEIGHT + ROW_GAP);
      positions.set(m.id, { x, y });
    });
  });

  const connectors: { path: string }[] = [];
  const matchById = new Map(matches.map((m) => [m.id, m]));
  matches.forEach((feeder) => {
    const targets: (string | null | undefined)[] = [feeder.nextMatchId, feeder.loserNextMatchId];
    targets.forEach((targetId) => {
      if (!targetId || !matchById.has(targetId)) return;
      const from = positions.get(feeder.id);
      const to = positions.get(targetId);
      if (!from || !to) return;
      const fromY = from.y + GB_CARD_HEIGHT / 2;
      const toY = to.y + GB_CARD_HEIGHT / 2;
      const midX = from.x + GB_CARD_WIDTH + ROUND_GAP / 2;
      connectors.push({
        path: `M ${from.x + GB_CARD_WIDTH} ${fromY} H ${midX} V ${toY} H ${to.x}`,
      });
    });
  });

  return {
    positions,
    connectors,
    width: PADDING * 2 + roundsOrder.length * GB_CARD_WIDTH + (roundsOrder.length - 1) * ROUND_GAP,
    height: PADDING * 2 + maxHeight,
    roundsOrder,
  };
}
