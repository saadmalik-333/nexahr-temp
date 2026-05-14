'use client';

import Link from 'next/link';
import { Shield, ClipboardList, CreditCard, ChevronRight, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    let animationId: number;

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${p.opacity})`;
        ctx.fill();
      });

      // Draw connections
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.06 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated particle background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{ pointerEvents: 'none' }}
      />

      {/* Gradient overlays */}
      <div className="gradient-bg absolute inset-0 z-0" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading text-xl font-bold text-text-primary">NexaHR</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/portal/login"
            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Employee Portal
          </Link>
          <Link
            href="/admin/login"
            className="px-5 py-2.5 text-sm border border-border rounded-xl text-text-primary hover:bg-surface transition-all"
          >
            Manager Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-32 md:pt-32 md:pb-40">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary font-medium">AI-Powered HR Management</span>
        </div>

        <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-text-primary max-w-4xl leading-tight animate-slide-up">
          Streamline Your{' '}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Workforce
          </span>{' '}
          Management
        </h1>

        <p className="mt-6 text-lg md:text-xl text-text-secondary max-w-2xl leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
          From hiring to ID cards — NexaHR handles it all. Smart onboarding, real-time attendance, and digital identity management in one powerful platform.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Link href="/register" className="btn-primary flex items-center gap-2 text-base px-8 py-4">
            Employee Registration
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link href="/admin/login" className="btn-secondary flex items-center gap-2 text-base px-8 py-4">
            Manager Login
          </Link>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-8 mt-20 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          {[
            { value: '99.9%', label: 'Uptime' },
            { value: '500+', label: 'Companies' },
            { value: '50K+', label: 'Employees' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-heading font-bold text-text-primary">{stat.value}</div>
              <div className="text-sm text-text-secondary mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 md:px-12 pb-32">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center text-text-primary mb-4">
            Everything You Need
          </h2>
          <p className="text-text-secondary text-center max-w-xl mx-auto mb-16">
            A complete HR solution built for modern teams
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Secure Admin Portal',
                description:
                  'Role-based access control with encrypted authentication. Manage your entire workforce from a single, secure dashboard.',
                gradient: 'from-blue-500/20 to-cyan-500/20',
              },
              {
                icon: ClipboardList,
                title: 'Smart Employee Onboarding',
                description:
                  'AI-powered application review with Gemini integration. Automated scoring, summaries, and streamlined approval workflows.',
                gradient: 'from-purple-500/20 to-pink-500/20',
              },
              {
                icon: CreditCard,
                title: 'Instant Digital ID Cards',
                description:
                  'Generate professional ID cards with QR codes instantly. Employees can download their verified identity cards anytime.',
                gradient: 'from-emerald-500/20 to-teal-500/20',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="glass-card-hover p-8 group"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}
                >
                  <feature.icon className="w-7 h-7 text-text-primary" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-text-secondary leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading text-lg font-bold text-text-primary">NexaHR</span>
          </div>
          <p className="text-sm text-text-secondary">
            © {new Date().getFullYear()} NexaHR. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
