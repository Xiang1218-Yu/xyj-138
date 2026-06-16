import React from 'react';
import { PinballGame } from '@/components/canvas/PinballGame';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';
import { CircleDot, RotateCcw, Info, Trophy, Target, Zap } from 'lucide-react';

const Pinball: React.FC = () => {
  const {
    pinball: { score, curvedBoard, launcher },
    resetPinball,
  } = useAppStore();

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <PinballGame />

      <div className="absolute top-24 left-6 z-20">
        <GlassCard className="p-5 w-72" glow>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <CircleDot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2
                className="text-xl font-bold text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                3D弹射跳球
              </h2>
              <p className="text-white/50 text-xs">
                  分数 {score} 分
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-white/70">
                  <Trophy className="w-4 h-4" />
                  <span>当前分数</span>
                </div>
                <span className="text-white font-medium">
                  {score}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                    <Target className="w-3 h-3" />
                    <span>木板角度</span>
                  </div>
                  <div className="text-white font-bold text-lg">
                    {Math.round(curvedBoard.angle * 100)}
                    <span className="text-xs text-white/50 ml-1">°</span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                    <Zap className="w-3 h-3" />
                    <span>蓄力</span>
                  </div>
                  <div className="text-white font-bold text-lg">
                    {Math.round(launcher.chargeProgress)}
                    <span className="text-xs text-white/50 ml-1">%</span>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={resetPinball}
                className="w-full"
              >
                <span className="flex items-center justify-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  重置游戏
                </span>
              </Button>
            </div>
          </GlassCard>
        </div>

        <div className="absolute top-24 right-6 z-20">
          <GlassCard className="p-4 w-64">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-white/70 space-y-1">
                <p>
                  <span className="text-white font-medium">操作提示：</span>
                </p>
                <p>• 按住鼠标左键蓄力</p>
                <p>• 松开鼠标弹射小球</p>
                <p>• 移动鼠标控制木板</p>
                <p>• 弹射时场上小球会爆炸</p>
                <p>• 将球弹入洞中得分</p>
              </div>
            </div>
          </GlassCard>
        </div>
    </div>
  );
};

export default Pinball;
