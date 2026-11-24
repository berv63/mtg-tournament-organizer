import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import SetupForm from "./components/SetupForm.jsx";
import PlayerNamesForm from "./components/PlayerNamesForm.jsx";
import PeoplePage from "./components/PeoplePage.jsx";
import SessionHistoryPage from "./components/SessionHistoryPage.jsx";
import TournamentRoute from "./components/TournamentRoute.jsx";
import ImportExportControls from "./components/ImportExportControls.jsx";
import { addSession, getAllSessions } from "./db.js";
import { computeByeRowIndex, computeRowsPerPage, newPage } from "./roundRobin.js";

function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function emptyTournamentInfo() {
  return { date: todayISO(), format: "", set: "", numberOfPlayers: "" };
}

export default function App() {
  const navigate = useNavigate();
  const [tournamentInfo, setTournamentInfo] = useState(emptyTournamentInfo);

  useEffect(() => {
    getAllSessions().then((sessions) => {
      const inProgress = sessions
        .filter((s) => s.status === "in-progress")
        .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
      if (inProgress.length > 0) {
        const s = inProgress[0];
        navigate(`/session/${s.id}/round/${s.currentPage + 1}`, { replace: true });
      }
    });
    // only check once, on app startup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSetupSubmit(info) {
    setTournamentInfo(info);
    navigate("/names");
  }

  async function handleNamesSubmit(selected) {
    const players = selected.map((p) => p.name);
    const rowsPerPage = computeRowsPerPage(players.length);
    const byeRowIndex = computeByeRowIndex(players.length, rowsPerPage);
    const now = new Date().toISOString();
    const session = {
      date: tournamentInfo.date,
      format: tournamentInfo.format,
      set: tournamentInfo.set,
      playerIds: selected.map((p) => p.id),
      players,
      pages: [newPage(rowsPerPage, byeRowIndex)],
      currentPage: 0,
      status: "in-progress",
      createdAt: now,
      updatedAt: now,
    };
    const id = await addSession(session);
    navigate(`/session/${id}/round/1`);
  }

  function handleTournamentExit() {
    setTournamentInfo(emptyTournamentInfo());
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="mb-6 text-center text-3xl font-bold text-slate-800">
          MTG RoundRobin Tournament
        </h1>

        <div className="mb-2 flex justify-end">
          <ImportExportControls />
        </div>

        <div className="mb-4 flex flex-col items-end gap-1">
          <Link to="/history" className="text-sm font-semibold text-indigo-600 hover:underline">
            Session History
          </Link>
          <Link to="/people" className="text-sm font-semibold text-indigo-600 hover:underline">
            Manage People
          </Link>
        </div>

        <Routes>
          <Route
            path="/"
            element={<SetupForm initialInfo={tournamentInfo} onSubmit={handleSetupSubmit} />}
          />
          <Route
            path="/names"
            element={
              tournamentInfo.numberOfPlayers ? (
                <PlayerNamesForm
                  numberOfPlayers={tournamentInfo.numberOfPlayers}
                  onSubmit={handleNamesSubmit}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="/people" element={<PeoplePage />} />
          <Route path="/history" element={<SessionHistoryPage />} />
          <Route
            path="/session/:sessionId/round/:round"
            element={<TournamentRoute onExit={handleTournamentExit} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
