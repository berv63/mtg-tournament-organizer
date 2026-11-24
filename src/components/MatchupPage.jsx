const selectClass =
  "w-0 min-w-0 flex-1 rounded border border-slate-300 px-2 py-2 text-sm focus:border-indigo-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";
const scoreClass =
  "w-14 shrink-0 rounded border border-slate-300 px-2 py-2 text-center text-sm focus:border-indigo-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";
const commanderClass =
  "w-0 min-w-0 flex-1 rounded border border-slate-300 px-2 py-2 text-sm focus:border-indigo-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";
const blankScoreClass = "w-14 shrink-0 rounded border border-transparent px-2 py-2 text-center text-sm";

function availableOptions(players, rows, currentRowIndex, currentField) {
  const usedElsewhere = new Set();
  rows.forEach((row, i) => {
    ["player1", "player2"].forEach((field) => {
      if (i === currentRowIndex && field === currentField) return;
      if (row[field] && row[field] !== "Bye") usedElsewhere.add(row[field]);
    });
  });
  return players.filter((name) => !usedElsewhere.has(name));
}

export default function MatchupPage({ players, rows, onRowChange, readOnly, showCommander }) {
  function commanderInput(rowIndex, field, value) {
    return (
      <input
        type="text"
        placeholder="Commander"
        disabled={readOnly}
        value={value ?? ""}
        onChange={(e) => onRowChange(rowIndex, field, e.target.value)}
        className={commanderClass}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg bg-white p-4 shadow">
      <div className={`flex flex-col gap-3 ${showCommander ? "min-w-[42rem]" : "min-w-[26rem]"}`}>
        {rows.map((row, rowIndex) => {
          const isBye = row.player2 === "Bye";
          const player1Options = availableOptions(players, rows, rowIndex, "player1");
          const player2Options = isBye
            ? []
            : availableOptions(players, rows, rowIndex, "player2");

          return (
            <div
              key={rowIndex}
              className="flex flex-nowrap items-center gap-2 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
            >
              <select
                value={row.player1}
                disabled={readOnly}
                onChange={(e) => onRowChange(rowIndex, "player1", e.target.value)}
                className={selectClass}
              >
                <option value="">-- Select Player --</option>
                {player1Options.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              {showCommander && commanderInput(rowIndex, "commander1", row.commander1)}

              {isBye ? (
                <>
                  <span className={blankScoreClass} />
                  <span className="shrink-0 text-sm font-medium text-transparent">vs</span>
                  <span className={blankScoreClass} />
                  <span className="w-0 min-w-0 flex-1 px-2 py-2 text-sm font-semibold text-slate-400">
                    Bye
                  </span>
                  {showCommander && <span className="w-0 min-w-0 flex-1" />}
                </>
              ) : (
                <>
                  <input
                    type="number"
                    min="0"
                    disabled={readOnly}
                    value={row.score1}
                    onChange={(e) => onRowChange(rowIndex, "score1", e.target.value)}
                    className={scoreClass}
                  />

                  <span className="shrink-0 text-sm font-medium text-slate-400">vs</span>

                  <input
                    type="number"
                    min="0"
                    disabled={readOnly}
                    value={row.score2}
                    onChange={(e) => onRowChange(rowIndex, "score2", e.target.value)}
                    className={scoreClass}
                  />

                  <select
                    value={row.player2}
                    disabled={readOnly}
                    onChange={(e) => onRowChange(rowIndex, "player2", e.target.value)}
                    className={selectClass}
                  >
                    <option value="">-- Select Player --</option>
                    {player2Options.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  {showCommander && commanderInput(rowIndex, "commander2", row.commander2)}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
