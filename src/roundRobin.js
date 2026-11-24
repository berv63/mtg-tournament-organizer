export function computeRowsPerPage(playerCount) {
  return Math.max(1, Math.ceil(playerCount / 2));
}

export function computeByeRowIndex(playerCount, rowsPerPage) {
  return playerCount % 2 !== 0 ? rowsPerPage - 1 : -1;
}

export function newPage(rowsPerPage, byeRowIndex) {
  return Array.from({ length: rowsPerPage }, (_, i) => ({
    player1: "",
    commander1: "",
    score1: "",
    player2: i === byeRowIndex ? "Bye" : "",
    commander2: "",
    score2: "",
  }));
}

export function isRoundBlank(page) {
  return page.every((row) => {
    const hasPlayer = Boolean(row.player1) || (Boolean(row.player2) && row.player2 !== "Bye");
    const hasScore = Boolean(row.score1) || Boolean(row.score2);
    return !hasPlayer && !hasScore;
  });
}

const TIEBREAKER_FLOOR = 1 / 3;

// MTG match scoring: 3 points for a match win, 1 for a match draw, 0 for a match
// loss. score1/score2 are games won within the match; whoever won more games won
// the match. Ties on games (including an unplayed 0-0 row) score as a draw. A bye
// counts as an automatic match win, treated as a 2-0 game record for GWP%.
//
// Sort order (skipping Opponents' Game Win % by request): Match Points, then
// Opponents' Match Win % (OMW%), then the player's own Game Win % (GWP%).
export function computeStandings(pages, players) {
  const stats = Object.fromEntries(
    players.map((name) => [
      name,
      { points: 0, wins: 0, roundsPlayed: 0, gamePoints: 0, gamesPlayed: 0, opponents: [] },
    ]),
  );

  pages.forEach((page) => {
    page.forEach((row) => {
      if (row.player2 === "Bye") {
        const s = stats[row.player1];
        if (s) {
          s.points += 3;
          s.wins += 1;
          s.roundsPlayed += 1;
          s.gamePoints += 6;
          s.gamesPlayed += 2;
        }
        return;
      }
      if (!row.player1 || !row.player2) return;

      const games1 = parseInt(row.score1, 10) || 0;
      const games2 = parseInt(row.score2, 10) || 0;
      const s1 = stats[row.player1];
      const s2 = stats[row.player2];

      if (s1) {
        s1.roundsPlayed += 1;
        s1.gamePoints += games1 * 3;
        s1.gamesPlayed += games1 + games2;
        s1.opponents.push(row.player2);
      }
      if (s2) {
        s2.roundsPlayed += 1;
        s2.gamePoints += games2 * 3;
        s2.gamesPlayed += games1 + games2;
        s2.opponents.push(row.player1);
      }

      if (games1 > games2) {
        if (s1) {
          s1.points += 3;
          s1.wins += 1;
        }
      } else if (games2 > games1) {
        if (s2) {
          s2.points += 3;
          s2.wins += 1;
        }
      } else {
        if (s1) s1.points += 1;
        if (s2) s2.points += 1;
      }
    });
  });

  function matchWinPct(name) {
    const s = stats[name];
    if (!s || s.roundsPlayed === 0) return 0;
    return Math.max(TIEBREAKER_FLOOR, s.points / (3 * s.roundsPlayed));
  }

  function gameWinPct(name) {
    const s = stats[name];
    if (!s || s.gamesPlayed === 0) return 0;
    return Math.max(TIEBREAKER_FLOOR, s.gamePoints / (3 * s.gamesPlayed));
  }

  const results = players.map((name) => {
    const s = stats[name];
    const omw =
      s.opponents.length > 0
        ? s.opponents.reduce((sum, opp) => sum + matchWinPct(opp), 0) / s.opponents.length
        : 0;
    return { name, points: s.points, wins: s.wins, omw, gwp: gameWinPct(name) };
  });

  results.sort((a, b) => b.points - a.points || b.omw - a.omw || b.gwp - a.gwp);

  return results;
}
