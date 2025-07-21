import React, { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

export const Confetti: React.FC = () => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  const colors = [
    'hsl(264, 83%, 62%)', // Primary
    'hsl(45, 93%, 58%)',  // Secondary
    'hsl(264, 100%, 75%)', // Primary glow
    'hsl(45, 100%, 70%)',  // Secondary glow
    'hsl(0, 0%, 98%)',     // White
    'hsl(315, 75%, 65%)',  // Pink
  ];

  useEffect(() => {
    const createConfetti = () => {
      const newPieces: ConfettiPiece[] = [];
      
      for (let i = 0; i < 50; i++) {
        newPieces.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: -10,
          vx: (Math.random() - 0.5) * 4,
          vy: Math.random() * 3 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 8 + 4,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
        });
      }
      
      setPieces(newPieces);
    };

    createConfetti();

    // Animation loop
    const animateConfetti = () => {
      setPieces(currentPieces => 
        currentPieces.map(piece => ({
          ...piece,
          x: piece.x + piece.vx,
          y: piece.y + piece.vy,
          vy: piece.vy + 0.1, // Gravity
          rotation: piece.rotation + piece.rotationSpeed,
        })).filter(piece => piece.y < window.innerHeight + 20)
      );
    };

    const interval = setInterval(animateConfetti, 16); // ~60fps

    // Clean up after 3 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setPieces([]);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(piece => (
        <div
          key={piece.id}
          className="absolute animate-confetti-burst"
          style={{
            left: `${piece.x}px`,
            top: `${piece.y}px`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
          }}
        />
      ))}
    </div>
  );
};