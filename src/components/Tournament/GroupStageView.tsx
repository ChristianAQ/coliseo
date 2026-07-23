import { Sparkles } from 'lucide-react';
import type { Match, Participant } from '@/types';
import { computeStandings, isGroupStageComplete } from '@/lib/roundRobin';
import { StandingsTable } from './StandingsTable';
import { GroupFixtures } from './GroupFixtures';
import { Button } from '@/components/ui/Button';

interface Props {
  participants: Participant[];
  matches: Match[];
  onSubmit: (matchId: string, scoreA: number, scoreB: number) => void;
  qualifiersCount?: number;
  onGeneratePlayoffs?: () => void;
}

export function GroupStageView({ participants, matches, onSubmit, qualifiersCount, onGeneratePlayoffs }: Props) {
  const standings = computeStandings(participants, matches);
  const allDone = isGroupStageComplete(matches);

  return (
    <div className="flex flex-col gap-6">
      {qualifiersCount != null && onGeneratePlayoffs && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-imperial-200 bg-imperial-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-stone-700">
            {allDone
              ? 'La fase de liga ha terminado. Genera la fase eliminatoria con los clasificados.'
              : `Faltan partidos por jugar. Los ${qualifiersCount} primeros de la tabla clasificarán a la fase eliminatoria.`}
          </p>
          <Button variant="gold" size="sm" disabled={!allDone} onClick={onGeneratePlayoffs} icon={<Sparkles className="h-4 w-4" />}>
            Generar playoffs
          </Button>
        </div>
      )}

      <StandingsTable standings={standings} qualifiersCount={qualifiersCount} />

      <div>
        <h3 className="mb-3 font-display text-base font-semibold text-stone-900">Calendario</h3>
        <GroupFixtures matches={matches} onSubmit={onSubmit} />
      </div>
    </div>
  );
}
