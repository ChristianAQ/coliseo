import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import type { Match } from '@/types';

interface RowProps {
  match: Match;
  onSubmit: (matchId: string, scoreA: number, scoreB: number) => void;
}

function FixtureRow({ match, onSubmit }: RowProps) {
  const [scoreA, setScoreA] = useState(match.scoreA?.toString() ?? '');
  const [scoreB, setScoreB] = useState(match.scoreB?.toString() ?? '');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setScoreA(match.scoreA?.toString() ?? '');
    setScoreB(match.scoreB?.toString() ?? '');
  }, [match.scoreA, match.scoreB]);

  const numA = Number(scoreA);
  const numB = Number(scoreB);
  const canSave = scoreA !== '' && scoreB !== '' && !Number.isNaN(numA) && !Number.isNaN(numB) && numA >= 0 && numB >= 0;
  const isDraw = match.status === 'COMPLETED' && match.winnerId === null;

  const handleSave = () => {
    if (!canSave) return;
    onSubmit(match.id, numA, numB);
    setEditing(false);
  };

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 min-w-0 items-center justify-end gap-2 text-right">
          <span
            className={`truncate text-sm ${match.winnerId === match.participantA?.id ? 'font-semibold text-stone-900' : isDraw ? 'text-stone-700' : 'text-stone-600'}`}
          >
            {match.participantA?.name}
          </span>
          {match.winnerId === match.participantA?.id && <Check className="h-3.5 w-3.5 shrink-0 text-victory-600" />}
        </div>

        {!editing && (
          <div className="shrink-0">
            {match.status === 'COMPLETED' ? (
              <span className="font-mono text-sm font-bold text-stone-900">
                {match.scoreA} - {match.scoreB}
              </span>
            ) : (
              <span className="text-xs text-stone-400">vs</span>
            )}
          </div>
        )}

        <div className="flex flex-1 min-w-0 items-center gap-2">
          {match.winnerId === match.participantB?.id && <Check className="h-3.5 w-3.5 shrink-0 text-victory-600" />}
          <span
            className={`truncate text-sm ${match.winnerId === match.participantB?.id ? 'font-semibold text-stone-900' : isDraw ? 'text-stone-700' : 'text-stone-600'}`}
          >
            {match.participantB?.name}
          </span>
        </div>

        {!editing && (
          <div className="shrink-0">
            <button onClick={() => setEditing(true)} className="rounded-lg px-2.5 py-1 text-xs font-semibold text-imperial-600 hover:bg-imperial-50">
              {match.status === 'COMPLETED' ? 'Editar' : 'Resultado'}
            </button>
          </div>
        )}
      </div>

      {editing && (
        <div className="flex items-center justify-center gap-2 border-t border-stone-100 pt-2.5">
          {/* text-[16px]: por debajo de 16px, Safari en iOS hace zoom automático al enfocar el input. */}
          <input
            type="number"
            min={0}
            value={scoreA}
            onChange={(e) => setScoreA(e.target.value)}
            className="h-8 w-12 rounded-lg border border-stone-300 text-center text-[16px] font-mono focus:outline-none focus:ring-2 focus:ring-imperial-300"
          />
          <span className="text-stone-400">-</span>
          <input
            type="number"
            min={0}
            value={scoreB}
            onChange={(e) => setScoreB(e.target.value)}
            className="h-8 w-12 rounded-lg border border-stone-300 text-center text-[16px] font-mono focus:outline-none focus:ring-2 focus:ring-imperial-300"
          />
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="ml-1 rounded-lg bg-imperial-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-imperial-600 disabled:bg-stone-300"
          >
            Guardar
          </button>
          <button onClick={() => setEditing(false)} className="rounded-lg px-2 py-1.5 text-xs text-stone-500 hover:text-stone-700">
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

interface Props {
  matches: Match[];
  onSubmit: (matchId: string, scoreA: number, scoreB: number) => void;
}

export function GroupFixtures({ matches, onSubmit }: Props) {
  const rounds = Array.from(new Set(matches.map((m) => m.round))).sort((a, b) => a - b);

  return (
    <div className="flex flex-col gap-6">
      {rounds.map((r) => (
        <div key={r}>
          <h4 className="mb-2.5 font-display text-sm font-semibold text-stone-700">Jornada {r}</h4>
          <div className="flex flex-col gap-2">
            {matches
              .filter((m) => m.round === r)
              .map((m) => (
                <FixtureRow key={m.id} match={m} onSubmit={onSubmit} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
