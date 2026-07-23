import { Trophy } from 'lucide-react';
import { Field } from '@/components/ui/Field';

interface Props {
  name: string;
  onChange: (name: string) => void;
}

export function Step1Name({ name, onChange }: Props) {
  return (
    <div className="animate-[fadeIn_0.25s_ease]">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-imperial-50 text-imperial-500">
          <Trophy className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-stone-900">
            Ponle nombre a tu torneo
          </h2>
          <p className="text-sm text-stone-500">Podrás cambiarlo más adelante si lo necesitas.</p>
        </div>
      </div>

      <Field
        label="Nombre del torneo"
        placeholder="Ej. Liga de Verano 2026"
        value={name}
        maxLength={60}
        autoFocus
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="mt-2 text-right text-xs text-stone-400">{name.length}/60</p>
    </div>
  );
}
