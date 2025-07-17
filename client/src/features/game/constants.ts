export const DEFAULT_TIME_LIMIT = 30; // in s
export const MEMORIZE_TIME = 2000; // in ms

export const GAME_MODES = [
  {
    key: "Classic",
    name: "Classic",
    description: "Match all pairs in as few moves as possible.",
    icon: "🃏",
    supportsDifficulty: true,
  },
  {
    key: "MemoryMaster",
    name: "Memory Master",
    description:
      "Memorize the board, then match all pairs without a single mistake!",
    icon: "🧠",
    supportsDifficulty: false,
  },
  {
    key: "Timed",
    name: "Timed",
    description: "Match all pairs in the allocated time.",
    icon: "⏰",
    supportsDifficulty: false,
  },
];

export const GAME_MODE_KEYS = {
  CLASSIC: "Classic",
  MEMORY_MASTER: "MemoryMaster",
  TIMED: "Timed",
};
