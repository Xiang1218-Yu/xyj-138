import React from 'react';
import { FlightSimulator } from '@/components/canvas/FlightSimulator';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';
import { Plane, RotateCcw, Info, Fuel, Gauge, Mountain } from 'lucide-react';

const Flight: React.FC = () => {
  const {
    flight: { aircraft },
    resetFlight,
  } = useAppStore();

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <FlightSimulator />

      <div className="absolute top-24 left-6 z-20">
        <GlassCard className="p-5 w-72" glow>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2
                className="text-xl font-bold text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                飞行器驾驶
              </h2>
              <p className="text-white/50 text-xs">
                高度 {Math.round(aircraft.altitude)}m · 速度 {Math.round(aircraft.speed * 10)}km/h
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-white/70">
                <Fuel className="w-4 h-4" />
                <span>燃料</span>
              </div>
              <span className="text-white font-medium">
                {Math.round(aircraft.fuel)}%
              </span>
            </div>

            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  aircraft.fuel > 30
                    ? 'bg-gradient-to-r from-green-400 to-cyan-400'
                    : 'bg-gradient-to-r from-pink-500 to-yellow-400'
                }`}
                style={{ width: `${aircraft.fuel}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                  <Gauge className="w-3 h-3" />
                  <span>速度</span>
                </div>
                <div className="text-white font-bold text-lg">
                  {Math.round(aircraft.speed * 10)}
                  <span className="text-xs text-white/50 ml-1">km/h</span>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                  <Mountain className="w-3 h-3" />
                  <span>高度</span>
                </div>
                <div className="text-white font-bold text-lg">
                  {Math.round(aircraft.altitude)}
                  <span className="text-xs text-white/50 ml-1">m</span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={resetFlight}
              className="w-full"
            >
              <span className="flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4" />
                重置飞行
              </span>
            </Button>
          </div>
        </GlassCard>
      </div>

      <div className="absolute top-24 right-6 z-20">
        <GlassCard className="p-4 w-64">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-white/70 space-y-1">
              <p>
                <span className="text-white font-medium">操作提示：</span>
              </p>
              <p>• 移动鼠标控制方向</p>
              <p>• 按住左键加速起飞</p>
              <p>• 松开减速，自动回油</p>
              <p>• 燃料耗尽需等待恢复</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Flight;
