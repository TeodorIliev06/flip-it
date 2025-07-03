import type { LeaderboardResponse } from "./leaderboardTypes";

const BASE_URL = "https://localhost:7299/leaderboard?limit=10";

export async function fetchLeaderboard(
  difficulty?: string
): Promise<LeaderboardResponse> {
  const url = difficulty ? `${BASE_URL}?difficulty=${difficulty}` : BASE_URL;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch leaderboard");
  }
  return res.json();
}
