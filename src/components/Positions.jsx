function formatPct(value) {
  return `${(value * 100).toFixed(1)}%`;
}

export default function Positions({ positions, actions }) {
  return (
    <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow md:w-80">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border border-slate-300 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-700">
                Name
              </th>
              <th className="border border-slate-300 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-700">
                Points
              </th>
              <th className="border border-slate-300 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-700">
                Wins
              </th>
              <th className="border border-slate-300 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-700">
                <abbr title="Opponents' Match Win Percentage" className="cursor-help">
                  OMW%
                </abbr>
              </th>
              <th className="border border-slate-300 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-700">
                <abbr title="Game Win Percentage" className="cursor-help">
                  GWP%
                </abbr>
              </th>
            </tr>
          </thead>
          <tbody>
            {positions.map((p, i) => (
              <tr key={i}>
                <th className="border border-slate-300 px-3 py-2 text-left font-medium text-slate-700">
                  {p.name}
                </th>
                <td className="border border-slate-300 px-3 py-2">{p.points}</td>
                <td className="border border-slate-300 px-3 py-2">{p.wins}</td>
                <td className="border border-slate-300 px-3 py-2">{formatPct(p.omw)}</td>
                <td className="border border-slate-300 px-3 py-2">{formatPct(p.gwp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {actions && <div className="mt-4 flex gap-2">{actions}</div>}
    </div>
  );
}
