import React from "react";
import GameBoard from "./GameBoard";

const GamePage: React.FC = () => {
  // TODO: manage cards, timer here

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gray-900">
      <h1 className="text-4xl font-bold mb-8 text-white drop-shadow">FlipIt Memory Game</h1>
      <GameBoard />
    </div>
  );
};

export default GamePage;