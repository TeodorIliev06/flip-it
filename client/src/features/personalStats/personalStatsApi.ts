import type {
  PersonalStatsResponse,
  PersonalBestUpdateResponse,
  PersonalBestDto,
} from "./personalStatsTypes";

const BASE_URL = "https://localhost:7299";

export async function fetchPersonalStats(
  accessToken: string
): Promise<PersonalStatsResponse> {
  const res = await fetch(`${BASE_URL}/personal-stats`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch personal stats");
  }

  return res.json();
}

export async function updatePersonalBest({
  playerName,
  moves,
  timeInSeconds,
  difficulty,
  gameMode,
}: {
  playerName: string;
  moves: number;
  timeInSeconds: number;
  difficulty: string;
  gameMode: string;
}): Promise<PersonalBestUpdateResponse> {
  const res = await fetch(`${BASE_URL}/personal-stats/update-best`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
    throw new Error("Failed to update personal best");
  }

  return res.json();
}

export async function getPersonalBest(
  gameMode: string,
  difficulty?: string
): Promise<PersonalBestDto> {
  let url = `${BASE_URL}/personal-stats/best/${encodeURIComponent(gameMode)}`;
  if (difficulty) {
    url += `?difficulty=${encodeURIComponent(difficulty)}`;
  }

  const res = await fetch(url, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch personal best");
  }

  return res.json();
}
