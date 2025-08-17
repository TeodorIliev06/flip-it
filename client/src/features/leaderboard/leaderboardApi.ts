import type { LeaderboardResponse } from "./leaderboardTypes";

const BASE_URL = "https://localhost:7299";

export async function fetchLeaderboard(
  gameMode?: string,
  difficulty?: string
): Promise<LeaderboardResponse> {
  let url = `${BASE_URL}/leaderboard?limit=10`;

  if (gameMode) {
    url += `&gameMode=${encodeURIComponent(gameMode)}`;
  }
  if (difficulty) {
    url += `&difficulty=${encodeURIComponent(difficulty)}`;
  }

  const res = await fetch(url, { credentials: "include" });
  
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
  gameMode,
  accessToken,
}: {
  playerName: string;
  moves: number;
  timeInSeconds: number;
  difficulty: string;
  gameMode: string;
  accessToken?: string | null;
}) {
  const res = await fetch(`${BASE_URL}/score`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify({
      playerName,
      moves,
      timeInSeconds,
      difficulty,
      gameMode,
    }),
  });
  if (!res.ok) {
    throw new Error("Failed to save score");
  }
  return res.json();
}
