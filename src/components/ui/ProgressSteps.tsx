import { Check } from 'lucide-react';

interface ProgressStepsProps {
  steps: string[];
  currentIndex: number;
}

export function ProgressSteps({ steps, currentIndex }: ProgressStepsProps) {
  return (
    <div className="w-full">
      {/* Móvil: barra compacta */}
      <div className="sm:hidden">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-display text-sm font-semibold text-stone-800">
            {steps[currentIndex]}
          </span>
          <span className="text-xs font-medium text-stone-500">
            {currentIndex + 1} / {steps.length}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
          <div
            className="h-full rounded-full bg-imperial-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: stepper completo */}
      <ol className="hidden items-center sm:flex">
        {steps.map((label, i) => {
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <li key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                    isDone
                      ? 'border-imperial-500 bg-imperial-500 text-white'
                      : isCurrent
                        ? 'border-imperial-500 bg-white text-imperial-600'
                        : 'border-stone-300 bg-white text-stone-400'
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4" strokeWidth={2.5} /> : i + 1}
                </div>
                <span
                  className={`whitespace-nowrap text-sm font-medium ${
                    isCurrent ? 'text-stone-900' : isDone ? 'text-stone-600' : 'text-stone-400'
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`mx-3 h-0.5 flex-1 rounded-full transition-colors ${
                    isDone ? 'bg-imperial-500' : 'bg-stone-200'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
