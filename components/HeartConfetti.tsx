
import React, { useEffect, useState } from 'react';

const HeartConfetti: React.FC = () => {
  const [hearts, setHearts] = useState<{ id: number; left: string; size: string; duration: string; delay: string; rotate: string }[]>([]);

  useEffect(() => {
    const newHearts = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * (22 - 8) + 8}px`,
      duration: `${Math.random() * (10 - 6) + 6}s`,
      delay: `${Math.random() * 8}s`,
      rotate: `${Math.random() * 45}deg`
    }));
    setHearts(newHearts);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[5]">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="heart-particle text-pink-500/30"
          style={{
            left: heart.left,
            fontSize: heart.size,
            animationDuration: heart.duration,
            animationDelay: heart.delay,
            transform: `rotate(${heart.rotate})`,
            filter: 'blur(1px)'
          }}
        >
          ❤
        </div>
      ))}
    </div>
  );
};

export default HeartConfetti;
