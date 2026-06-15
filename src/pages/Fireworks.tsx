import React from 'react';
import { FireworksCanvas } from '@/components/canvas/FireworksCanvas';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { useAppStore } from '@/store/useAppStore';
import { FireworkType, FIREWORK_TYPE_LABELS, FIREWORK_COLOR_PRESETS, FIREWORK_GRADIENT_PRESETS } from '@/types/fireworks';
import {
  Trash2,
  Sparkles,
  Info,
  Play,
  Pause,
  Palette,
  Eye,
  EyeOff,
  Settings,
  Zap,
  Droplets,
} from 'lucide-react';

const FireworksPage: React.FC = () => {
  const {
    fireworks: {
      fireworkType,
      fireworkColor,
      colorMode,
      gradientColors,
      autoLaunch,
      autoLaunchInterval,
      launchPower,
      particleCount,
      gravity,
      showLaunchPreview,
    },
    setFireworkType,
    setFireworkColor,
    setFireworkColorMode,
    setFireworkGradientColors,
    setFireworkAutoLaunch,
    setFireworkAutoLaunchInterval,
    setFireworkLaunchPower,
    setFireworkParticleCount,
    setFireworkGravity,
    setFireworkShowLaunchPreview,
    clearAllFireworks,
    resetFireworks,
  } = useAppStore();

  const fireworkTypes: { id: FireworkType; label: string; desc: string; emoji: string }[] = Object.entries(
    FIREWORK_TYPE_LABELS
  ).map(([id, data]) => ({
    id: id as FireworkType,
    label: data.name,
    desc: data.desc,
    emoji: data.emoji,
  }));

  const colorModes = [
    { id: 'solid' as const, label: '纯色' },
    { id: 'gradient' as const, label: '渐变' },
    { id: 'rainbow' as const, label: '彩虹' },
  ];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050514]">
      <FireworksCanvas />

      <div className="absolute top-24 left-6 z-20 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 custom-scrollbar">
        <GlassCard className="p-5 w-80" glow>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2
                className="text-xl font-bold text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                绚烂烟花
              </h2>
              <p className="text-white/50 text-xs">
                点亮夜空，绽放属于你的奇迹
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <span className="text-white/70 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                烟花类型
              </span>
              <div className="grid grid-cols-3 gap-2">
                {fireworkTypes.map((type) => {
                  const active = fireworkType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setFireworkType(type.id)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-300 ${
                        active
                          ? 'bg-gradient-to-br from-orange-500/30 to-pink-500/30 border border-orange-400/50 shadow-lg shadow-orange-500/20'
                          : 'bg-white/5 hover:bg-white/10 border border-transparent'
                      }`}
                      title={type.desc}
                    >
                      <span className="text-2xl">{type.emoji}</span>
                      <span className={`text-xs font-medium ${active ? 'text-orange-300' : 'text-white/70'}`}>
                        {type.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="text-xs text-white/40 text-center mt-1 px-2 py-2 bg-white/5 rounded-lg">
                {FIREWORK_TYPE_LABELS[fireworkType].desc}
              </div>
            </div>

            <Slider
              value={particleCount}
              onChange={setFireworkParticleCount}
              min={30}
              max={200}
              step={10}
              label="粒子数量"
              unit=" 颗"
            />

            <Slider
              value={gravity}
              onChange={setFireworkGravity}
              min={0.05}
              max={0.4}
              step={0.01}
              label="重力影响"
              unit=""
            />

            <div className="space-y-3 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  发射力度
                </span>
                <span className="text-white/50 text-xs">{Math.round(launchPower)}%</span>
              </div>
              <Slider
                value={launchPower}
                onChange={setFireworkLaunchPower}
                min={20}
                max={100}
                step={5}
                label=""
                unit=""
              />
            </div>

            <div className="border-t border-white/10 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  颜色模式
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {colorModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setFireworkColorMode(mode.id)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 ${
                      colorMode === mode.id
                        ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {colorMode === 'solid' && (
                <div className="space-y-2">
                  <span className="text-white/50 text-xs">选择颜色</span>
                  <div className="flex gap-2 flex-wrap">
                    {FIREWORK_COLOR_PRESETS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setFireworkColor(color)}
                        className={`w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 ${
                          fireworkColor === color
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110 shadow-lg'
                            : ''
                        }`}
                        style={{
                          backgroundColor: color,
                          boxShadow:
                            fireworkColor === color
                              ? `0 0 16px ${color}80`
                              : `0 2px 8px ${color}30`,
                          border:
                            color === '#ffffff' ? '1px solid rgba(255,255,255,0.3)' : 'none',
                        }}
                      />
                    ))}
                    <label className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all">
                      <input
                        type="color"
                        value={fireworkColor}
                        onChange={(e) => setFireworkColor(e.target.value)}
                        className="absolute opacity-0 w-0 h-0"
                      />
                      <Droplets className="w-4 h-4 text-white/60" />
                    </label>
                  </div>
                </div>
              )}

              {colorMode === 'gradient' && (
                <div className="space-y-3">
                  <span className="text-white/50 text-xs">预设渐变</span>
                  <div className="grid grid-cols-4 gap-2">
                    {FIREWORK_GRADIENT_PRESETS.map((preset) => {
                      const match =
                        gradientColors.color1 === preset.color1 &&
                        gradientColors.color2 === preset.color2;
                      return (
                        <button
                          key={preset.name}
                          onClick={() =>
                            setFireworkGradientColors({
                              color1: preset.color1,
                              color2: preset.color2,
                            })
                          }
                          className={`h-10 rounded-lg transition-all duration-200 relative overflow-hidden ${
                            match ? 'ring-2 ring-white scale-105' : 'hover:scale-105'
                          }`}
                          style={{
                            background: `linear-gradient(135deg, ${preset.color1}, ${preset.color2})`,
                          }}
                          title={preset.name}
                        />
                      );
                    })}
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="flex-1 space-y-1">
                      <span className="text-white/40 text-xs">起始色</span>
                      <input
                        type="color"
                        value={gradientColors.color1}
                        onChange={(e) =>
                          setFireworkGradientColors({
                            ...gradientColors,
                            color1: e.target.value,
                          })
                        }
                        className="w-full h-8 rounded-lg cursor-pointer bg-transparent border border-white/20"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <span className="text-white/40 text-xs">结束色</span>
                      <input
                        type="color"
                        value={gradientColors.color2}
                        onChange={(e) =>
                          setFireworkGradientColors({
                            ...gradientColors,
                            color2: e.target.value,
                          })
                        }
                        className="w-full h-8 rounded-lg cursor-pointer bg-transparent border border-white/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {colorMode === 'rainbow' && (
                <div
                  className="h-12 rounded-xl relative overflow-hidden"
                  style={{
                    background:
                      'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3, #ff0000)',
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-sm font-medium drop-shadow-lg">
                      🌈 绚烂七色
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="danger"
                onClick={() => {
                  clearAllFireworks();
                }}
                className="flex-1"
              >
                <span className="flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  清空
                </span>
              </Button>
              <Button
                variant="secondary"
                onClick={resetFireworks}
                className="flex-1"
              >
                <span className="flex items-center justify-center gap-2">
                  <Settings className="w-4 h-4" />
                  重置
                </span>
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="absolute top-24 right-6 z-20 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 custom-scrollbar">
        <GlassCard className="p-4 w-64">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm flex items-center gap-2">
                <Play className="w-4 h-4" />
                自动发射
              </span>
              <button
                onClick={() => setFireworkAutoLaunch(!autoLaunch)}
                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${
                  autoLaunch
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500'
                    : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
                    autoLaunch ? 'left-[26px]' : 'left-0.5'
                  }`}
                >
                  {autoLaunch ? (
                    <Play className="w-2.5 h-2.5 text-orange-600" />
                  ) : (
                    <Pause className="w-2.5 h-2.5 text-gray-500" />
                  )}
                </div>
              </button>
            </div>

            {autoLaunch && (
              <Slider
                value={autoLaunchInterval}
                onChange={setFireworkAutoLaunchInterval}
                min={300}
                max={3000}
                step={100}
                label="发射间隔"
                unit=" ms"
              />
            )}

            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm flex items-center gap-2">
                {showLaunchPreview ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
                显示瞄准线
              </span>
              <button
                onClick={() => setFireworkShowLaunchPreview(!showLaunchPreview)}
                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${
                  showLaunchPreview
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500'
                    : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${
                    showLaunchPreview ? 'left-[26px]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 w-64">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-white/70 space-y-1">
              <p>
                <span className="text-white font-medium">操作指南：</span>
              </p>
              <p>• <span className="text-orange-400">按住鼠标</span> 选择发射起点</p>
              <p>• <span className="text-orange-400">拖动鼠标</span> 瞄准目标位置</p>
              <p>• 拖动距离越远，发射力度越大</p>
              <p>• <span className="text-orange-400">松开鼠标</span> 立即发射</p>
              <p>• 开启自动发射欣赏烟花秀</p>
              <p className="pt-2 text-white/50 text-xs">
                💡 提示：爱心、五角星等图案建议使用<span className="text-pink-400"> 粉色 </span>系颜色
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 w-64">
          <div className="space-y-3">
            <span className="text-white/70 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              当前配置
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-white/40">类型</div>
                <div className="text-white font-medium">
                  {FIREWORK_TYPE_LABELS[fireworkType].emoji} {FIREWORK_TYPE_LABELS[fireworkType].name}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-white/40">模式</div>
                <div className="text-white font-medium">
                  {colorMode === 'solid' ? '纯色' : colorMode === 'gradient' ? '渐变' : '彩虹'}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-white/40">粒子</div>
                <div className="text-white font-medium">{particleCount} 颗</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-white/40">力度</div>
                <div className="text-white font-medium">{Math.round(launchPower)}%</div>
              </div>
            </div>
            {colorMode === 'solid' && (
              <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: fireworkColor, boxShadow: `0 0 10px ${fireworkColor}` }}
                />
                <span className="text-white/70 text-xs">当前颜色</span>
              </div>
            )}
            {colorMode === 'gradient' && (
              <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                <div
                  className="w-10 h-6 rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, ${gradientColors.color1}, ${gradientColors.color2})`,
                    boxShadow: `0 0 10px ${gradientColors.color1}80`,
                  }}
                />
                <span className="text-white/70 text-xs">渐变配色</span>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default FireworksPage;
