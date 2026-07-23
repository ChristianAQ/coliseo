import { Swords, Layers, Users, Table2 } from 'lucide-react';
import type { TournamentFormat } from '@/types';
import { FORMAT_LABELS, FORMAT_DESCRIPTIONS } from '@/types';

interface Props {
  format: TournamentFormat;
  thirdPlaceMatch: boolean;
  onFormatChange: (f: TournamentFormat) => void;
  onThirdPlaceChange: (v: boolean) => void;
}

const FORMAT_ICONS: Record<TournamentFormat, typeof Swords> = {
  SINGLE_ELIMINATION: Swords,
  DOUBLE_ELIMINATION: Layers,
  ROUND_ROBIN: Users,
  LEAGUE: Table2,
};

export function Step2Format({ format, thirdPlaceMatch, onFormatChange, onThirdPlaceChange }: Props) {
  const showThirdPlaceOption = format === 'SINGLE_ELIMINATION';
  const formats: TournamentFormat[] = ['SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN', 'LEAGUE'];

  return (
    <div className="animate-[fadeIn_0.25s_ease]">
      <div className="mb-6">
        <h2 className="font-display text-xl font-semibold text-stone-900">Elige el formato</h2>
        <p className="text-sm text-stone-500">Define cómo se enfrentarán los participantes.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {formats.map((f) => {
          const Icon = FORMAT_ICONS[f];
          const selected = format === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => onFormatChange(f)}
              className={`group relative flex flex-col gap-2 rounded-2xl border-2 p-4 text-left transition-all ${
                selected
                  ? 'border-imperial-500 bg-imperial-50/60 shadow-soft'
                  : 'border-stone-200 bg-white hover:border-imperial-200 hover:bg-imperial-50/30'
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  selected ? 'bg-imperial-500 text-white' : 'bg-stone-100 text-stone-500 group-hover:text-imperial-500'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-stone-900">{FORMAT_LABELS[f]}</h3>
                <p className="mt-0.5 text-xs leading-relaxed text-stone-500">{FORMAT_DESCRIPTIONS[f]}</p>
              </div>
              {selected && (
                <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-imperial-500 text-white shadow-soft">
                  <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                    <path d="M2 6.5L4.5 9L10 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {showThirdPlaceOption && (
        <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 transition-colors hover:border-imperial-200">
          <input
            type="checkbox"
            checked={thirdPlaceMatch}
            onChange={(e) => onThirdPlaceChange(e.target.checked)}
            className="h-5 w-5 shrink-0 rounded-md border-stone-300 text-imperial-500 focus:ring-2 focus:ring-imperial-300"
          />
          <div>
            <span className="block text-sm font-medium text-stone-800">
              Incluir partido por el tercer puesto
            </span>
            <span className="block text-xs text-stone-500">
              Los dos perdedores de semifinales se enfrentarán aparte.
            </span>
          </div>
        </label>
      )}

      {format === 'DOUBLE_ELIMINATION' && (
        <p className="mt-4 rounded-xl bg-stone-100 px-4 py-3 text-xs text-stone-600">
          En eliminación doble el 3er puesto sale solo: es quien pierde la final del cuadro de perdedores, sin necesidad de un partido aparte.
        </p>
      )}

      {format === 'LEAGUE' && (
        <p className="mt-4 rounded-xl bg-stone-100 px-4 py-3 text-xs text-stone-600">
          Podrás elegir cuántos participantes clasifican a la fase eliminatoria en el siguiente paso.
        </p>
      )}
    </div>
  );
}
