import { ListOrdered, Shuffle, Info } from 'lucide-react';
import type { PairingMode } from '@/types';
import { nextPowerOfTwo } from '@/lib/bracket';

interface Props {
  pairingMode: PairingMode;
  onChange: (m: PairingMode) => void;
  participantCount: number;
  format: string;
}

export function Step4Pairings({ pairingMode, onChange, participantCount, format }: Props) {
  const bracketSize = nextPowerOfTwo(participantCount);
  const byes = bracketSize - participantCount;
  const showByeNotice = byes > 0 && (format === 'SINGLE_ELIMINATION' || format === 'DOUBLE_ELIMINATION');

  return (
    <div className="animate-[fadeIn_0.25s_ease]">
      <div className="mb-6">
        <h2 className="font-display text-xl font-semibold text-stone-900">Emparejamientos</h2>
        <p className="text-sm text-stone-500">¿Cómo quieres generar los enfrentamientos iniciales?</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onChange('ORDER')}
          className={`flex flex-col items-start gap-2.5 rounded-2xl border-2 p-4 text-left transition-all ${
            pairingMode === 'ORDER'
              ? 'border-imperial-500 bg-imperial-50/60 shadow-soft'
              : 'border-stone-200 bg-white hover:border-imperial-200'
          }`}
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${pairingMode === 'ORDER' ? 'bg-imperial-500 text-white' : 'bg-stone-100 text-stone-500'}`}>
            <ListOrdered className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-stone-900">Según el orden introducido</h3>
            <p className="mt-0.5 text-xs text-stone-500">Se respeta el orden en el que añadiste a los participantes.</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChange('RANDOM')}
          className={`flex flex-col items-start gap-2.5 rounded-2xl border-2 p-4 text-left transition-all ${
            pairingMode === 'RANDOM'
              ? 'border-imperial-500 bg-imperial-50/60 shadow-soft'
              : 'border-stone-200 bg-white hover:border-imperial-200'
          }`}
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${pairingMode === 'RANDOM' ? 'bg-imperial-500 text-white' : 'bg-stone-100 text-stone-500'}`}>
            <Shuffle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-stone-900">Aleatoriamente</h3>
            <p className="mt-0.5 text-xs text-stone-500">Se sortean todos los enfrentamientos al azar.</p>
          </div>
        </button>
      </div>

      {showByeNotice && (
        <div className="mt-5 flex gap-3 rounded-xl border border-laurel-400/40 bg-laurel-400/10 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-laurel-600" />
          <p className="text-sm text-stone-700">
            Tienes <strong>{participantCount}</strong> participantes, así que el cuadro se completará a{' '}
            <strong>{bracketSize}</strong> con <strong>{byes}</strong> BYE{byes !== 1 ? 's' : ''} generado
            {byes !== 1 ? 's' : ''} automáticamente. Los participantes con BYE pasarán directos a la siguiente ronda.
          </p>
        </div>
      )}
    </div>
  );
}
