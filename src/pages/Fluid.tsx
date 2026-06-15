import React from 'react';
import { FluidPainting } from '@/components/canvas/FluidPainting';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { Slider } from '@/components/ui/Slider';
import { useAppStore } from '@/store/useAppStore';
import { Trash2, Droplets, Wind, Shuffle, Palette, Info } from 'lucide-react';

const Fluid: React.FC = () => {
  const {
    fluid: {
      selectedColor,
      viscosity,
      flowRate,
      brushSize,
      blowStrength,
      tool,
      particles,
      backgroundColor,
    },
    setFluidSelectedColor,
    setFluidViscosity,
    setFluidFlowRate,
    setFluidBrushSize,
    setFluidBlowStrength,
    setFluidTool,
    clearFluidParticles,
    resetFluid,
  } = useAppStore();

  const tools = [
    { id: 'pour', label: '倾倒', icon: Droplets },
    { id: 'blow', label: '吹气', icon: Wind },
    { id: 'mix', label: '混合', icon: Shuffle },
  ] as const;

  const bgColors = [
    { value: '#1a1a2e', label: '深蓝' },
    { value: '#0f0f23', label: '深黑' },
    { value: '#2d1b4e', label: '深紫' },
    { value: '#1a2f1a', label: '深绿' },
    { value: '#2e1a1a', label: '深红' },
    { value: '#ffffff', label: '白色' },
  ];

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div 
        className="absolute inset-0 transition-colors duration-500"
        style={{ backgroundColor }}
      />
      
      <FluidPainting />

      <div className="absolute top-24 left-6 z-20">
        <GlassCard className="p-5 w-80" glow>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2
                className="text-xl font-bold text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                流体画创作
              </h2>
              <p className="text-white/50 text-xs">
                颜料粒子 {particles.length} 个
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-white/70 text-sm">创作工具</span>
              <div className="grid grid-cols-3 gap-2">
                {tools.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setFluidTool(t.id)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-300 ${
                        tool === t.id
                          ? 'bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                          : 'bg-white/5 hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${
                        tool === t.id ? 'text-cyan-400' : 'text-white/70'
                      }`} />
                      <span className={`text-xs ${
                        tool === t.id ? 'text-cyan-400 font-medium' : 'text-white/70'
                      }`}>
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <ColorPicker
              value={selectedColor}
              onChange={setFluidSelectedColor}
              palette="fluid"
              className="pt-2"
            />

            <div className="space-y-2">
              <span className="text-white/70 text-sm">画布背景</span>
              <div className="flex gap-2 flex-wrap">
                {bgColors.map((bg) => (
                  <button
                    key={bg.value}
                    onClick={() => {
                      if (bg.value === '#ffffff') {
                        resetFluid();
                      }
                      clearFluidParticles();
                    }}
                    className={`w-8 h-8 rounded-lg transition-all duration-200 hover:scale-110 ${
                      backgroundColor === bg.value
                        ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-transparent scale-110'
                        : ''
                    }`}
                    style={{
                      backgroundColor: bg.value,
                      border: bg.value === '#ffffff' ? '1px solid rgba(255,255,255,0.3)' : 'none',
                    }}
                    title={bg.label}
                  />
                ))}
              </div>
            </div>

            <Slider
              value={brushSize}
              onChange={setFluidBrushSize}
              min={15}
              max={80}
              label="笔刷大小"
              unit="px"
            />

            <Slider
              value={viscosity}
              onChange={setFluidViscosity}
              min={10}
              max={100}
              label="颜料粘稠度"
              unit="%"
            />

            {tool === 'pour' && (
              <Slider
                value={flowRate}
                onChange={setFluidFlowRate}
                min={10}
                max={100}
                label="颜料流速"
                unit="%"
              />
            )}

            {tool === 'blow' && (
              <Slider
                value={blowStrength}
                onChange={setFluidBlowStrength}
                min={10}
                max={100}
                label="吹气强度"
                unit="%"
              />
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="primary"
                onClick={clearFluidParticles}
                className="flex-1"
              >
                <span className="flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  清除画布
                </span>
              </Button>
            </div>
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
              <p>• <span className="text-cyan-400">倾倒</span>：按住鼠标释放颜料</p>
              <p>• <span className="text-cyan-400">吹气</span>：推动颜料流动扩散</p>
              <p>• <span className="text-cyan-400">混合</span>：搅拌融合多种颜色</p>
              <p>• 调高粘稠度让颜料更厚重</p>
              <p>• 调低粘稠度让颜料更流畅</p>
              <p>• 不同颜色接触会自然混合</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 w-64 mt-4">
          <div className="text-sm text-white/70 space-y-2">
            <p className="text-white font-medium flex items-center gap-2">
              <Palette className="w-4 h-4 text-pink-400" />
              创作技巧
            </p>
            <p className="text-xs">
              先倾倒多种颜色，再用混合工具搅拌，最后用吹气工具
              创造自然流动效果，可以获得惊艳的流体艺术作品！
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Fluid;
