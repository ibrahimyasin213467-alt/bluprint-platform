"use client";

import { useEffect, useRef } from "react";

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDarkRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dark mode kontrolü
    const checkDarkMode = () => {
      isDarkRef.current = document.documentElement.classList.contains("dark");
    };
    checkDarkMode();
    
    // Dark mode değişimini izle
    const observer = new MutationObserver(() => {
      checkDarkMode();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let particles: { x: number; y: number; radius: number; speed: number; alpha: number }[] = [];
    let mouseX = 0;
    let mouseY = 0;

    const drawGrid = () => {
      const gridSize = 50;
      ctx.strokeStyle = isDarkRef.current ? "rgba(59, 130, 246, 0.08)" : "rgba(59, 130, 246, 0.04)";
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
          ctx.fillStyle = `rgba(59, 130, 246, ${isDarkRef.current ? opacity : opacity * 0.5})`;
          
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
          
          if (Math.random() > 0.7) {
            ctx.fillStyle = `rgba(139, 92, 246, ${isDarkRef.current ? opacity * 0.5 : opacity * 0.3})`;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    const drawGradient = () => {
      if (isDarkRef.current) {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#0a0f1a");
        gradient.addColorStop(0.3, "#0f172a");
        gradient.addColorStop(0.6, "#1e1b4b");
        gradient.addColorStop(1, "#0a0f1a");
        ctx.fillStyle = gradient;
      } else {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#f8fafc");
        gradient.addColorStop(0.3, "#eff6ff");
        gradient.addColorStop(0.6, "#f5f3ff");
        gradient.addColorStop(1, "#f8fafc");
        ctx.fillStyle = gradient;
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawLightOrbs = () => {
      const orbColor = isDarkRef.current ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.08)";
      const orbColor2 = isDarkRef.current ? "rgba(139, 92, 246, 0.12)" : "rgba(139, 92, 246, 0.06)";
      const orbColor3 = isDarkRef.current ? "rgba(56, 189, 248, 0.08)" : "rgba(56, 189, 248, 0.04)";
      
      const gradient1 = ctx.createRadialGradient(
        canvas.width * 0.2, canvas.height * 0.3, 0,
        canvas.width * 0.2, canvas.height * 0.3, canvas.width * 0.4
      );
      gradient1.addColorStop(0, orbColor);
      gradient1.addColorStop(1, "rgba(59, 130, 246, 0)");
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gradient2 = ctx.createRadialGradient(
        canvas.width * 0.8, canvas.height * 0.7, 0,
        canvas.width * 0.8, canvas.height * 0.7, canvas.width * 0.5
      );
      gradient2.addColorStop(0, orbColor2);
      gradient2.addColorStop(1, "rgba(139, 92, 246, 0)");
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gradient3 = ctx.createRadialGradient(
        mouseX, mouseY, 0,
        mouseX, mouseY, 150
      );
      gradient3.addColorStop(0, orbColor3);
      gradient3.addColorStop(1, "rgba(56, 189, 248, 0)");
      ctx.fillStyle = gradient3;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const initParticles = () => {
      const particleCount = Math.min(80, Math.floor(window.innerWidth / 20));
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 1,
          speed: Math.random() * 0.5 + 0.2,
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
        ctx.fillStyle = `rgba(59, 130, 246, ${isDarkRef.current ? p.alpha : p.alpha * 0.6})`;
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
          
          ctx.strokeStyle = isDarkRef.current ? "rgba(59, 130, 246, 0.03)" : "rgba(59, 130, 246, 0.02)";
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
      observer.disconnect();
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full -z-20"
        style={{ pointerEvents: "none" }}
      />
      
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>
    </>
  );
}