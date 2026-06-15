import React from 'react';
import { FlowerGarden } from '@/components/canvas/FlowerGarden';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { Slider } from '@/components/ui/Slider';
import { useAppStore } from '@/store/useAppStore';
import { Trash2, Flower2, Info } from 'lucide-react';

const Garden: React.FC = () => {
  const {
    garden: { selectedColor, flowerSize, flowers, isDrawing },
    setSelectedColor,
    setFlowerSize,
    clearFlowers,
  } = useAppStore();

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <FlowerGarden />

      <div className="absolute top-24 left-6 z-20">
        <GlassCard className="p-5 w-72" glow>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Flower2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2
                className="text-xl font-bold text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                魔法花园
              </h2>
              <p className="text-white/50 text-xs">已创造 {flowers.length} 朵花</p>
            </div>
          </div>

          <div className="space-y-5">
            <ColorPicker value={selectedColor} onChange={setSelectedColor} />

            <Slider
              value={flowerSize}
              onChange={setFlowerSize}
              min={30}
              max={120}
              label="花朵大小"
              unit="px"
            />

            <Button
              variant="primary"
              onClick={clearFlowers}
              className="w-full"
            >
              <span className="flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" />
                清除花园
              </span>
            </Button>
          </div>
        </GlassCard>
      </div>

      <div className="absolute top-24 right-6 z-20">
        <GlassCard className="p-4 w-64">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-white/70 space-y-1">
              <p>
                <span className="text-white font-medium">操作提示：</span>
              </p>
              <p>• 按住鼠标左键并拖动</p>
              <p>• 移动速度越快，花朵越大</p>
              <p>• 松开鼠标会有惊喜效果</p>
              <p>• 可选择不同颜色</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Garden;
