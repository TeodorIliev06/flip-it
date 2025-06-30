import React, { useState } from "react";
import GameBoard from "./GameBoard";

const GamePage: React.FC = () => {
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // TODO: manage cards, timer here

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">FlipIt Memory Game</h1>
      <GameBoard
        moves={moves}
        setMoves={setMoves}
        setGameOver={setGameOver}
      />
      {gameOver && (
        <div className="mt-4 text-green-600 font-semibold">
          🎉 Game Over! You won in {moves} moves!
        </div>
      )}
    </div>
  );
};

export default GamePage;