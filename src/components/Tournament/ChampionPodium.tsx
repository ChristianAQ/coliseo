import { useMemo } from 'react';
import { Crown, Medal } from 'lucide-react';
import type { Participant } from '@/types';
import { ColosseumArches } from '@/components/Decor/ColosseumArches';
import { LaurelWreath } from '@/components/Decor/LaurelWreath';

interface Props {
  champion: Participant;
  runnerUp: Participant | null;
  thirdPlace: Participant | null;
}

const CONFETTI_COLORS = ['#EFC75E', '#F3DE9C', '#A876D9', '#FFFFFF', '#34B37B'];

export function ChampionPodium({ champion, runnerUp, thirdPlace }: Props) {
  const confetti = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => ({
        left: `${(i * 37) % 100}%`,
        delay: `${(i % 8) * 0.35}s`,
        duration: `${2.6 + (i % 5) * 0.4}s`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 5 + (i % 3) * 2,
      })),
    [],
  );

  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-b from-imperial-600 via-imperial-700 to-imperial-900 px-5 py-8 shadow-soft-lg sm:px-10 sm:py-12">
      {/* Fachada de arcos del Coliseo, de fondo */}
      <ColosseumArches archCount={18} className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full text-white/10" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-laurel-400/70 to-transparent" />

      {/* Confeti cayendo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {confetti.map((c, i) => (
          <span
            key={i}
            className="animate-confetti absolute top-0 rounded-sm"
            style={{
              left: c.left,
              width: c.size,
              height: c.size * 2,
              backgroundColor: c.color,
              animationDelay: c.delay,
              animationDuration: c.duration,
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-laurel-300">
          Torneo finalizado
        </p>
        <h2 className="mb-9 text-center font-display text-xl font-bold text-white sm:text-2xl">
          ¡Tenemos campeón!
        </h2>

        <div className="flex w-full max-w-lg items-end justify-center gap-3 sm:gap-5">
          {/* 2º puesto */}
          {runnerUp ? (
            <PodiumBlock
              place={2}
              name={runnerUp.name}
              heightClass="h-24 sm:h-28"
              blockClass="from-stone-300 to-stone-400"
              delay="0.1s"
              icon={<Medal className="h-5 w-5 text-stone-100" strokeWidth={2.2} />}
              iconWrapClass="bg-stone-400"
            />
          ) : (
            <div className="w-20 sm:w-28" />
          )}

          {/* 1º puesto */}
          <div className="animate-podium-rise flex flex-col items-center" style={{ animationDelay: '0.22s' }}>
            <div className="relative mb-2 flex flex-col items-center">
              <LaurelWreath className="animate-crown-float h-10 w-24 text-laurel-300 sm:h-12 sm:w-28" />
              <Crown
                className="absolute -top-1.5 h-6 w-6 text-laurel-300 drop-shadow-[0_0_6px_rgba(239,199,94,0.7)] sm:h-7 sm:w-7"
                strokeWidth={2}
                fill="currentColor"
              />
            </div>
            <span className="shimmer-text max-w-[9rem] truncate text-center font-display text-base font-bold sm:max-w-[11rem] sm:text-lg">
              {champion.name}
            </span>
            <span className="mb-2 mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-laurel-300">
              Campeón
            </span>
            <div
              className="relative flex w-24 items-start justify-center rounded-t-2xl border-t-4 border-laurel-400 bg-gradient-to-b from-laurel-300 to-laurel-500 pt-3 shadow-glow sm:w-32"
              style={{ height: '9.5rem' }}
            >
              <span className="animate-glow-pulse absolute inset-0 rounded-t-2xl bg-white/25 blur-md" />
              <span className="relative font-display text-4xl font-bold text-imperial-900 sm:text-5xl">1</span>
            </div>
          </div>

          {/* 3er puesto */}
          {thirdPlace ? (
            <PodiumBlock
              place={3}
              name={thirdPlace.name}
              heightClass="h-16 sm:h-20"
              blockClass="from-stone-300/90 to-stone-400/90"
              delay="0.32s"
              icon={<Medal className="h-5 w-5 text-white" strokeWidth={2.2} />}
              iconWrapClass="bg-laurel-600"
            />
          ) : (
            <div className="w-20 sm:w-28" />
          )}
        </div>
      </div>
    </div>
  );
}

function PodiumBlock({
  place,
  name,
  heightClass,
  blockClass,
  delay,
  icon,
  iconWrapClass,
}: {
  place: number;
  name: string;
  heightClass: string;
  blockClass: string;
  delay: string;
  icon: React.ReactNode;
  iconWrapClass: string;
}) {
  return (
    <div className="animate-podium-rise flex flex-col items-center" style={{ animationDelay: delay }}>
      <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full ${iconWrapClass} shadow-soft`}>{icon}</div>
      <span className="mb-2 max-w-[5rem] truncate text-center text-xs font-semibold text-white/90 sm:max-w-[6.5rem] sm:text-sm">
        {name}
      </span>
      <div
        className={`flex w-16 items-start justify-center rounded-t-xl border-t-4 border-white/30 bg-gradient-to-b ${blockClass} pt-2 sm:w-24 ${heightClass}`}
      >
        <span className="font-display text-2xl font-bold text-white/90 sm:text-3xl">{place}</span>
      </div>
    </div>
  );
}
