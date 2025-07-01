import React from "react";
import type { Card as CardType } from "./gameTypes";

type CardProps = {
  card: CardType;
  onClick: () => void;
};

const Card: React.FC<CardProps> = ({ card, onClick }) => {
  return (
    <button
      className={`aspect-square w-full min-w-[80px] sm:min-w-[120px] md:min-w-[140px] lg:min-w-[160px] bg-blue-500 rounded shadow flex items-center justify-center text-4xl font-bold transition-transform duration-300
        ${card.isFlipped || card.isMatched ? "bg-white" : "bg-blue-500"}
        ${card.isMatched ? "opacity-50" : ""}
      `}
      onClick={onClick}
      disabled={card.isFlipped || card.isMatched}
    >
      <span>{card.isFlipped || card.isMatched ? card.value : "?"}</span>
    </button>
  );
};

export default Card;
