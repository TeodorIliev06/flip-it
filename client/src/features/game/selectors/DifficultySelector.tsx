import React from "react";

interface DifficultySelectorProps {
  difficulties: string[];
  selectedDifficulty: string | null;
  onSelect: (difficulty: string) => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ difficulties, selectedDifficulty, onSelect }) => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] w-full overflow-hidden">
    <h1 className="text-4xl font-bold mb-8 text-white drop-shadow">FlipIt Memory Game</h1>
    <div className="mb-2 text-white text-xl font-bold">Select Difficulty</div>
    <div className="flex flex-col gap-4 w-64">
      {difficulties.map((level) => (
        <button
          key={level}
          onClick={() => onSelect(level)}
          className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold shadow transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
            ${selectedDifficulty === level ? "bg-blue-600 text-white" : "bg-gray-800 text-white hover:bg-blue-500"}`}
          style={{ minWidth: 120 }}
        >
          {level}
        </button>
      ))}
    </div>
  </div>
);

export default DifficultySelector; 
