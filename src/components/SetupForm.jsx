import { useState } from "react";

const FORMAT_OPTIONS = ["Draft", "Sealed", "Commander", "Standard", "Pauper", "Other"];

const fieldClass =
  "w-full rounded border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none";
const labelClass = "mb-1 block text-sm font-semibold text-slate-700";

export default function SetupForm({ initialInfo, onSubmit }) {
  const [date, setDate] = useState(initialInfo.date);
  const [format, setFormat] = useState(initialInfo.format);
  const [set, setSet] = useState(initialInfo.set);
  const [numberOfPlayers, setNumberOfPlayers] = useState(initialInfo.numberOfPlayers);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!date) {
      setError("Date is required.");
      return;
    }
    if (!format) {
      setError("Format is required.");
      return;
    }
    if (Number(numberOfPlayers) < 2) {
      setError("Number of Players must be at least 2.");
      return;
    }
    setError("");
    onSubmit({ date, format, set, numberOfPlayers: Number(numberOfPlayers) });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm rounded-lg bg-white p-6 shadow">
      <div className="mb-4">
        <label className={labelClass}>Date *</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={fieldClass}
        />
      </div>

      <div className="mb-4">
        <label className={labelClass}>Format *</label>
        <select value={format} onChange={(e) => setFormat(e.target.value)} className={fieldClass}>
          <option value="">-- Select Format --</option>
          {FORMAT_OPTIONS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className={labelClass}>Set</label>
        <input
          type="text"
          value={set}
          onChange={(e) => setSet(e.target.value)}
          placeholder="e.g. MH3, LTR"
          className={fieldClass}
        />
      </div>

      <div className="mb-4">
        <label className={labelClass}>Number of Players *</label>
        <input
          type="number"
          min="2"
          value={numberOfPlayers}
          onChange={(e) => setNumberOfPlayers(e.target.value)}
          className={fieldClass}
        />
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        className="w-full rounded bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700"
      >
        Players
      </button>
    </form>
  );
}
