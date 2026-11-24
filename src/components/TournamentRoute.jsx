import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import TournamentView from "./TournamentView.jsx";
import { getSession } from "../db.js";

export default function TournamentRoute({ onExit }) {
  const { sessionId, round } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") === "review" ? "review" : "active";
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    getSession(Number(sessionId)).then((found) => {
      if (cancelled) return;
      if (!found) {
        setStatus("not-found");
        return;
      }
      setSession(found);
      setStatus("ready");
    });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  function handleNavigateRound(newRound, options) {
    const suffix = mode === "review" ? "?mode=review" : "";
    navigate(`/session/${sessionId}/round/${newRound}${suffix}`, options);
  }

  if (status === "loading") {
    return (
      <p className="mx-auto max-w-sm text-center text-sm text-slate-500">Loading session...</p>
    );
  }

  if (status === "not-found") {
    return (
      <div className="mx-auto max-w-sm rounded-lg bg-white p-6 text-center shadow">
        <p className="mb-4 text-sm text-slate-600">Session not found.</p>
        <button
          onClick={onExit}
          className="rounded bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <TournamentView
      key={session.id}
      session={session}
      round={Number(round) || 1}
      mode={mode}
      onNavigateRound={handleNavigateRound}
      onExit={onExit}
    />
  );
}
