export type PersonalBestDto = {
  gameMode: string;
  difficulty: string | null;
  bestMoves: number;
  bestTimeInSeconds: number;
  achievedAt: string;
  totalGamesPlayed: number;
  successRate: number;
};

export type PersonalStatsResponse = {
  userId: number;
  personalBests: PersonalBestDto[];
  totalGamesPlayed: number;
  overallSuccessRate: number;
};

export type PersonalBestUpdateResponse = {
  isNewBest: boolean;
  isNewRecord: boolean;
  message: string;
};
