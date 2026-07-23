import { Trophy, Skull } from 'lucide-react';
import type { Match } from '@/types';
import { GenericBracketRow } from './GenericBracketRow';
import { MatchCard } from './MatchCard';

interface Props {
  matches: Match[];
  onSubmit: (matchId: string, scoreA: number, scoreB: number) => void;
}

export function DoubleEliminationView({ matches, onSubmit }: Props) {
  const winners = matches.filter((m) => m.bracket === 'WINNERS');
  const losers = matches.filter((m) => m.bracket === 'LOSERS');
  const gf1 = matches.find((m) => m.bracket === 'GRAND_FINAL' && m.round === 1);
  const gf2 = matches.find((m) => m.bracket === 'GRAND_FINAL' && m.round === 2);
  const gf2Active = !!gf2 && gf2.participantA && gf2.participantB;

  const wbTotalRounds = winners.length ? Math.max(...winners.map((m) => m.round)) : 0;

  return (
    <div className="flex flex-col gap-8">
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-imperial-500" />
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-stone-700">
            Cuadro de ganadores
          </h3>
        </div>
        <GenericBracketRow
          matches={winners}
          onSubmit={onSubmit}
          roundLabel={(r) => (r === wbTotalRounds ? 'Final WB' : r === wbTotalRounds - 1 ? 'Semifinales WB' : `Ronda ${r}`)}
        />
      </section>

      {losers.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Skull className="h-4 w-4 text-stone-500" />
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-stone-700">
              Cuadro de perdedores
            </h3>
          </div>
          <GenericBracketRow matches={losers} onSubmit={onSubmit} roundLabel={(_r, i) => `Ronda LB ${i + 1}`} />
        </section>
      )}

      {gf1 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-laurel-500" />
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-stone-700">Gran Final</h3>
          </div>
          <div className="flex flex-wrap gap-6">
            <MatchCard match={gf1} onSubmit={onSubmit} width={240} />
            {gf2Active && gf2 && (
              <div>
                <p className="mb-2 text-xs text-stone-500">
                  El campeón del cuadro de perdedores ganó el primer partido: hace falta un decisivo.
                </p>
                <MatchCard match={gf2} onSubmit={onSubmit} width={240} />
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
