import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Header } from '@/components/Layout/Header';
import { ProgressSteps } from '@/components/ui/ProgressSteps';
import { Button } from '@/components/ui/Button';
import { Step1Name } from '@/components/Wizard/Step1Name';
import { Step2Format } from '@/components/Wizard/Step2Format';
import { Step3Participants } from '@/components/Wizard/Step3Participants';
import { Step4Pairings } from '@/components/Wizard/Step4Pairings';
import { TournamentPage } from '@/components/Tournament/TournamentPage';
import { generateSingleEliminationMatches, generateDoubleEliminationMatches, reportMatchResult } from '@/lib/bracket';
import { generateRoundRobinMatches, reportGroupMatchResult, defaultQualifiers } from '@/lib/roundRobin';
import { isTournamentComplete, generateLeaguePlayoffs } from '@/lib/tournament';
import { BRACKET_SIZES } from '@/types';
import type { Match, ParticipantType, PairingMode, Tournament, TournamentFormat } from '@/types';

const STEP_LABELS = ['Nombre', 'Formato', 'Participantes', 'Emparejamientos'];
const DEFAULT_COUNT = 4;
const FREE_MIN = 3;
const FREE_MAX = 24;

function makeInitialNames(count: number) {
  return Array.from({ length: count }, () => '');
}

function isBracketFormat(format: TournamentFormat) {
  return format === 'SINGLE_ELIMINATION' || format === 'DOUBLE_ELIMINATION';
}

/** Ajusta el nº de participantes al rango/valores válidos del nuevo formato. */
function adjustCountForFormat(count: number, format: TournamentFormat): number {
  if (isBracketFormat(format)) {
    if ((BRACKET_SIZES as readonly number[]).includes(count)) return count;
    return [...BRACKET_SIZES].reduce((closest, v) => (Math.abs(v - count) < Math.abs(closest - count) ? v : closest));
  }
  return Math.min(FREE_MAX, Math.max(FREE_MIN, count));
}

export default function App() {
  const [stage, setStage] = useState<'wizard' | 'tournament'>('wizard');
  const [step, setStep] = useState(0);

  const [name, setName] = useState('');
  const [format, setFormat] = useState<TournamentFormat>('SINGLE_ELIMINATION');
  const [thirdPlaceMatch, setThirdPlaceMatch] = useState(false);
  const [participantType, setParticipantType] = useState<ParticipantType>('PLAYER');
  const [names, setNames] = useState<string[]>(makeInitialNames(DEFAULT_COUNT));
  const [pairingMode, setPairingMode] = useState<PairingMode>('ORDER');
  const [qualifiersCount, setQualifiersCount] = useState(4);

  const [tournament, setTournament] = useState<Tournament | null>(null);

  const handleCountChange = (count: number) => {
    setNames((prev) => {
      const next = [...prev];
      if (count > next.length) return [...next, ...makeInitialNames(count - next.length)];
      return next.slice(0, count);
    });
    setQualifiersCount((q) => Math.min(q, count));
  };

  const handleFormatChange = (f: TournamentFormat) => {
    setFormat(f);
    const adjusted = adjustCountForFormat(names.length, f);
    if (adjusted !== names.length) handleCountChange(adjusted);
    if (f === 'LEAGUE') setQualifiersCount(defaultQualifiers(adjusted));
  };

  const handleNameChange = (index: number, value: string) => {
    setNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const isStepValid = useMemo(() => {
    switch (step) {
      case 0:
        return name.trim().length > 0;
      case 1:
        return true;
      case 2:
        return names.length >= 2 && names.every((n) => n.trim().length > 0);
      case 3:
        return true;
      default:
        return true;
    }
  }, [step, name, names]);

  const handleCreateTournament = () => {
    const participants = names.map((n, i) => ({ id: `p_${i}_${n.trim()}`, name: n.trim(), seed: i + 1 }));

    let matches: Match[] = [];
    if (format === 'SINGLE_ELIMINATION') {
      matches = generateSingleEliminationMatches(participants, pairingMode, thirdPlaceMatch);
    } else if (format === 'DOUBLE_ELIMINATION') {
      matches = generateDoubleEliminationMatches(participants, pairingMode);
    } else {
      // ROUND_ROBIN y LEAGUE comparten la misma fase de liga inicial.
      matches = generateRoundRobinMatches(participants, pairingMode);
    }

    const newTournament: Tournament = {
      id: `t_${Date.now()}`,
      createdAt: new Date().toISOString(),
      name: name.trim(),
      format,
      thirdPlaceMatch,
      participantType,
      participantCount: participants.length,
      participants,
      pairingMode,
      qualifiersCount,
      matches,
      currentRound: 1,
      isComplete: false,
      phase: 'GROUP',
    };

    setTournament(newTournament);
    setStage('tournament');
  };

  const handleReportResult = (matchId: string, scoreA: number, scoreB: number) => {
    setTournament((prev) => {
      if (!prev) return prev;
      const match = prev.matches.find((m) => m.id === matchId);
      if (!match) return prev;
      const updated =
        match.bracket === 'GROUP'
          ? reportGroupMatchResult(prev.matches, matchId, scoreA, scoreB)
          : reportMatchResult(prev.matches, matchId, scoreA, scoreB);
      const next = { ...prev, matches: updated };
      return { ...next, isComplete: isTournamentComplete(next) };
    });
  };

  const handleGeneratePlayoffs = () => {
    setTournament((prev) => {
      if (!prev || prev.format !== 'LEAGUE' || prev.phase !== 'GROUP') return prev;
      const matches = generateLeaguePlayoffs(prev.participants, prev.matches, prev.qualifiersCount);
      const next: Tournament = { ...prev, matches, phase: 'PLAYOFFS' as const };
      return { ...next, isComplete: isTournamentComplete(next) };
    });
  };

  const resetWizard = () => {
    setStage('wizard');
    setStep(0);
    setName('');
    setFormat('SINGLE_ELIMINATION');
    setThirdPlaceMatch(false);
    setParticipantType('PLAYER');
    setNames(makeInitialNames(DEFAULT_COUNT));
    setPairingMode('ORDER');
    setQualifiersCount(4);
    setTournament(null);
  };

  if (stage === 'tournament' && tournament) {
    return (
      <div className="min-h-screen bg-stone-100">
        <Header onLogoClick={resetWizard} />
        <TournamentPage
          tournament={tournament}
          onReportResult={handleReportResult}
          onGeneratePlayoffs={handleGeneratePlayoffs}
          onNewTournament={resetWizard}
          onBackToWizard={() => setStage('wizard')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <Header onLogoClick={resetWizard} />

      <main className="mx-auto max-w-2xl px-4 pb-28 pt-8 sm:px-6 sm:pb-16">
        <div className="mb-7">
          <ProgressSteps steps={STEP_LABELS} currentIndex={step} />
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-soft sm:p-8">
          {step === 0 && <Step1Name name={name} onChange={setName} />}
          {step === 1 && (
            <Step2Format
              format={format}
              thirdPlaceMatch={thirdPlaceMatch}
              onFormatChange={handleFormatChange}
              onThirdPlaceChange={setThirdPlaceMatch}
            />
          )}
          {step === 2 && (
            <Step3Participants
              format={format}
              participantType={participantType}
              names={names}
              qualifiersCount={qualifiersCount}
              onTypeChange={setParticipantType}
              onCountChange={handleCountChange}
              onNameChange={handleNameChange}
              onQualifiersChange={setQualifiersCount}
            />
          )}
          {step === 3 && (
            <Step4Pairings
              pairingMode={pairingMode}
              onChange={setPairingMode}
              participantCount={names.length}
              format={format}
            />
          )}

          {/* Navegación desktop, dentro de la tarjeta */}
          <div className="mt-8 hidden items-center justify-between border-t border-stone-100 pt-5 sm:flex">
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0} icon={<ArrowLeft className="h-4 w-4" />}>
              Atrás
            </Button>
            {step < STEP_LABELS.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!isStepValid}>
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="gold" onClick={handleCreateTournament} disabled={!isStepValid} icon={<Sparkles className="h-4 w-4" />}>
                Crear torneo
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Navegación fija móvil */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 p-4 backdrop-blur-md sm:hidden"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0} icon={<ArrowLeft className="h-4 w-4" />}>
            Atrás
          </Button>
          {step < STEP_LABELS.length - 1 ? (
            <Button fullWidth onClick={() => setStep((s) => s + 1)} disabled={!isStepValid}>
              Siguiente
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button fullWidth variant="gold" onClick={handleCreateTournament} disabled={!isStepValid} icon={<Sparkles className="h-4 w-4" />}>
              Crear torneo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
