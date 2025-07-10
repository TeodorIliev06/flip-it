import React from "react";

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

const ModeSelector: React.FC<ModeSelectorProps> = ({ modes, selectedMode, onSelect }) => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] w-full overflow-hidden">
    <h1 className="text-4xl font-bold mb-8 text-white drop-shadow">FlipIt Memory Game</h1>
    <div className="mb-2 text-white text-xl font-bold">Choose Game Mode</div>
    <div className="flex flex-col gap-4 w-64">
      {modes.map((mode) => (
        <button
          key={mode.key}
          onClick={() => onSelect(mode.key)}
          className={`flex flex-row items-center gap-3 px-4 py-3 rounded-lg shadow transition-colors duration-200 border-2 text-left
            ${selectedMode === mode.key ? "bg-blue-600 border-blue-400 text-white" : "bg-gray-800 border-gray-700 text-white hover:bg-blue-500"}`}
        >
          <span className="text-2xl">{mode.icon}</span>
          <span>
            <div className="font-semibold">{mode.name}</div>
            <div className="text-sm opacity-80 leading-tight">{mode.description}</div>
          </span>
        </button>
      ))}
    </div>
  </div>
);

export default ModeSelector; 
