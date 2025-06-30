import React, { useState } from "react";

import Card from "./Card";

import type { Card as CardType } from "./gameTypes";

const initialDeck: CardType[] = [
  { id: "1", value: "🍎", isFlipped: false, isMatched: false },
  { id: "2", value: "🍎", isFlipped: false, isMatched: false },
  { id: "3", value: "🍌", isFlipped: false, isMatched: false },
  { id: "4", value: "🍌", isFlipped: false, isMatched: false },
];

const GameBoard: React.FC = () => {
  const [cards, setCards] = useState<CardType[]>(initialDeck);

  const handleCardClick = (idx: number) => {
    setCards((prev) =>
      prev.map((card, i) =>
        i === idx ? { ...card, isFlipped: true } : card
      )
    );
  };

  return (
    <div className="grid grid-cols-4 gap-8 w-full max-w-4xl px-4">
      {cards.map((card, idx) => (
        <Card key={card.id} card={card} onClick={() => handleCardClick(idx)} />
      ))}
    </div>
  );
};

export default GameBoard;