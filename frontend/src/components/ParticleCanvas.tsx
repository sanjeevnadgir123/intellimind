import React, { useEffect, useRef } from 'react';

export const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Particle[] = [];
    const particleCount = 45;

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.15;
        this.vy = (Math.random() - 0.5) * 0.15;
        this.size = Math.random() * 2 + 1;
        this.color = Math.random() > 0.5 ? 'rgba(99, 102, 241, 0.35)' : 'rgba(168, 85, 247, 0.3)';
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Floating large glowing background orbs (nebula dots)
    const orbs = [
      { x: width * 0.25, y: height * 0.3, size: width * 0.35, color: 'rgba(79, 70, 229, 0.05)' },
      { x: width * 0.75, y: height * 0.7, size: width * 0.4, color: 'rgba(147, 51, 234, 0.04)' },
      { x: width * 0.5, y: height * 0.5, size: width * 0.3, color: 'rgba(59, 130, 246, 0.03)' }
    ];

    // Shifting wave line paths
    let time = 0;
    const drawWaveLines = () => {
      time += 0.002;
      ctx.save();
      ctx.lineWidth = 1.0;

      // Line 1: Indigo Wave
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.05)';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.4 + Math.sin(time) * 30);
      ctx.bezierCurveTo(
        width * 0.3, height * 0.2 + Math.cos(time * 0.5) * 50,
        width * 0.7, height * 0.7 + Math.sin(time * 0.8) * 40,
        width, height * 0.5 + Math.cos(time) * 30
      );
      ctx.stroke();

      // Line 2: Purple Wave
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.04)';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.6 + Math.cos(time * 1.2) * 20);
      ctx.bezierCurveTo(
        width * 0.25, height * 0.8 + Math.sin(time) * 40,
        width * 0.75, height * 0.3 + Math.cos(time * 0.6) * 30,
        width, height * 0.4 + Math.sin(time * 1.1) * 20
      );
      ctx.stroke();

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Dark solid radial base
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        10,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.9
      );
      grad.addColorStop(0, '#040407');
      grad.addColorStop(1, '#010103');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Render nebulas/orbs
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      orbs.forEach(orb => {
        const rad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.size);
        rad.addColorStop(0, orb.color);
        rad.addColorStop(1, 'transparent');
        ctx.fillStyle = rad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // Draw waves
      drawWaveLines();

      // Update and draw particles
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      orbs[0].x = width * 0.25; orbs[0].y = height * 0.3; orbs[0].size = width * 0.35;
      orbs[1].x = width * 0.75; orbs[1].y = height * 0.7; orbs[1].size = width * 0.4;
      orbs[2].x = width * 0.5; orbs[2].y = height * 0.5; orbs[2].size = width * 0.3;
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
};
