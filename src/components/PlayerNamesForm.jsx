import { useEffect, useState } from "react";
import { getAllPeople } from "../db.js";

export default function PlayerNamesForm({ numberOfPlayers, onSubmit }) {
  const [people, setPeople] = useState([]);
  const [selectedIds, setSelectedIds] = useState(() => Array(numberOfPlayers).fill(""));
  const [error, setError] = useState("");

  useEffect(() => {
    getAllPeople().then((list) =>
      setPeople([...list].sort((a, b) => a.name.localeCompare(b.name))),
    );
  }, []);

  function handleChange(index, value) {
    setSelectedIds((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function availableFor(index) {
    const takenElsewhere = selectedIds.filter((id, i) => i !== index && id !== "");
    return people.filter((p) => !takenElsewhere.includes(String(p.id)));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (selectedIds.some((id) => !id)) {
      setError("Please select a player for every slot.");
      return;
    }
    setError("");
    const selected = selectedIds.map((id) => people.find((p) => String(p.id) === id));
    onSubmit(selected);
  }

  if (people.length === 0) {
    return (
      <div className="mx-auto max-w-sm rounded-lg bg-white p-6 text-center shadow">
        <p className="text-sm text-slate-600">
          No people yet. Add people first using Manage People.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm rounded-lg bg-white p-6 shadow">
      {selectedIds.map((selectedId, index) => (
        <div key={index} className="mb-3 flex items-center gap-3">
          <label className="w-24 shrink-0 text-sm font-semibold text-slate-700">
            Player#{index + 1}
          </label>
          <select
            value={selectedId}
            onChange={(e) => handleChange(index, e.target.value)}
            className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value="">-- Select Player --</option>
            {availableFor(index).map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      ))}

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        className="mt-4 w-full rounded bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700"
      >
        Start
      </button>
    </form>
  );
}
