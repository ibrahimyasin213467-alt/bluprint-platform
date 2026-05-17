"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  const isCreatePage = pathname === "/create";

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

    // CREATE SAYFASI RENKLERİ (LOŞ, SAKİN PEMBE)
    const createPageColors = {
      gradientStart: "#0a0a0f",
      gradientMid: "#140a14",
      gradientEnd: "#0a0a0f",
      gridColor: "rgba(236, 72, 153, 0.04)",
      dotColor: "rgba(236, 72, 153, 0.05)",
      orbColor1: "rgba(236, 72, 153, 0.04)",
      orbColor2: "rgba(219, 39, 119, 0.03)",
      orbColor3: "rgba(244, 114, 182, 0.03)",
      particleColor: "rgba(236, 72, 153, 0.06)"
    };

    // ANA SAYFA RENKLERİ (MAVİ/MOR)
    const mainPageColors = {
      gradientStart: "#0a0f1a",
      gradientMid: "#0f172a",
      gradientEnd: "#1e1b4b",
      gridColor: "rgba(59, 130, 246, 0.08)",
      dotColor: "rgba(59, 130, 246, 0.1)",
      orbColor1: "rgba(59, 130, 246, 0.12)",
      orbColor2: "rgba(139, 92, 246, 0.08)",
      orbColor3: "rgba(56, 189, 248, 0.06)",
      particleColor: "rgba(59, 130, 246, 0.12)"
    };

    const colors = isCreatePage ? createPageColors : mainPageColors;

    const drawGradient = () => {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, colors.gradientStart);
      gradient.addColorStop(0.3, colors.gradientMid);
      gradient.addColorStop(0.6, colors.gradientEnd);
      gradient.addColorStop(1, colors.gradientStart);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
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
          const opacity = Math.random() * 0.2 + 0.05;
          
          if (isCreatePage) {
            ctx.fillStyle = `rgba(236, 72, 153, ${opacity})`;
          } else {
            ctx.fillStyle = `rgba(59, 130, 246, ${opacity})`;
          }
          
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
          
          if (Math.random() > 0.85) {
            if (isCreatePage) {
              ctx.fillStyle = `rgba(219, 39, 119, ${opacity * 0.6})`;
            } else {
              ctx.fillStyle = `rgba(139, 92, 246, ${opacity * 0.6})`;
            }
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    const drawLightOrbs = () => {
      // Orb 1
      const gradient1 = ctx.createRadialGradient(
        canvas.width * 0.2, canvas.height * 0.3, 0,
        canvas.width * 0.2, canvas.height * 0.3, canvas.width * 0.4
      );
      gradient1.addColorStop(0, colors.orbColor1);
      gradient1.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Orb 2
      const gradient2 = ctx.createRadialGradient(
        canvas.width * 0.8, canvas.height * 0.7, 0,
        canvas.width * 0.8, canvas.height * 0.7, canvas.width * 0.5
      );
      gradient2.addColorStop(0, colors.orbColor2);
      gradient2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Mouse takipli orb
      const gradient3 = ctx.createRadialGradient(
        mouseX, mouseY, 0,
        mouseX, mouseY, 180
      );
      gradient3.addColorStop(0, colors.orbColor3);
      gradient3.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gradient3;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
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
          alpha: Math.random() * 0.15 + 0.05,
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
        if (isCreatePage) {
          ctx.fillStyle = `rgba(236, 72, 153, ${p.alpha})`;
        } else {
          ctx.fillStyle = `rgba(59, 130, 246, ${p.alpha})`;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawHexagons = () => {
      const hexSize = 60;
      const hexWidth = hexSize * Math.sqrt(3);
      const hexHeight = hexSize * 2;
      
      for (let x = -hexSize; x < canvas.width + hexSize; x += hexWidth) {
        for (let y = -hexSize; y < canvas.height + hexSize; y += hexHeight * 0.75) {
          const offset = (Math.floor(x / hexWidth) % 2) * (hexHeight / 2);
          
          ctx.strokeStyle = isCreatePage ? "rgba(236, 72, 153, 0.02)" : "rgba(59, 130, 246, 0.03)";
          ctx.lineWidth = 1;
          
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i * 60) * Math.PI / 180;
            const px = x + Math.cos(angle) * hexSize;
            const py = y + offset + Math.sin(angle) * hexSize;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    let animationId: number;
    const animate = () => {
      drawGradient();
      drawGrid();
      drawHexagons();
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
  }, [isCreatePage]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full -z-20"
        style={{ pointerEvents: "none" }}
      />
      
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
        {isCreatePage ? (
          <>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/4 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-400/3 rounded-full blur-3xl animate-pulse delay-500" />
          </>
        ) : (
          <>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500" />
          </>
        )}
      </div>
    </>
  );
}