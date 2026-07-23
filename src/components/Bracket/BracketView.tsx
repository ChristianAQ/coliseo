import { useMemo } from 'react';
import type { Match } from '@/types';
import { getRoundLabel } from '@/lib/bracket';
import { MatchCard } from './MatchCard';

interface Props {
  matches: Match[];
  onSubmit: (matchId: string, scoreA: number, scoreB: number) => void;
}

const CARD_WIDTH = 232;
const CARD_HEIGHT = 92;
const BASE_GAP = 28;
const ROUND_GAP = 56;
const PADDING = 24;

export function BracketView({ matches, onSubmit }: Props) {
  const mainMatches = matches.filter((m) => m.label !== '3er puesto');
  const thirdPlace = matches.find((m) => m.label === '3er puesto') ?? null;
  const totalRounds = Math.max(...mainMatches.map((m) => m.round));
  const round1Count = mainMatches.filter((m) => m.round === 1).length;

  const layout = useMemo(() => {
    const unit = CARD_HEIGHT + BASE_GAP;
    const containerHeight = unit * round1Count;
    const positions = new Map<string, { x: number; y: number }>();
    const byRound: Match[][] = [];

    for (let r = 1; r <= totalRounds; r++) {
      const roundMatches = mainMatches.filter((m) => m.round === r).sort((a, b) => a.position - b.position);
      byRound.push(roundMatches);
      const slotHeight = unit * 2 ** (r - 1);
      const x = PADDING + (r - 1) * (CARD_WIDTH + ROUND_GAP);
      roundMatches.forEach((m, i) => {
        const centerY = slotHeight * i + slotHeight / 2;
        positions.set(m.id, { x, y: PADDING + centerY - CARD_HEIGHT / 2 });
      });
    }

    const connectors: { path: string }[] = [];
    for (let r = 2; r <= totalRounds; r++) {
      const roundMatches = byRound[r - 1];
      const prevRound = byRound[r - 2];
      roundMatches.forEach((m, i) => {
        const feeder1 = prevRound[i * 2];
        const feeder2 = prevRound[i * 2 + 1];
        const pos = positions.get(m.id)!;
        const pos1 = feeder1 && positions.get(feeder1.id);
        const pos2 = feeder2 && positions.get(feeder2.id);
        if (!pos1 || !pos2) return;
        const midX = pos1.x + CARD_WIDTH + ROUND_GAP / 2;
        const y1 = pos1.y + CARD_HEIGHT / 2;
        const y2 = pos2.y + CARD_HEIGHT / 2;
        const yMatch = pos.y + CARD_HEIGHT / 2;
        connectors.push({
          path: `M ${pos1.x + CARD_WIDTH} ${y1} H ${midX} M ${pos2.x + CARD_WIDTH} ${y2} H ${midX} M ${midX} ${y1} V ${y2} M ${midX} ${yMatch} H ${pos.x}`,
        });
      });
    }

    return {
      positions,
      connectors,
      width: PADDING * 2 + totalRounds * CARD_WIDTH + (totalRounds - 1) * ROUND_GAP,
      height: PADDING * 2 + containerHeight + (thirdPlace ? CARD_HEIGHT + 48 : 0),
      mainHeight: PADDING * 2 + containerHeight,
      byRound,
    };
  }, [mainMatches, round1Count, totalRounds, thirdPlace]);

  return (
    <div className="bracket-scroll overflow-x-auto pb-4">
      <div className="relative" style={{ width: layout.width, height: layout.height, minWidth: '100%' }}>
        <svg
          className="pointer-events-none absolute inset-0"
          width={layout.width}
          height={layout.height}
        >
          {layout.connectors.map((c, i) => (
            <path key={i} d={c.path} fill="none" stroke="#DAD7E3" strokeWidth={2} strokeLinecap="round" />
          ))}
        </svg>

        {/* Etiquetas de ronda */}
        {layout.byRound.map((roundMatches, i) => {
          const pos = positions_first(roundMatches, layout.positions);
          if (!pos) return null;
          return (
            <div
              key={i}
              className="absolute font-display text-xs font-semibold uppercase tracking-wide text-stone-500"
              style={{ left: pos.x, top: PADDING / 2, width: CARD_WIDTH }}
            >
              {getRoundLabel(i + 1, totalRounds)}
            </div>
          );
        })}

        {mainMatches.map((m) => {
          const pos = layout.positions.get(m.id);
          if (!pos) return null;
          return (
            <div key={m.id} className="absolute" style={{ left: pos.x, top: pos.y }}>
              <MatchCard match={m} onSubmit={onSubmit} width={CARD_WIDTH} />
            </div>
          );
        })}

        {thirdPlace && (
          <div
            className="absolute"
            style={{
              left: PADDING + (totalRounds - 1) * (CARD_WIDTH + ROUND_GAP),
              top: layout.mainHeight + 16,
            }}
          >
            <MatchCard match={thirdPlace} onSubmit={onSubmit} width={CARD_WIDTH} />
          </div>
        )}
      </div>
    </div>
  );
}

function positions_first(roundMatches: Match[], positions: Map<string, { x: number; y: number }>) {
  const first = roundMatches[0];
  if (!first) return null;
  return positions.get(first.id) ?? null;
}
