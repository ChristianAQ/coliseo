import { useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Users2 } from 'lucide-react';
import type { Tournament } from '@/types';
import { FORMAT_LABELS } from '@/types';
import { listTournaments } from '@/lib/tournamentsRepo';
import { isTournamentComplete } from '@/lib/tournament';
import { Button } from '@/components/ui/Button';

interface Props {
  onSelect: (tournament: Tournament) => void;
  onBack: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function TournamentListPage({ onSelect, onBack }: Props) {
  const [tournaments, setTournaments] = useState<Tournament[] | null>(null);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setTournaments(null);
    setError(false);
    listTournaments()
      .then((list) => {
        if (!cancelled) setTournaments(list);
      })
      .catch((err) => {
        console.error('No se pudo cargar la lista de torneos desde Firestore', err);
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 sm:px-6">
      <button
        onClick={onBack}
        className="mb-4 mt-6 flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-imperial-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-stone-900">Tus torneos</h1>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-200/70 hover:text-stone-900"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Actualizar
        </button>
      </div>

      {tournaments === null && !error && (
        <p className="py-10 text-center text-sm text-stone-500">Cargando torneos…</p>
      )}

      {error && (
        <div className="rounded-2xl border border-defeat-400/40 bg-defeat-400/10 p-5 text-center">
          <p className="text-sm font-medium text-defeat-600">No se pudo cargar la lista de torneos.</p>
          <p className="mt-1 text-xs text-stone-500">Comprueba tu conexión e inténtalo de nuevo.</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={() => setReloadKey((k) => k + 1)}>
            Reintentar
          </Button>
        </div>
      )}

      {tournaments && tournaments.length === 0 && (
        <p className="py-10 text-center text-sm text-stone-500">Aún no has creado ningún torneo.</p>
      )}

      {tournaments && tournaments.length > 0 && (
        <div className="flex flex-col gap-3">
          {tournaments.map((t) => {
            const complete = isTournamentComplete(t);
            return (
              <button
                key={t.id}
                onClick={() => onSelect(t)}
                className="flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-4 text-left shadow-soft transition-colors hover:border-imperial-300 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-semibold text-stone-900">{t.name}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-imperial-50 px-2.5 py-1 font-medium text-imperial-600">
                      {FORMAT_LABELS[t.format]}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 font-medium text-stone-600">
                      <Users2 className="h-3 w-3" />
                      {t.participants.length}
                    </span>
                    <span className="text-stone-400">{formatDate(t.createdAt)}</span>
                  </div>
                </div>
                <span
                  className={`flex shrink-0 items-center gap-1 self-start rounded-full px-2.5 py-1 text-xs font-semibold sm:self-auto ${
                    complete ? 'bg-laurel-400/20 text-laurel-600' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {complete && <Trophy className="h-3 w-3" />}
                  {complete ? 'Finalizado' : 'En curso'}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
