import React from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Home, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const NotFound: React.FC = () => {
  const { setCursorType } = useAppStore();

  return (
    <div className="relative w-full h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]" />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="relative z-10 text-center">
        <GlassCard className="p-10 md:p-16 max-w-lg" glow>
          <div className="flex justify-center mb-6">
            <div className="relative">
              <span
                className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                404
              </span>
              <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-bounce" />
            </div>
          </div>

          <h1
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            迷失在星空中
          </h1>
          <p className="text-white/60 text-lg mb-8">
            你寻找的页面似乎飘向了宇宙的另一端...
            <br />
            不过别担心，这里有很多美丽的事物等着你去发现！
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              onMouseEnter={() => setCursorType('hover')}
              onMouseLeave={() => setCursorType('default')}
              className="w-full sm:w-auto"
            >
              <Button variant="gradient" size="lg" className="w-full">
                <span className="flex items-center justify-center gap-2">
                  <Home className="w-5 h-5" />
                  返回首页
                </span>
              </Button>
            </Link>
            <Link
              to="/garden"
              onMouseEnter={() => setCursorType('hover')}
              onMouseLeave={() => setCursorType('default')}
              className="w-full sm:w-auto"
            >
              <Button variant="primary" size="lg" className="w-full">
                探索花园
              </Button>
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default NotFound;
