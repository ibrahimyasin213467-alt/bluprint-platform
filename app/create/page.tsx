"use client";

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Background animasyonları için component
function CreatePageBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let particles: { x: number; y: number; radius: number; speed: number; alpha: number }[] = [];
    let mouseX = 0;
    let mouseY = 0;

    // CREATE SAYFASI PEMBE RENKLERİ (MEVCUT RENK KORUNUYOR)
    const colors = {
      gridColor: "rgba(236, 72, 153, 0.08)",
      dotColor: "rgba(236, 72, 153, 0.12)",
      orbColor1: "rgba(236, 72, 153, 0.1)",
      orbColor2: "rgba(219, 39, 119, 0.08)",
      particleColor: "rgba(236, 72, 153, 0.15)"
    };

    const drawGrid = () => {
      const gridSize = 50;
      ctx.strokeStyle = colors.gridColor;
      ctx.lineWidth = 1;
      
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };

    const drawDots = () => {
      const spacing = 40;
      for (let x = spacing; x < canvas.width; x += spacing) {
        for (let y = spacing; y < canvas.height; y += spacing) {
          const opacity = Math.random() * 0.3 + 0.1;
          ctx.fillStyle = `rgba(236, 72, 153, ${opacity})`;
          
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
          
          if (Math.random() > 0.7) {
            ctx.fillStyle = `rgba(219, 39, 119, ${opacity * 0.5})`;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    const initParticles = () => {
      const particleCount = Math.min(60, Math.floor(window.innerWidth / 25));
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 1,
          speed: Math.random() * 0.3 + 0.1,
          alpha: Math.random() * 0.3 + 0.1,
        });
      }
    };

    const updateParticles = () => {
      for (const p of particles) {
        p.y += p.speed;
        if (p.y > canvas.height) {
          p.y = 0;
          p.x = Math.random() * canvas.width;
        }
      }
    };

    const drawParticles = () => {
      for (const p of particles) {
        ctx.fillStyle = `rgba(236, 72, 153, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawLightOrbs = () => {
      // Pembe orb 1
      const gradient1 = ctx.createRadialGradient(
        canvas.width * 0.3, canvas.height * 0.2, 0,
        canvas.width * 0.3, canvas.height * 0.2, canvas.width * 0.5
      );
      gradient1.addColorStop(0, "rgba(236, 72, 153, 0.12)");
      gradient1.addColorStop(1, "rgba(236, 72, 153, 0)");
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Pembe orb 2
      const gradient2 = ctx.createRadialGradient(
        canvas.width * 0.7, canvas.height * 0.8, 0,
        canvas.width * 0.7, canvas.height * 0.8, canvas.width * 0.5
      );
      gradient2.addColorStop(0, "rgba(219, 39, 119, 0.1)");
      gradient2.addColorStop(1, "rgba(219, 39, 119, 0)");
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Fare takipli orb
      const gradient3 = ctx.createRadialGradient(
        mouseX, mouseY, 0,
        mouseX, mouseY, 150
      );
      gradient3.addColorStop(0, "rgba(244, 114, 182, 0.08)");
      gradient3.addColorStop(1, "rgba(236, 72, 153, 0)");
      ctx.fillStyle = gradient3;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    let animationId: number;
    const animate = () => {
      drawGrid();
      drawDots();
      drawLightOrbs();
      updateParticles();
      drawParticles();
      animationId = requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ pointerEvents: "none" }}
    />
  );
}

// Dinamik import ile SSR'ı tamamen devre dışı bırak
const CreatePageContent = dynamic(
  () => import('./CreatePageContent'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-[#1a0b1a] via-[#2d1b2e] to-[#1a0b1a] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p>Loading wallet...</p>
        </div>
      </div>
    )
  }
);

export default function CreatePage() {
  return (
    <>
      {/* Background animasyonları */}
      <CreatePageBackground />
      
      {/* Mevcut gradient arka plan (pembemsi) */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-[#1a0b1a] via-[#2d1b2e] to-[#1a0b1a]" />
      
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-[#1a0b1a] via-[#2d1b2e] to-[#1a0b1a] flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      }>
        <CreatePageContent />
      </Suspense>
    </>
  );
}