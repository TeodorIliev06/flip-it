import React from "react";

type GameBoardProps = {
  moves: number;
  setMoves: React.Dispatch<React.SetStateAction<number>>;
  setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
};

const GameBoard: React.FC<GameBoardProps> = () => {
  // TODO: Card rendering and logic here
  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Render Card components here */}
      <div className="w-24 h-32 bg-white rounded shadow flex items-center justify-center">
        Card
      </div>
    </div>
  );
};

export default GameBoard;