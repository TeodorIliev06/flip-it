export type ScoreResponse = {
  id: number;
  playerName: string;
  moves: number;
  timeInSeconds: number;
  createdAt: string;
  difficulty: string;
};

export type LeaderboardResponse = {
  topScores: ScoreResponse[];
  totalScores: number;
};
