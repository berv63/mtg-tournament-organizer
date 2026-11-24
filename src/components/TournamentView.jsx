import { useEffect, useState } from "react";
import MatchupPage from "./MatchupPage.jsx";
import Positions from "./Positions.jsx";
import { deleteSession, putSession } from "../db.js";
import {
  computeByeRowIndex,
  computeRowsPerPage,
  computeStandings,
  isRoundBlank,
  newPage,
} from "../roundRobin.js";

const primaryBtn =
  "flex-1 rounded bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700";
const submitBtn =
  "flex-1 rounded bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700";
const resetBtn =
  "flex-1 rounded bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700";
const cancelBtn =
  "flex-1 rounded bg-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-300";
const backNavBtn =
  "rounded bg-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-300";
const nextNavBtn =
  "rounded bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700";

export default function TournamentView({ session, round, mode, onNavigateRound, onExit }) {
  const isReview = mode === "review";
  const players = session.players;
  const rowsPerPage = computeRowsPerPage(players.length);
  const byeRowIndex = computeByeRowIndex(players.length, rowsPerPage);

  const [pages, setPages] = useState(session.pages);
  const [isEditing, setIsEditing] = useState(!isReview);
  const [editSnapshot, setEditSnapshot] = useState(null);

  const maxRound = isEditing ? pages.length + 1 : Math.max(pages.length, 1);
  const clampedRound = Math.min(Math.max(round, 1), maxRound);

  useEffect(() => {
    if (clampedRound !== round) {
      onNavigateRound(clampedRound, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, clampedRound]);

  useEffect(() => {
    if (isEditing && clampedRound === pages.length + 1) {
      setPages((prev) => [...prev, newPage(rowsPerPage, byeRowIndex)]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clampedRound, isEditing]);

  const currentPage = clampedRound - 1;
  const rows = pages[currentPage] ?? newPage(rowsPerPage, byeRowIndex);

  // A review is read-only until Edit is pressed, so nothing autosaves until Submit.
  useEffect(() => {
    if (isReview) return;
    putSession({
      ...session,
      pages,
      currentPage,
      status: "in-progress",
      updatedAt: new Date().toISOString(),
    });
    // session's own fields (id, players, etc.) don't change while this component is mounted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages, currentPage]);

  function handleRowChange(rowIndex, field, value) {
    if (!isEditing) return;
    setPages((prev) =>
      prev.map((page, pageIndex) =>
        pageIndex !== currentPage
          ? page
          : page.map((row, i) => (i !== rowIndex ? row : { ...row, [field]: value })),
      ),
    );
  }

  function handleNext() {
    if (isEditing && isRoundBlank(rows)) return;
    if (isEditing && clampedRound === pages.length + 1) {
      setPages((prev) => [...prev, newPage(rowsPerPage, byeRowIndex)]);
    }
    onNavigateRound(clampedRound + 1);
  }

  function handleBack() {
    onNavigateRound(Math.max(1, clampedRound - 1));
  }

  function handleReset() {
    if (!window.confirm("Are you sure you want to reset the current session?")) {
      return;
    }
    deleteSession(session.id).then(onExit);
  }

  function handleEdit() {
    setEditSnapshot(pages);
    setIsEditing(true);
  }

  function handleCancelEdit() {
    if (editSnapshot) {
      setPages(editSnapshot);
    }
    setEditSnapshot(null);
    setIsEditing(false);
  }

  function handleSubmit() {
    const finalPages = isRoundBlank(pages[currentPage])
      ? pages.filter((_, i) => i !== currentPage)
      : pages;
    putSession({
      ...session,
      pages: finalPages,
      currentPage: Math.min(currentPage, Math.max(finalPages.length - 1, 0)),
      status: "submitted",
      updatedAt: new Date().toISOString(),
    }).then(onExit);
  }

  const sortedPositions = computeStandings(pages, players);

  const showNext = isEditing || clampedRound < pages.length;
  const nextDisabled = isEditing && isRoundBlank(rows);

  return (
    <div>
      <div className="mb-6 rounded-lg bg-white p-4 text-slate-700 shadow">
        <span className="font-semibold">Date:</span> {session.date}
        <span className="mx-3">&middot;</span>
        <span className="font-semibold">Format:</span> {session.format}
        {session.set && (
          <>
            <span className="mx-3">&middot;</span>
            <span className="font-semibold">Set:</span> {session.set}
          </>
        )}
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="flex-1">
          <p className="mb-2 text-sm font-semibold text-slate-500">
            Round {clampedRound} of {Math.max(pages.length, clampedRound)}
          </p>

          <MatchupPage
            players={players}
            rows={rows}
            onRowChange={handleRowChange}
            readOnly={!isEditing}
            showCommander={session.format === "Commander"}
          />

          <div className="mt-4 flex justify-between">
            {clampedRound > 1 ? (
              <button onClick={handleBack} className={backNavBtn}>
                Back
              </button>
            ) : (
              <span />
            )}
            {showNext && (
              <button
                onClick={handleNext}
                disabled={nextDisabled}
                className={`${nextNavBtn} disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500`}
              >
                Next
              </button>
            )}
          </div>
          {nextDisabled && (
            <p className="mt-2 text-right text-xs text-slate-400">
              Enter at least one result to continue.
            </p>
          )}
        </div>

        <Positions
          positions={sortedPositions}
          actions={
            isReview && !isEditing ? (
              <button onClick={handleEdit} className={primaryBtn}>
                Edit
              </button>
            ) : isReview && isEditing ? (
              <>
                <button onClick={handleSubmit} className={submitBtn}>
                  Submit
                </button>
                <button onClick={handleCancelEdit} className={cancelBtn}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button onClick={handleReset} className={resetBtn}>
                  Reset
                </button>
                <button onClick={handleSubmit} className={submitBtn}>
                  Submit
                </button>
              </>
            )
          }
        />
      </div>
    </div>
  );
}
