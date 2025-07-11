import React, { useRef } from "react";

import { motion } from "framer-motion";

import type { Card as CardType } from "./gameTypes";

import "./game.css";

type CardProps = {
  card: CardType;
  onClick: () => void;
  disabled?: boolean;
};

const Card: React.FC<CardProps> = ({ card, onClick, disabled }) => {
  const flipSound = useRef(new Audio("/sounds/flip.wav"));

  const handleClick = () => {
    if (disabled || card.isFlipped || card.isMatched) {
      return;
    }
    flipSound.current.currentTime = 0;
    flipSound.current.play();
    onClick();
  };

  return (
    <div
      className={`perspective aspect-square w-full min-w-[100px] max-w-[160px] transition-transform duration-200
        ${
          !card.isFlipped && !card.isMatched && !disabled
            ? "hover:scale-105 hover:shadow-lg active:scale-95"
            : ""
        }
        ${disabled ? "cursor-not-allowed" : ""}
      `}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{
          rotateY: card.isFlipped || card.isMatched ? 180 : 0,
          boxShadow: card.isMatched ? "0 0 16px 4px rgb(38, 155, 81)" : "none",
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          boxShadow: { duration: 0.4 },
        }}
        tabIndex={0}
        aria-label={
          card.isFlipped || card.isMatched ? card.value : "Hidden card"
        }
        onClick={handleClick}
      >
        {/* Front */}
        <div className="absolute w-full h-full backface-hidden bg-blue-500 rounded"></div>
        {/* Back */}
        <div
          className="absolute w-full h-full backface-hidden bg-white rounded flex items-center justify-center text-4xl font-bold"
          style={{ transform: "rotateY(180deg)" }}
        >
          {card.value}
        </div>
      </motion.div>
    </div>
  );
};

export default Card;
