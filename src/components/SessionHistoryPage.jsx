import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteSession, getAllSessions } from "../db.js";

export default function SessionHistoryPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);

  function refresh() {
    getAllSessions().then((list) =>
      setSessions([...list].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))),
    );
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleReview(session) {
    navigate(`/session/${session.id}/round/1?mode=review`);
  }

  function handleDelete(session) {
    if (
      !window.confirm(
        `Delete the ${session.date} ${session.format} session? This cannot be undone.`,
      )
    ) {
      return;
    }
    deleteSession(session.id).then(refresh);
  }

  return (
    <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-bold text-slate-800">Session History</h2>

      {sessions.length === 0 ? (
        <p className="mb-6 text-sm text-slate-400">No sessions yet.</p>
      ) : (
        <div className="mb-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-slate-300 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-700">
                  Date
                </th>
                <th className="border border-slate-300 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-700">
                  Format
                </th>
                <th className="border border-slate-300 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-700">
                  Set
                </th>
                <th className="border border-slate-300 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-700">
                  Players
                </th>
                <th className="border border-slate-300 bg-slate-50 px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td className="border border-slate-300 px-3 py-2">{s.date}</td>
                  <td className="border border-slate-300 px-3 py-2">{s.format}</td>
                  <td className="border border-slate-300 px-3 py-2">{s.set || "-"}</td>
                  <td className="border border-slate-300 px-3 py-2">
                    {s.players?.length ?? s.playerIds?.length ?? 0}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleReview(s)}
                        className="text-sm font-semibold text-indigo-600 hover:underline"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => handleDelete(s)}
                        className="text-sm font-medium text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={() => navigate(-1)}
        className="w-full rounded bg-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-300"
      >
        Back
      </button>
    </div>
  );
}
