import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flower2, Plane, Palette, Sparkles, ArrowRight, Flame, CircleDot } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';
import { randomRange } from '@/utils/math';
import { withAlpha } from '@/utils/colors';

interface FloatingParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  phase: number;
}

const Home: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<FloatingParticle[]>([]);
  const animationRef = useRef<number>();
  const [titleVisible, setTitleVisible] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const { setCursorType } = useAppStore();

  useEffect(() => {
    const particles: FloatingParticle[] = [];
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: randomRange(-10, 10),
        vy: randomRange(-15, 5),
        size: randomRange(2, 8),
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: randomRange(0.3, 0.7),
        phase: Math.random() * Math.PI * 2,
      });
    }
    particlesRef.current = particles;

    const titleTimer = setTimeout(() => setTitleVisible(true), 200);
    const subtitleTimer = setTimeout(() => setSubtitleVisible(true), 600);
    const cardsTimer = setTimeout(() => setCardsVisible(true), 1000);

    return () => {
      clearTimeout(titleTimer);
      clearTimeout(subtitleTimer);
      clearTimeout(cardsTimer);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let lastTime = performance.now();

    const animate = (time: number) => {
      const deltaTime = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0f0c29');
      gradient.addColorStop(0.5, '#302b63');
      gradient.addColorStop(1, '#24243e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const glowGradient = ctx.createRadialGradient(
        canvas.width * 0.5,
        canvas.height * 0.3,
        0,
        canvas.width * 0.5,
        canvas.height * 0.3,
        canvas.width * 0.6
      );
      glowGradient.addColorStop(0, 'rgba(102, 126, 234, 0.15)');
      glowGradient.addColorStop(0.5, 'rgba(240, 147, 251, 0.08)');
      glowGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const p of particlesRef.current) {
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;

        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.y < -20) p.y = canvas.height + 20;
        if (p.y > canvas.height + 20) p.y = -20;

        const floatY = Math.sin(time * 0.001 + p.phase) * 10;
        const drawY = p.y + floatY;
        const opacity = p.opacity * (0.5 + 0.5 * Math.sin(time * 0.002 + p.phase));

        const particleGradient = ctx.createRadialGradient(
          p.x,
          drawY,
          0,
          p.x,
          drawY,
          p.size * 2
        );
        particleGradient.addColorStop(0, withAlpha(p.color, opacity));
        particleGradient.addColorStop(0.5, withAlpha(p.color, opacity * 0.5));
        particleGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = particleGradient;
        ctx.beginPath();
        ctx.arc(p.x, drawY, p.size * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = withAlpha('#ffffff', opacity * 0.8);
        ctx.beginPath();
        ctx.arc(p.x, drawY, p.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const experiences = [
    {
      title: '魔法花园',
      description: '按住鼠标并拖动，在星空下绽放绚丽的魔法花朵',
      icon: Flower2,
      path: '/garden',
      gradient: 'from-purple-500 to-pink-500',
      glow: 'rgba(102, 126, 234, 0.4)',
    },
    {
      title: '绚烂烟花',
      description: '拖拽瞄准发射烟花，9种图案绽放夜空，开启自动模式欣赏烟花秀',
      icon: Flame,
      path: '/fireworks',
      gradient: 'from-orange-500 to-rose-500',
      glow: 'rgba(255, 107, 107, 0.4)',
    },
    {
      title: '流体画创作',
      description: '倾倒、吹气、混合多种虚拟颜料，创造独特的流体艺术作品',
      icon: Palette,
      path: '/fluid',
      gradient: 'from-cyan-500 to-teal-500',
      glow: 'rgba(0, 210, 211, 0.4)',
    },
    {
      title: '几何万花筒',
      description: '绘制线条自动镜像复制，创造绚丽多彩的万花筒图案',
      icon: Sparkles,
      path: '/kaleidoscope',
      gradient: 'from-fuchsia-500 to-orange-500',
      glow: 'rgba(232, 121, 249, 0.4)',
    },
    {
      title: '飞行器驾驶',
      description: '移动鼠标控制方向，按住加速，在云海中自由翱翔',
      icon: Plane,
      path: '/flight',
      gradient: 'from-blue-500 to-indigo-500',
      glow: 'rgba(79, 172, 254, 0.4)',
    },
    {
      title: '3D弹射跳球',
      description: '按住蓄力弹射小球，转动弧形木板调整方向，将球打入洞中得分',
      icon: CircleDot,
      path: '/pinball',
      gradient: 'from-orange-500 to-red-500',
      glow: 'rgba(255, 107, 107, 0.4)',
    },
  ];

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <div
          className={`text-center transition-all duration-1000 ease-out ${
            titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles
              className="w-10 h-10 text-purple-400 animate-pulse"
              style={{ filter: 'drop-shadow(0 0 10px rgba(102, 126, 234, 0.8))' }}
            />
            <h1
              className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              奇迹花园
            </h1>
            <Sparkles
              className="w-10 h-10 text-pink-400 animate-pulse"
              style={{ filter: 'drop-shadow(0 0 10px rgba(240, 147, 251, 0.8))' }}
            />
          </div>
        </div>

        <p
          className={`text-white/60 text-lg md:text-xl max-w-2xl text-center mb-12 transition-all duration-1000 delay-300 ease-out ${
            subtitleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          在数字世界中释放你的创造力，用最简单的操作创造最美妙的奇迹
        </p>

        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 max-w-7xl w-full transition-all duration-1000 delay-500 ease-out ${
            cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {experiences.map((exp) => (
            <Link
              key={exp.path}
              to={exp.path}
              onMouseEnter={() => setCursorType('hover')}
              onMouseLeave={() => setCursorType('default')}
              className="block group"
            >
              <GlassCard
                className="p-6 md:p-8 h-full hover:scale-105 transition-all duration-500 cursor-pointer"
                glow
                style={{
                  boxShadow: `0 0 40px ${exp.glow}`,
                }}
              >
                <div className="flex flex-col h-full">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${exp.gradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                    style={{
                      boxShadow: `0 0 30px ${exp.glow}`,
                    }}
                  >
                    <exp.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3
                    className="text-2xl md:text-3xl font-bold text-white mb-3"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {exp.title}
                  </h3>

                  <p className="text-white/60 text-base mb-6 flex-grow">
                    {exp.description}
                  </p>

                  <Button variant="gradient" className="w-full group">
                    <span className="flex items-center justify-center gap-2">
                      开始体验
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>

        <div
          className={`mt-12 text-white/40 text-sm transition-all duration-1000 delay-1000 ease-out ${
            cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <Link
            to="/about"
            className="hover:text-white/70 transition-colors"
            onMouseEnter={() => setCursorType('hover')}
            onMouseLeave={() => setCursorType('default')}
          >
            了解更多关于这个项目 →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
