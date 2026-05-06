import React, { useEffect, useState } from 'react';

export default function Particles({ color = '#C084FC', count = 18 }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      const size = Math.random() * 3 + 1;
      newParticles.push({
        id: i,
        width: `${size}px`,
        height: `${size}px`,
        background: color,
        opacity: Math.random() * 0.25 + 0.05,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animation: `float ${Math.random() * 10 + 8}s ease-in-out infinite ${Math.random() * 5}s`
      });
    }
    setParticles(newParticles);
  }, [color, count]);

  return (
    <div id="particles">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            width: p.width,
            height: p.height,
            background: p.background,
            opacity: p.opacity,
            left: p.left,
            top: p.top,
            animation: p.animation
          }}
        />
      ))}
    </div>
  );
}
