import React from "react";
import { motion } from "framer-motion";

import Heading from "../Heading";

interface Mode {
  key: string;
  name: string;
  description: string;
  icon: string;
  supportsDifficulty: boolean;
}

interface ModeSelectorProps {
  modes: Mode[];
  selectedMode: string | null;
  onSelect: (modeKey: string) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({
  modes,
  selectedMode,
  onSelect,
}) => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] w-full overflow-hidden">
    <Heading />
    
    <div className="mb-4 text-white text-xl font-bold">Choose Game Mode</div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-3xl px-4">
      {modes.map((mode) => (
        <motion.button
          key={mode.key}
          onClick={() => onSelect(mode.key)}
          whileHover={{ scale: 1.05, boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}
          animate={
            selectedMode === mode.key
              ? { borderColor: "#2563eb", backgroundColor: "#1e293b" }
              : {}
          }
          className={`flex flex-col items-center p-6 rounded-xl border-2 transition-colors duration-200
            ${
              selectedMode === mode.key
                ? "border-blue-600 bg-slate-800"
                : "border-gray-700 bg-gray-900"
            }
            cursor-pointer min-w-[220px] min-h-[260px]`}
        >
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-700 mb-4 text-3xl">
            {mode.icon}
          </div>
          <div className="text-2xl font-bold text-white mb-2 text-center">
            {mode.name}
          </div>
          <div className="text-base text-gray-300 text-center">
            {mode.description}
          </div>
        </motion.button>
      ))}
    </div>
  </div>
);

export default ModeSelector;
