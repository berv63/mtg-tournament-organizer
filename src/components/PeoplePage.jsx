import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addPerson, deletePerson, getAllPeople } from "../db.js";

export default function PeoplePage() {
  const navigate = useNavigate();
  const [people, setPeople] = useState([]);
  const [name, setName] = useState("");

  function refresh() {
    getAllPeople().then((list) =>
      setPeople([...list].sort((a, b) => a.name.localeCompare(b.name))),
    );
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleAdd(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    addPerson(trimmed).then(() => {
      setName("");
      refresh();
    });
  }

  function handleDelete(id) {
    deletePerson(id).then(refresh);
  }

  return (
    <div className="mx-auto max-w-sm rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-bold text-slate-800">Manage People</h2>

      <form onSubmit={handleAdd} className="mb-6 flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Add
        </button>
      </form>

      <ul className="mb-6 divide-y divide-slate-100">
        {people.length === 0 && (
          <li className="py-2 text-sm text-slate-400">No people added yet.</li>
        )}
        {people.map((p) => (
          <li key={p.id} className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-700">{p.name}</span>
            <button
              onClick={() => handleDelete(p.id)}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={() => navigate(-1)}
        className="w-full rounded bg-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-300"
      >
        Back
      </button>
    </div>
  );
}
