import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  size: number;
}

interface Firework {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  exploded: boolean;
  color: string;
}

const COLORS = [
  "#22c55e", // green-500
  "#06b6d4", // cyan-500
  "#10b981", // emerald-500
  "#14b8a6", // teal-500
  "#3b82f6", // blue-500
  "#fbbf24", // amber-400
  "#f472b6", // pink-400
  "#a78bfa", // violet-400
];

export function Fireworks({ duration = 5000, onComplete }: { duration?: number; onComplete?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = [];
    const fireworks: Firework[] = [];
    let animationId: number;
    const startTime = Date.now();

    const createFirework = () => {
      const x = Math.random() * canvas.width;
      const targetY = canvas.height * 0.2 + Math.random() * canvas.height * 0.3;
      fireworks.push({
        x,
        y: canvas.height,
        targetY,
        vy: -12 - Math.random() * 4,
        exploded: false,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    };

    const explodeFirework = (fw: Firework) => {
      const particleCount = 80 + Math.floor(Math.random() * 40);
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.2;
        const speed = 2 + Math.random() * 4;
        particles.push({
          x: fw.x,
          y: fw.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: fw.color,
          life: 1,
          maxLife: 60 + Math.random() * 30,
          size: 2 + Math.random() * 2,
        });
      }
    };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed > duration) {
        setIsVisible(false);
        onComplete?.();
        return;
      }

      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (elapsed < duration - 1000 && Math.random() < 0.08) {
        createFirework();
      }

      for (let i = fireworks.length - 1; i >= 0; i--) {
        const fw = fireworks[i];
        fw.y += fw.vy;
        fw.vy += 0.15;

        if (!fw.exploded) {
          ctx.beginPath();
          ctx.arc(fw.x, fw.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = fw.color;
          ctx.fill();

          if (fw.y <= fw.targetY || fw.vy >= 0) {
            fw.exploded = true;
            explodeFirework(fw);
            fireworks.splice(i, 1);
          }
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.vx *= 0.98;
        p.life -= 1 / p.maxLife;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animationId = requestAnimationFrame(animate);
    };

    for (let i = 0; i < 5; i++) {
      setTimeout(() => createFirework(), i * 150);
    }

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
