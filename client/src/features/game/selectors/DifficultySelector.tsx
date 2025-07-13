import React from "react";
import { motion } from "framer-motion";

import Heading from "../Heading";

interface DifficultySelectorProps {
  difficulties: string[];
  selectedDifficulty: string | null;
  onSelect: (difficulty: string) => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  difficulties,
  selectedDifficulty,
  onSelect,
}) => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] w-full overflow-hidden">
    <Heading />
    <div className="mb-4 text-white text-xl font-bold">Select Difficulty</div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-xl px-4">
      {difficulties.map((level) => {
        const selected = selectedDifficulty === level;
        return (
          <motion.button
            key={level}
            whileHover={{ scale: 1.05 }}
            onClick={() => onSelect(level)}
            className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-colors duration-200
              ${
                selected
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-700 bg-gray-900 text-white hover:bg-blue-500"
              }
              cursor-pointer min-w-[140px] min-h-[100px] text-2xl font-bold`}
          >
            {level}
          </motion.button>
        );
      })}
    </div>
  </div>
);

export default DifficultySelector;
