import type { StandingRow } from '@/types';

interface Props {
  standings: StandingRow[];
  qualifiersCount?: number;
}

export function StandingsTable({ standings, qualifiersCount }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">
              <th className="w-10 px-3 py-2.5">#</th>
              <th className="px-3 py-2.5">Participante</th>
              <th className="px-2 py-2.5 text-center">PJ</th>
              <th className="px-2 py-2.5 text-center">G</th>
              <th className="px-2 py-2.5 text-center">E</th>
              <th className="px-2 py-2.5 text-center">P</th>
              <th className="px-2 py-2.5 text-center">DIF</th>
              <th className="px-3 py-2.5 text-right">PTS</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, i) => {
              const qualifies = qualifiersCount != null && i < qualifiersCount;
              const diff = row.scoreFor - row.scoreAgainst;
              return (
                <tr
                  key={row.participant.id}
                  className={`border-b border-stone-100 last:border-0 ${qualifies ? 'bg-laurel-400/10' : ''}`}
                >
                  <td className="relative px-3 py-2.5 font-mono text-xs text-stone-500">
                    {qualifies && <span className="absolute left-0 top-0 h-full w-0.5 bg-laurel-400" />}
                    {i + 1}
                  </td>
                  <td className="px-3 py-2.5 font-medium text-stone-900">{row.participant.name}</td>
                  <td className="px-2 py-2.5 text-center text-stone-600">{row.played}</td>
                  <td className="px-2 py-2.5 text-center text-victory-600">{row.wins}</td>
                  <td className="px-2 py-2.5 text-center text-stone-500">{row.draws}</td>
                  <td className="px-2 py-2.5 text-center text-defeat-600">{row.losses}</td>
                  <td className="px-2 py-2.5 text-center font-mono text-stone-600">
                    {diff > 0 ? `+${diff}` : diff}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-base font-bold text-stone-900">
                    {row.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {qualifiersCount != null && (
        <div className="flex items-center gap-2 border-t border-stone-100 bg-laurel-400/10 px-4 py-2.5 text-xs text-stone-600">
          <span className="h-2 w-2 rounded-full bg-laurel-400" />
          Los {qualifiersCount} primeros clasifican a la fase eliminatoria.
        </div>
      )}
    </div>
  );
}
