import { ArrowLeft, Users2 } from 'lucide-react';
import type { Tournament } from '@/types';
import { FORMAT_LABELS } from '@/types';
import { BracketView } from '@/components/Bracket/BracketView';
import { DoubleEliminationView } from '@/components/Bracket/DoubleEliminationView';
import { GroupStageView } from './GroupStageView';
import { StandingsTable } from './StandingsTable';
import { ChampionPodium } from './ChampionPodium';
import { computeStandings } from '@/lib/roundRobin';
import { getChampionId, getThirdPlaceId, getRunnerUpId } from '@/lib/tournament';
import { Button } from '@/components/ui/Button';

interface Props {
  tournament: Tournament;
  onReportResult: (matchId: string, scoreA: number, scoreB: number) => void;
  onGeneratePlayoffs: () => void;
  onNewTournament: () => void;
  onBackToWizard: () => void;
}

export function TournamentPage({ tournament, onReportResult, onGeneratePlayoffs, onNewTournament, onBackToWizard }: Props) {
  const championId = getChampionId(tournament);
  const champion = tournament.participants.find((p) => p.id === championId);
  const runnerUpId = getRunnerUpId(tournament);
  const runnerUp = tournament.participants.find((p) => p.id === runnerUpId) ?? null;
  const thirdPlaceId = getThirdPlaceId(tournament);
  const thirdPlace = tournament.participants.find((p) => p.id === thirdPlaceId) ?? null;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <button
        onClick={onBackToWizard}
        className="mb-4 mt-6 flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-imperial-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Nuevo torneo
      </button>

      <div className="relative mb-6 overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-imperial-500 via-laurel-400 to-imperial-500" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-stone-900">{tournament.name}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-imperial-50 px-2.5 py-1 font-medium text-imperial-600">
                {FORMAT_LABELS[tournament.format]}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 font-medium text-stone-600">
                <Users2 className="h-3 w-3" />
                {tournament.participants.length} participantes
              </span>
              {tournament.format === 'LEAGUE' && (
                <span className="rounded-full bg-stone-100 px-2.5 py-1 font-medium text-stone-600">
                  {tournament.phase === 'GROUP' ? 'Fase de liga' : 'Fase eliminatoria'}
                </span>
              )}
              {champion && (
                <span className="flex items-center gap-1 rounded-full bg-laurel-400/20 px-2.5 py-1 font-semibold text-laurel-600">
                  Finalizado
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {champion && <ChampionPodium champion={champion} runnerUp={runnerUp} thirdPlace={thirdPlace} />}

      {tournament.format === 'SINGLE_ELIMINATION' && (
        <BracketView matches={tournament.matches} onSubmit={onReportResult} />
      )}

      {tournament.format === 'DOUBLE_ELIMINATION' && (
        <DoubleEliminationView matches={tournament.matches} onSubmit={onReportResult} />
      )}

      {tournament.format === 'ROUND_ROBIN' && (
        <GroupStageView participants={tournament.participants} matches={tournament.matches} onSubmit={onReportResult} />
      )}

      {tournament.format === 'LEAGUE' && tournament.phase === 'GROUP' && (
        <GroupStageView
          participants={tournament.participants}
          matches={tournament.matches}
          onSubmit={onReportResult}
          qualifiersCount={tournament.qualifiersCount}
          onGeneratePlayoffs={onGeneratePlayoffs}
        />
      )}

      {tournament.format === 'LEAGUE' && tournament.phase === 'PLAYOFFS' && (
        <div className="flex flex-col gap-8">
          <section>
            <h3 className="mb-3 font-display text-base font-semibold text-stone-900">Fase eliminatoria</h3>
            <BracketView matches={tournament.matches.filter((m) => m.bracket === 'MAIN')} onSubmit={onReportResult} />
          </section>
          <section>
            <h3 className="mb-3 font-display text-base font-semibold text-stone-900">Clasificación de la fase de liga</h3>
            <StandingsTable
              standings={computeStandings(tournament.participants, tournament.matches.filter((m) => m.bracket === 'GROUP'))}
              qualifiersCount={tournament.qualifiersCount}
            />
          </section>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Button variant="secondary" onClick={onNewTournament}>
          Crear otro torneo
        </Button>
      </div>
    </div>
  );
}
