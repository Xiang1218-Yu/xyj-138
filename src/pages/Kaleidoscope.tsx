import React from 'react';
import { Kaleidoscope } from '@/components/canvas/Kaleidoscope';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { useAppStore } from '@/store/useAppStore';
import { ColorMode, SymmetryMode } from '@/types/kaleidoscope';
import {
  Trash2,
  Undo2,
  Sparkles,
  Info,
  RotateCw,
  Grid3X3,
  Palette,
  CircleDot,
  Layers,
  Eye,
  EyeOff,
  Play,
  Pause,
} from 'lucide-react';

const KaleidoscopePage: React.FC = () => {
  const {
    kaleidoscope: {
      symmetryAxes,
      symmetryMode,
      brushSize,
      strokeColor,
      strokeColorMode,
      strokeGradientColors,
      backgroundColor,
      backgroundColorMode,
      backgroundGradientColors,
      showGuides,
      strokes,
      animateRotation,
      rotationSpeed,
    },
    setKaleidoscopeSymmetryAxes,
    setKaleidoscopeSymmetryMode,
    setKaleidoscopeBrushSize,
    setKaleidoscopeStrokeColor,
    setKaleidoscopeStrokeColorMode,
    setKaleidoscopeStrokeGradientColors,
    setKaleidoscopeBackgroundColor,
    setKaleidoscopeBackgroundColorMode,
    setKaleidoscopeBackgroundGradientColors,
    setKaleidoscopeShowGuides,
    setKaleidoscopeAnimateRotation,
    setKaleidoscopeRotationSpeed,
    clearKaleidoscopeStrokes,
    undoKaleidoscopeStroke,
    resetKaleidoscope,
  } = useAppStore();

  const symmetryModes: { id: SymmetryMode; label: string; icon: React.ElementType; desc: string }[] = [
    { id: 'mirror', label: '镜像对称', icon: Grid3X3, desc: '沿每个对称轴镜像复制' },
    { id: 'rotate', label: '旋转复制', icon: RotateCw, desc: '绕中心旋转复制图案' },
    { id: 'mirrorRotate', label: '镜像+旋转', icon: Sparkles, desc: '结合镜像和旋转效果' },
  ];

  const colorModes: { id: ColorMode; label: string }[] = [
    { id: 'solid', label: '纯色' },
    { id: 'gradient', label: '渐变' },
    { id: 'rainbow', label: '彩虹' },
  ];

  const strokeColors = [
    '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff',
    '#5f27cd', '#00d2d3', '#1dd1a1', '#ff9f43', '#ee5a24',
    '#ffffff', '#000000', '#f368e0', '#00cec9', '#fd79a8',
  ];

  const bgColors = [
    { value: '#0f0f23', label: '深黑' },
    { value: '#1a1a2e', label: '深蓝' },
    { value: '#2d1b4e', label: '深紫' },
    { value: '#1a2f1a', label: '深绿' },
    { value: '#2e1a1a', label: '深红' },
    { value: '#0a2540', label: '海蓝' },
    { value: '#ffffff', label: '纯白' },
    { value: '#f5f5f0', label: '米白' },
  ];

  const bgGradientPresets = [
    { c1: '#1a1a2e', c2: '#16213e', name: '深海' },
    { c1: '#2d1b4e', c2: '#1a1a2e', name: '紫夜' },
    { c1: '#0f3460', c2: '#16213e', name: '宇宙' },
    { c1: '#434343', c2: '#000000', name: '石墨' },
    { c1: '#134e5e', c2: '#71b280', name: '森林' },
    { c1: '#614385', c2: '#516395', name: '晨雾' },
  ];

  const strokeGradientPresets = [
    { c1: '#ff6b6b', c2: '#feca57', name: '日落' },
    { c1: '#48dbfb', c2: '#ff9ff3', name: '梦幻' },
    { c1: '#54a0ff', c2: '#5f27cd', name: '星空' },
    { c1: '#00d2d3', c2: '#1dd1a1', name: '翡翠' },
    { c1: '#ff9f43', c2: '#ee5a24', name: '火焰' },
    { c1: '#f368e0', c2: '#ff6b6b', name: '樱花' },
  ];

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Kaleidoscope />

      <div className="absolute top-24 left-6 z-20 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 custom-scrollbar">
        <GlassCard className="p-5 w-80" glow>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2
                className="text-xl font-bold text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                几何万花筒
              </h2>
              <p className="text-white/50 text-xs">
                已绘制 {strokes.length} 笔画
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <span className="text-white/70 text-sm flex items-center gap-2">
                <CircleDot className="w-4 h-4" />
                对称轴数量
              </span>
              <Slider
                value={symmetryAxes}
                onChange={setKaleidoscopeSymmetryAxes}
                min={2}
                max={24}
                step={1}
                label=""
                unit=" 轴"
              />
              <div className="flex justify-between text-xs text-white/40 px-1">
                <span>2</span>
                <span>8</span>
                <span>16</span>
                <span>24</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-white/70 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4" />
                对称模式
              </span>
              <div className="space-y-2">
                {symmetryModes.map((mode) => {
                  const Icon = mode.icon;
                  const active = symmetryMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setKaleidoscopeSymmetryMode(mode.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 text-left ${
                        active
                          ? 'bg-gradient-to-r from-fuchsia-500/30 to-orange-500/30 border border-fuchsia-400/50 shadow-lg shadow-fuchsia-500/20'
                          : 'bg-white/5 hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        active ? 'bg-fuchsia-500/40' : 'bg-white/10'
                      }`}>
                        <Icon className={`w-4 h-4 ${active ? 'text-fuchsia-300' : 'text-white/60'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${active ? 'text-fuchsia-300' : 'text-white/80'}`}>
                          {mode.label}
                        </div>
                        <div className="text-xs text-white/50 truncate">{mode.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <Slider
              value={brushSize}
              onChange={setKaleidoscopeBrushSize}
              min={1}
              max={30}
              label="画笔粗细"
              unit="px"
            />

            <div className="border-t border-white/10 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  画笔颜色模式
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {colorModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setKaleidoscopeStrokeColorMode(mode.id)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 ${
                      strokeColorMode === mode.id
                        ? 'bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white shadow-lg shadow-fuchsia-500/30'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {strokeColorMode === 'solid' && (
                <div className="space-y-2">
                  <span className="text-white/50 text-xs">选择纯色</span>
                  <div className="flex gap-2 flex-wrap">
                    {strokeColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setKaleidoscopeStrokeColor(color)}
                        className={`w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 ${
                          strokeColor === color
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110 shadow-lg'
                            : ''
                        }`}
                        style={{
                          backgroundColor: color,
                          boxShadow:
                            strokeColor === color
                              ? `0 0 16px ${color}80`
                              : `0 2px 8px ${color}30`,
                          border: color === '#ffffff' ? '1px solid rgba(255,255,255,0.3)' : 'none',
                        }}
                        aria-label={`选择颜色 ${color}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {strokeColorMode === 'gradient' && (
                <div className="space-y-3">
                  <span className="text-white/50 text-xs">预设渐变</span>
                  <div className="grid grid-cols-3 gap-2">
                    {strokeGradientPresets.map((preset) => {
                      const match =
                        strokeGradientColors.color1 === preset.c1 &&
                        strokeGradientColors.color2 === preset.c2;
                      return (
                        <button
                          key={preset.name}
                          onClick={() =>
                            setKaleidoscopeStrokeGradientColors({
                              color1: preset.c1,
                              color2: preset.c2,
                            })
                          }
                          className={`h-10 rounded-lg transition-all duration-200 relative overflow-hidden ${
                            match ? 'ring-2 ring-white scale-105' : 'hover:scale-105'
                          }`}
                          style={{
                            background: `linear-gradient(135deg, ${preset.c1}, ${preset.c2})`,
                          }}
                        >
                          <span className="absolute inset-0 flex items-center justify-center text-xs text-white/90 font-medium drop-shadow">
                            {preset.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="flex-1 space-y-1">
                      <span className="text-white/40 text-xs">起始色</span>
                      <input
                        type="color"
                        value={strokeGradientColors.color1}
                        onChange={(e) =>
                          setKaleidoscopeStrokeGradientColors({
                            ...strokeGradientColors,
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
                        value={strokeGradientColors.color2}
                        onChange={(e) =>
                          setKaleidoscopeStrokeGradientColors({
                            ...strokeGradientColors,
                            color2: e.target.value,
                          })
                        }
                        className="w-full h-8 rounded-lg cursor-pointer bg-transparent border border-white/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {strokeColorMode === 'rainbow' && (
                <div
                  className="h-12 rounded-xl"
                  style={{
                    background:
                      'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)',
                  }}
                />
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="primary"
                onClick={undoKaleidoscopeStroke}
                disabled={strokes.length === 0}
                className="flex-1"
              >
                <span className="flex items-center justify-center gap-2">
                  <Undo2 className="w-4 h-4" />
                  撤销
                </span>
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  clearKaleidoscopeStrokes();
                }}
                className="flex-1"
              >
                <span className="flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  清空
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
                <RotateCw className="w-4 h-4" />
                自动旋转
              </span>
              <button
                onClick={() => setKaleidoscopeAnimateRotation(!animateRotation)}
                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${
                  animateRotation ? 'bg-gradient-to-r from-fuchsia-500 to-orange-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
                    animateRotation ? 'left-[26px]' : 'left-0.5'
                  }`}
                >
                  {animateRotation ? (
                    <Play className="w-2.5 h-2.5 text-fuchsia-600" />
                  ) : (
                    <Pause className="w-2.5 h-2.5 text-gray-500" />
                  )}
                </div>
              </button>
            </div>

            {animateRotation && (
              <Slider
                value={rotationSpeed}
                onChange={setKaleidoscopeRotationSpeed}
                min={0.1}
                max={3}
                step={0.1}
                label="旋转速度"
              />
            )}

            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm flex items-center gap-2">
                {showGuides ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                显示对称轴
              </span>
              <button
                onClick={() => setKaleidoscopeShowGuides(!showGuides)}
                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${
                  showGuides ? 'bg-gradient-to-r from-fuchsia-500 to-orange-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${
                    showGuides ? 'left-[26px]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 w-64">
          <div className="space-y-4">
            <span className="text-white/70 text-sm flex items-center gap-2">
              <Palette className="w-4 h-4" />
              背景设置
            </span>

            <div className="grid grid-cols-3 gap-2">
              {colorModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setKaleidoscopeBackgroundColorMode(mode.id)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 ${
                    backgroundColorMode === mode.id
                      ? 'bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white shadow-lg shadow-fuchsia-500/30'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {backgroundColorMode === 'solid' && (
              <div className="space-y-2">
                <span className="text-white/50 text-xs">背景色</span>
                <div className="flex gap-2 flex-wrap">
                  {bgColors.map((bg) => (
                    <button
                      key={bg.value}
                      onClick={() => setKaleidoscopeBackgroundColor(bg.value)}
                      className={`w-8 h-8 rounded-lg transition-all duration-200 hover:scale-110 ${
                        backgroundColor === bg.value
                          ? 'ring-2 ring-fuchsia-400 scale-110'
                          : ''
                      }`}
                      style={{
                        backgroundColor: bg.value,
                        border: bg.value === '#ffffff' || bg.value === '#f5f5f0'
                          ? '1px solid rgba(255,255,255,0.3)'
                          : 'none',
                      }}
                      title={bg.label}
                    />
                  ))}
                </div>
              </div>
            )}

            {backgroundColorMode === 'gradient' && (
              <div className="space-y-3">
                <span className="text-white/50 text-xs">预设渐变</span>
                <div className="grid grid-cols-2 gap-2">
                  {bgGradientPresets.map((preset) => {
                    const match =
                      backgroundGradientColors.color1 === preset.c1 &&
                      backgroundGradientColors.color2 === preset.c2;
                    return (
                      <button
                        key={preset.name}
                        onClick={() =>
                          setKaleidoscopeBackgroundGradientColors({
                            color1: preset.c1,
                            color2: preset.c2,
                          })
                        }
                        className={`h-12 rounded-lg transition-all duration-200 relative overflow-hidden ${
                          match ? 'ring-2 ring-white scale-105' : 'hover:scale-105'
                        }`}
                        style={{
                          background: `radial-gradient(circle at center, ${preset.c1}, ${preset.c2})`,
                        }}
                      >
                        <span className="absolute inset-0 flex items-center justify-center text-xs text-white/90 font-medium drop-shadow">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-3 items-center">
                  <div className="flex-1 space-y-1">
                    <span className="text-white/40 text-xs">中心色</span>
                    <input
                      type="color"
                      value={backgroundGradientColors.color1}
                      onChange={(e) =>
                        setKaleidoscopeBackgroundGradientColors({
                          ...backgroundGradientColors,
                          color1: e.target.value,
                        })
                      }
                      className="w-full h-8 rounded-lg cursor-pointer bg-transparent border border-white/20"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="text-white/40 text-xs">边缘色</span>
                    <input
                      type="color"
                      value={backgroundGradientColors.color2}
                      onChange={(e) =>
                        setKaleidoscopeBackgroundGradientColors({
                          ...backgroundGradientColors,
                          color2: e.target.value,
                        })
                      }
                      className="w-full h-8 rounded-lg cursor-pointer bg-transparent border border-white/20"
                    />
                  </div>
                </div>
              </div>
            )}

            {backgroundColorMode === 'rainbow' && (
              <div
                className="h-16 rounded-xl"
                style={{
                  background:
                    'radial-gradient(circle at center, #1a0a2e, #16213e, #0f3460, #533483, #e94560, #ff6b6b, #feca57, #48dbfb)',
                }}
              />
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-4 w-64">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-fuchsia-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-white/70 space-y-1">
              <p>
                <span className="text-white font-medium">操作提示：</span>
              </p>
              <p>• 按住鼠标拖动绘制图案</p>
              <p>• 增加对称轴获得更复杂效果</p>
              <p>• <span className="text-fuchsia-400">镜像</span>：沿轴翻转复制</p>
              <p>• <span className="text-fuchsia-400">旋转</span>：绕中心旋转复制</p>
              <p>• <span className="text-fuchsia-400">混合</span>：两者结合最炫酷</p>
              <p>• 开启自动旋转观看动画</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 w-64">
          <Button
            variant="secondary"
            onClick={resetKaleidoscope}
            className="w-full"
          >
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              重置全部设置
            </span>
          </Button>
        </GlassCard>
      </div>
    </div>
  );
};

export default KaleidoscopePage;
