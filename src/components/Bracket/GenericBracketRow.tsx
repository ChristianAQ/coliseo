import { useMemo } from 'react';
import type { Match } from '@/types';
import { computeGenericLayout, GB_CARD_WIDTH } from '@/lib/genericBracketLayout';
import { MatchCard } from './MatchCard';

interface Props {
  matches: Match[];
  onSubmit: (matchId: string, scoreA: number, scoreB: number) => void;
  roundLabel: (round: number, index: number, total: number) => string;
}

export function GenericBracketRow({ matches, onSubmit, roundLabel }: Props) {
  const layout = useMemo(() => computeGenericLayout(matches), [matches]);

  if (matches.length === 0) return null;

  return (
    <div className="bracket-scroll overflow-x-auto pb-3">
      <div className="relative" style={{ width: layout.width, height: layout.height + 28, minWidth: '100%' }}>
        <svg className="pointer-events-none absolute inset-0" width={layout.width} height={layout.height + 28} style={{ top: 28 }}>
          {layout.connectors.map((c, i) => (
            <path key={i} d={c.path} fill="none" stroke="#DAD7E3" strokeWidth={2} strokeLinecap="round" />
          ))}
        </svg>

        {layout.roundsOrder.map((r, ri) => {
          const first = matches.find((m) => m.round === r);
          const pos = first ? layout.positions.get(first.id) : null;
          if (!pos) return null;
          return (
            <div
              key={r}
              className="absolute font-display text-xs font-semibold uppercase tracking-wide text-stone-500"
              style={{ left: pos.x, top: 0, width: GB_CARD_WIDTH }}
            >
              {roundLabel(r, ri, layout.roundsOrder.length)}
            </div>
          );
        })}

        {matches.map((m) => {
          const pos = layout.positions.get(m.id);
          if (!pos) return null;
          return (
            <div key={m.id} className="absolute" style={{ left: pos.x, top: pos.y + 28 }}>
              <MatchCard match={m} onSubmit={onSubmit} width={GB_CARD_WIDTH} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
