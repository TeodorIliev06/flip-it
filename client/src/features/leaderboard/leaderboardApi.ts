import type { LeaderboardResponse } from "./leaderboardTypes";

const BASE_URL = "https://localhost:7299";

export async function fetchLeaderboard(
  difficulty?: string
): Promise<LeaderboardResponse> {
  const url = difficulty
    ? `${BASE_URL}/leaderboard?limit=10?difficulty=${difficulty}`
    : `${BASE_URL}/leaderboard?limit=10`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch leaderboard");
  }
  return res.json();
}

export async function postScore({
  playerName,
  moves,
  timeInSeconds,
  difficulty,
}: {
  playerName: string;
  moves: number;
  timeInSeconds: number;
  difficulty: string;
}) {
  const res = await fetch(`${BASE_URL}/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerName, moves, timeInSeconds, difficulty }),
  });
  if (!res.ok) {
    throw new Error("Failed to save score");
  }
  return res.json();
}
