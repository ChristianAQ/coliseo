import { User, Shield, Minus, Plus } from 'lucide-react';
import type { ParticipantType, TournamentFormat } from '@/types';
import { BRACKET_SIZES } from '@/types';
import { availableQualifierOptions } from '@/lib/roundRobin';

interface Props {
  format: TournamentFormat;
  participantType: ParticipantType;
  names: string[];
  qualifiersCount: number;
  onTypeChange: (t: ParticipantType) => void;
  onCountChange: (count: number) => void;
  onNameChange: (index: number, value: string) => void;
  onQualifiersChange: (count: number) => void;
}

const FREE_MIN = 3;
const FREE_MAX = 24;

export function Step3Participants({
  format,
  participantType,
  names,
  qualifiersCount,
  onTypeChange,
  onCountChange,
  onNameChange,
  onQualifiersChange,
}: Props) {
  const count = names.length;
  const noun = participantType === 'PLAYER' ? 'Jugador' : 'Equipo';
  const filled = names.filter((n) => n.trim().length > 0).length;
  const isBracketFormat = format === 'SINGLE_ELIMINATION' || format === 'DOUBLE_ELIMINATION';
  const qualifierOptions = availableQualifierOptions(count);

  return (
    <div className="animate-[fadeIn_0.25s_ease]">
      <div className="mb-6">
        <h2 className="font-display text-xl font-semibold text-stone-900">Participantes</h2>
        <p className="text-sm text-stone-500">¿Quién va a competir en este torneo?</p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        {(['PLAYER', 'TEAM'] as ParticipantType[]).map((t) => {
          const Icon = t === 'PLAYER' ? User : Shield;
          const selected = participantType === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => onTypeChange(t)}
              className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3.5 text-sm font-medium transition-all ${
                selected
                  ? 'border-imperial-500 bg-imperial-50/60 text-imperial-700'
                  : 'border-stone-200 bg-white text-stone-600 hover:border-imperial-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t === 'PLAYER' ? 'Personas' : 'Equipos'}
            </button>
          );
        })}
      </div>

      <div className="mb-6">
        <span className="mb-1.5 block text-sm font-medium text-stone-700">
          Número de {participantType === 'PLAYER' ? 'jugadores' : 'equipos'}
        </span>

        {isBracketFormat ? (
          <>
            <div className="grid grid-cols-5 gap-2">
              {BRACKET_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onCountChange(size)}
                  className={`rounded-xl border-2 py-2.5 text-center font-display text-sm font-semibold transition-all ${
                    count === size
                      ? 'border-imperial-500 bg-imperial-50/60 text-imperial-700'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-imperial-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-stone-500">
              Los cuadros eliminatorios necesitan un número exacto de plazas.
            </p>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Reducir"
              disabled={count <= FREE_MIN}
              onClick={() => onCountChange(Math.max(FREE_MIN, count - 1))}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-stone-300 bg-white text-stone-600 transition-colors hover:border-imperial-300 hover:text-imperial-600 disabled:opacity-40"
            >
              <Minus className="h-4 w-4" />
            </button>
            <div className="flex h-11 flex-1 items-center justify-center rounded-xl bg-stone-100 font-display text-lg font-semibold text-stone-900">
              {count}
            </div>
            <button
              type="button"
              aria-label="Aumentar"
              disabled={count >= FREE_MAX}
              onClick={() => onCountChange(Math.min(FREE_MAX, count + 1))}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-stone-300 bg-white text-stone-600 transition-colors hover:border-imperial-300 hover:text-imperial-600 disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {format === 'LEAGUE' && qualifierOptions.length > 0 && (
        <div className="mb-6">
          <span className="mb-1.5 block text-sm font-medium text-stone-700">Clasifican a la fase eliminatoria</span>
          <div className="flex flex-wrap gap-2">
            {qualifierOptions.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onQualifiersChange(n)}
                className={`rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-all ${
                  qualifiersCount === n
                    ? 'border-imperial-500 bg-imperial-50/60 text-imperial-700'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-imperial-200'
                }`}
              >
                Los {n} mejores
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-stone-500">
            Tras la fase de liga, estos jugarán una eliminatoria para decidir el campeón.
          </p>
        </div>
      )}

      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-stone-700">Nombres</span>
        <span className="text-xs text-stone-400">{filled}/{count} completados</span>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {names.map((value, i) => (
          <div key={i} className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400">
              {i + 1}
            </span>
            <input
              value={value}
              onChange={(e) => onNameChange(i, e.target.value)}
              placeholder={`${noun} ${i + 1}`}
              maxLength={40}
              className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-8 pr-3 text-[15px] text-stone-900 placeholder:text-stone-400 transition-colors focus:outline-none focus:ring-2 focus:ring-imperial-300 focus:border-imperial-400"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
