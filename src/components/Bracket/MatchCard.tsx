import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import type { Match } from '@/types';

interface Props {
  match: Match;
  onSubmit: (matchId: string, scoreA: number, scoreB: number) => void;
  width: number;
}

export function MatchCard({ match, onSubmit, width }: Props) {
  const [scoreA, setScoreA] = useState<string>(match.scoreA?.toString() ?? '');
  const [scoreB, setScoreB] = useState<string>(match.scoreB?.toString() ?? '');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setScoreA(match.scoreA?.toString() ?? '');
    setScoreB(match.scoreB?.toString() ?? '');
  }, [match.scoreA, match.scoreB]);

  const hasBothParticipants = !!match.participantA && !!match.participantB;
  const isBye = match.participantA?.isBye || match.participantB?.isBye;
  const isEditable = hasBothParticipants && !isBye;
  const isReady = isEditable && match.status !== 'COMPLETED';
  const numA = Number(scoreA);
  const numB = Number(scoreB);
  const canSave =
    scoreA !== '' && scoreB !== '' && !Number.isNaN(numA) && !Number.isNaN(numB) && numA !== numB && numA >= 0 && numB >= 0;

  const handleSave = () => {
    if (!canSave) return;
    onSubmit(match.id, numA, numB);
    setEditing(false);
  };

  const nameA = match.participantA?.name ?? 'Por determinar';
  const nameB = match.participantB?.name ?? 'Por determinar';
  const isWinnerA = match.winnerId != null && match.winnerId === match.participantA?.id;
  const isWinnerB = match.winnerId != null && match.winnerId === match.participantB?.id;
  const isDone = match.status === 'COMPLETED';

  const rowClasses = (isWinner: boolean, isEmpty: boolean) =>
    `relative flex items-center justify-between gap-2 px-3 py-2 transition-colors ${
      isWinner ? 'bg-gradient-to-r from-laurel-400/20 via-laurel-400/5 to-transparent' : ''
    } ${isEmpty ? 'text-stone-400' : isWinner ? 'text-stone-900' : isDone ? 'text-stone-400' : 'text-stone-800'}`;

  return (
    <div
      style={{ width }}
      className={`group overflow-hidden rounded-2xl border bg-white shadow-soft transition-all hover:shadow-soft-lg ${
        isDone && match.winnerId
          ? 'border-laurel-300'
          : isReady
            ? 'border-imperial-300'
            : hasBothParticipants
              ? 'border-imperial-200'
              : 'border-stone-200 border-dashed'
      }`}
    >
      {match.label && (
        <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50 px-3 py-1">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-stone-500">
            <span className="h-1.5 w-1.5 rounded-full bg-imperial-400" />
            {match.label}
          </span>
          {isReady && (
            <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-imperial-500">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-imperial-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-imperial-500" />
              </span>
              Listo
            </span>
          )}
        </div>
      )}
      <div className="divide-y divide-stone-100">
        <div className={rowClasses(isWinnerA, !match.participantA)}>
          {isWinnerA && <span className="absolute inset-y-0 left-0 w-1 bg-laurel-400" />}
          <div className="flex min-w-0 items-center gap-2">
            {match.participantA && (
              <span className="shrink-0 text-[10px] font-semibold text-stone-400">#{match.participantA.seed > 0 ? match.participantA.seed : '-'}</span>
            )}
            <span className={`truncate text-sm ${isWinnerA ? 'font-bold' : ''}`}>
              {match.participantA?.isBye ? 'BYE' : nameA}
            </span>
            {isWinnerA && <Trophy className="h-3 w-3 shrink-0 text-laurel-500" strokeWidth={2.2} />}
          </div>
          {isEditable && editing ? (
            <input
              type="number"
              min={0}
              value={scoreA}
              onChange={(e) => setScoreA(e.target.value)}
              className="h-7 w-11 shrink-0 rounded-lg border border-stone-300 text-center text-sm font-mono focus:outline-none focus:ring-2 focus:ring-imperial-300"
            />
          ) : (
            match.scoreA !== null && (
              <span className={`font-mono text-sm shrink-0 ${isWinnerA ? 'font-bold text-laurel-600' : ''}`}>{match.scoreA}</span>
            )
          )}
        </div>
        <div className={rowClasses(isWinnerB, !match.participantB)}>
          {isWinnerB && <span className="absolute inset-y-0 left-0 w-1 bg-laurel-400" />}
          <div className="flex min-w-0 items-center gap-2">
            {match.participantB && (
              <span className="shrink-0 text-[10px] font-semibold text-stone-400">#{match.participantB.seed > 0 ? match.participantB.seed : '-'}</span>
            )}
            <span className={`truncate text-sm ${isWinnerB ? 'font-bold' : ''}`}>
              {match.participantB?.isBye ? 'BYE' : nameB}
            </span>
            {isWinnerB && <Trophy className="h-3 w-3 shrink-0 text-laurel-500" strokeWidth={2.2} />}
          </div>
          {isEditable && editing ? (
            <input
              type="number"
              min={0}
              value={scoreB}
              onChange={(e) => setScoreB(e.target.value)}
              className="h-7 w-11 shrink-0 rounded-lg border border-stone-300 text-center text-sm font-mono focus:outline-none focus:ring-2 focus:ring-imperial-300"
            />
          ) : (
            match.scoreB !== null && (
              <span className={`font-mono text-sm shrink-0 ${isWinnerB ? 'font-bold text-laurel-600' : ''}`}>{match.scoreB}</span>
            )
          )}
        </div>
      </div>
      {isEditable && (
        <div className="border-t border-stone-100 bg-stone-50/60 px-3 py-1.5">
          {editing ? (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!canSave}
                className="flex-1 rounded-lg bg-imperial-500 py-1 text-xs font-semibold text-white transition-colors hover:bg-imperial-600 disabled:bg-stone-300"
              >
                Guardar
              </button>
              <button
                onClick={() => setEditing(false)}
                className="rounded-lg px-2 py-1 text-xs font-medium text-stone-500 hover:text-stone-700"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="w-full rounded-lg py-1 text-xs font-semibold text-imperial-600 hover:bg-imperial-50"
            >
              {match.status === 'COMPLETED' ? 'Editar resultado' : 'Introducir resultado'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
