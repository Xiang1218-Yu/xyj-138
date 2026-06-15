import React from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Flower2, Plane, Sparkles, Heart, Code, Palette, ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const About: React.FC = () => {
  const { setCursorType } = useAppStore();

  const features = [
    {
      icon: Flower2,
      title: '魔法花园',
      description: '基于贝塞尔曲线的花朵生成算法，每一朵花都独一无二。花瓣绽放动画采用物理模拟，带来自然的生长感。',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Plane,
      title: '飞行器驾驶',
      description: '真实的物理模拟系统，包括推进力、空气阻力、惯性等。平滑的 Lerp 插值带来丝滑的操控体验。',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      icon: Palette,
      title: '视觉设计',
      description: '梦幻渐变配色、玻璃拟态 UI、粒子光效，每一个像素都经过精心打磨，带来极致的视觉享受。',
      gradient: 'from-green-400 to-cyan-400',
    },
    {
      icon: Code,
      title: '技术实现',
      description: 'React + TypeScript + Canvas 2D + requestAnimationFrame，60fps 流畅动画，对象池优化性能。',
      gradient: 'from-orange-400 to-pink-500',
    },
  ];

  return (
    <div className="relative min-h-screen w-full py-24 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8"
          onMouseEnter={() => setCursorType('hover')}
          onMouseLeave={() => setCursorType('default')}
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>

        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            关于奇迹花园
          </h1>
          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto">
            一个关于创造、探索和想象力的互动体验项目
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {features.map((feature, index) => (
            <GlassCard key={index} className="p-6 hover:scale-[1.02] transition-all duration-500">
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}
              >
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3
                className="text-xl font-bold text-white mb-3"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {feature.title}
              </h3>
              <p className="text-white/60 leading-relaxed">
                {feature.description}
              </p>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="p-8 md:p-10 text-center mb-12" glow>
          <Heart className="w-12 h-12 text-pink-400 mx-auto mb-4" />
          <h2
            className="text-2xl md:text-3xl font-bold text-white mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            用心创造每一个像素
          </h2>
          <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
            奇迹花园的灵感来源于对数字艺术和互动体验的热爱。
            我们相信，最简单的操作也能创造出最美妙的奇迹。
            希望这个小小的项目能给你带来片刻的宁静与快乐。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/garden"
              onMouseEnter={() => setCursorType('hover')}
              onMouseLeave={() => setCursorType('default')}
            >
              <Button variant="gradient" size="lg">
                开始创造
              </Button>
            </Link>
            <Link
              to="/flight"
              onMouseEnter={() => setCursorType('hover')}
              onMouseLeave={() => setCursorType('default')}
            >
              <Button variant="primary" size="lg">
                自由飞行
              </Button>
            </Link>
          </div>
        </GlassCard>

        <div className="text-center text-white/40 text-sm">
          <p>Made with ❤️ using React, TypeScript, and Canvas</p>
          <p className="mt-2">© 2024 奇迹花园 · 让想象力自由飞翔</p>
        </div>
      </div>
    </div>
  );
};

export default About;
