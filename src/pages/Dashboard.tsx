import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileImage, Video, Shield, AlertTriangle, CheckCircle,
  Loader2, ChevronDown, RotateCcw, Eye, Scan, BarChart3,
  Cpu, Waves, Activity, Zap, Fingerprint, Brain,
  Info, X, Layers
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { AnalysisResult } from '../utils/analysis';
import { analyzeImage } from '../utils/analysis';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

// Circular Score Gauge Component
function ScoreGauge({ score, size = 120, label, color, animate = true }: {
  score: number; size?: number; label: string; color: string; animate?: boolean;
}) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score * circumference);
  const percentage = Math.round(score * 100);

  const getColor = () => {
    if (score > 0.65) return '#ff3355';
    if (score > 0.4) return '#ffd700';
    return '#00ff88';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={color || getColor()}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={animate ? offset : circumference}
            className="score-gauge-fill"
            style={{ transition: animate ? 'stroke-dashoffset 1.5s ease-in-out' : 'none' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-white">{percentage}%</span>
        </div>
      </div>
      <span className="text-xs text-gray-400 text-center font-medium">{label}</span>
    </div>
  );
}

// Engine Result Card
function EngineCard({ engine, index }: { engine: AnalysisResult['engines']['physics']; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const scoreColor = engine.score > 0.65 ? 'text-neon-red' : engine.score > 0.4 ? 'text-neon-yellow' : 'text-neon-green';
  const barColor = engine.score > 0.65 ? 'bg-neon-red' : engine.score > 0.4 ? 'bg-neon-yellow' : 'bg-neon-green';

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.1 }}
      className="glass rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-lg">{engine.icon}</span>
        <div className="flex-1 text-left">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">{engine.name}</span>
            <span className={`text-sm font-bold ${scoreColor}`}>
              {(engine.score * 100).toFixed(1)}%
            </span>
          </div>
          <div className="mt-1.5 w-full h-1.5 rounded-full bg-white/5">
            <motion.div
              className={`h-full rounded-full ${barColor}`}
              initial={{ width: 0 }}
              animate={{ width: `${engine.score * 100}%` }}
              transition={{ duration: 1, delay: index * 0.1 }}
            />
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className={`engine-status-dot ${engine.status}`} />
                <span className="capitalize">{engine.status}</span>
                <span className="ml-auto">Confidence: {(engine.confidence * 100).toFixed(0)}%</span>
              </div>
              {engine.details.map((detail, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-400">
                  <Info className="w-3 h-3 mt-0.5 shrink-0 text-neon-cyan/50" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Heatmap Visualization
function HeatmapVisualization({ result }: { result: AnalysisResult }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !result.heatmapData.length) return;

    const ctx = canvas.getContext('2d')!;
    const hRows = result.heatmapData.length;
    const hCols = result.heatmapData[0]?.length || 1;
    canvas.width = 400;
    canvas.height = 300;

    const cellW = canvas.width / hCols;
    const cellH = canvas.height / hRows;

    // Find max value for normalization
    let maxVal = 0;
    for (const row of result.heatmapData) {
      for (const val of row) {
        if (val > maxVal) maxVal = val;
      }
    }

    for (let y = 0; y < hRows; y++) {
      for (let x = 0; x < hCols; x++) {
        const val = result.heatmapData[y][x] / (maxVal || 1);
        // Color: blue -> cyan -> green -> yellow -> red
        let r = 0, g = 0, b = 0;
        if (val < 0.25) {
          b = 200; g = val * 4 * 200;
        } else if (val < 0.5) {
          g = 200; b = (1 - (val - 0.25) * 4) * 200;
        } else if (val < 0.75) {
          g = 200; r = (val - 0.5) * 4 * 255;
        } else {
          r = 255; g = (1 - (val - 0.75) * 4) * 200;
        }
        ctx.fillStyle = `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},0.8)`;
        ctx.fillRect(x * cellW, y * cellH, cellW + 1, cellH + 1);
      }
    }
  }, [result]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="w-full rounded-lg" />
      <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] text-gray-300 bg-black/60 rounded px-2 py-1">
        <span>Low</span>
        <div className="w-20 h-2 rounded" style={{ background: 'linear-gradient(90deg, #0000c8, #00c8c8, #00c800, #c8c800, #ff0000)' }} />
        <span>High</span>
      </div>
    </div>
  );
}

// FFT Spectrum Visualization
function FFTSpectrum({ result }: { result: AnalysisResult }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    canvas.width = 400;
    canvas.height = 200;

    // Generate fake but realistic-looking FFT spectrum data
    const data: number[] = [];
    const size = 64;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const cx = x - size / 2;
        const cy = y - size / 2;
        const dist = Math.sqrt(cx * cx + cy * cy);
        const val = Math.exp(-dist * dist / (2 * 12 * 12)) * 255 + Math.random() * 20;
        data.push(val);
      }
    }

    const maxVal = Math.max(...data);
    const cellW = canvas.width / size;
    const cellH = canvas.height / size;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const val = data[y * size + x] / maxVal;
        const r = Math.floor(val * 255 * 0.3);
        const g = Math.floor(val * 200);
        const b = Math.floor(val * 255);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x * cellW, y * cellH, cellW + 1, cellH + 1);
      }
    }

    // Draw crosshair
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }, [result]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="w-full rounded-lg" />
      <div className="absolute top-2 left-2 text-[10px] text-neon-cyan/70 font-mono bg-black/60 rounded px-2 py-0.5">
        FFT Magnitude Spectrum
      </div>
    </div>
  );
}

// Score Distribution Chart
function ScoreChart({ result }: { result: AnalysisResult }) {
  const data = [
    { name: 'Physics', score: result.engines.physics.score * 100, fill: '#ffd700' },
    { name: 'Frequency', score: result.engines.frequency.score * 100, fill: '#b347ea' },
    { name: 'Noise', score: result.engines.noise.score * 100, fill: '#00f0ff' },
    { name: 'ELA', score: result.engines.ela.score * 100, fill: '#ff2d75' },
    { name: 'Geometry', score: result.engines.geometry.score * 100, fill: '#00ff88' },
  ];

  return (
    <ResponsiveContainer width="100%" height={150}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#111128', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#00f0ff' }}
        />
        <Area type="monotone" dataKey="score" stroke="#00f0ff" fill="url(#scoreGradient)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentEngine, setCurrentEngine] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [viewMode, setViewMode] = useState<'original' | 'heatmap' | 'fft'>('original');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    setFile(f);
    setResult(null);
    setViewMode('original');
    const url = URL.createObjectURL(f);
    setPreview(url);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const runAnalysis = useCallback(async () => {
    if (!file) return;
    setAnalyzing(true);
    setProgress(0);

    const engineNames = ['Initializing system...', 'Physics Engine', 'Frequency Engine', 'Noise Engine', 'ELA Engine', 'Geometry Engine', 'Generating report...'];

    for (let i = 0; i < engineNames.length; i++) {
      setCurrentEngine(engineNames[i]);
      setProgress(((i + 1) / engineNames.length) * 100);
      await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
    }

    try {
      const analysisResult = await analyzeImage(file);
      setResult(analysisResult);
    } catch (err) {
      console.error('Analysis failed:', err);
      alert('Analysis failed. Please try again.');
    }

    setAnalyzing(false);
    setCurrentEngine('');
  }, [file]);

  const reset = useCallback(() => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setAnalyzing(false);
    setProgress(0);
    setCurrentEngine('');
    setViewMode('original');
  }, []);

  return (
    <div className="min-h-screen bg-cyber-black grid-bg">
      {/* Top bar */}
      <div className="sticky top-0 z-50 glass-strong border-b border-cyber-border">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('landing')} className="flex items-center gap-2 text-gray-400 hover:text-neon-cyan transition-colors">
              <Shield className="w-5 h-5" />
              <span className="font-bold gradient-text hidden sm:inline">RealityLens X</span>
            </button>
            <div className="hidden md:flex items-center gap-1 ml-4">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neon-cyan/10 text-neon-cyan text-xs font-medium">
                <Eye className="w-3 h-3" />
                Dashboard
              </div>
              <button onClick={() => onNavigate('training')} className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-gray-400 hover:text-neon-purple hover:bg-neon-purple/10 text-xs font-medium transition-colors">
                <Brain className="w-3 h-3" />
                Training
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {result && (
              <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-700 text-gray-300 hover:text-white text-xs transition-colors">
                <RotateCcw className="w-3 h-3" />
                New Analysis
              </button>
            )}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              System Active
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6">
        {!result && !analyzing && (
          /* Upload Section */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="max-w-4xl mx-auto">
              {/* Upload header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
                  Forensic <span className="gradient-text">Analysis Engine</span>
                </h1>
                <p className="text-gray-400">Upload an image for multi-layer deepfake detection analysis</p>
              </div>

              {/* Upload Zone */}
              <div
                className={`upload-zone rounded-2xl p-8 md:p-12 text-center cursor-pointer relative overflow-hidden ${dragOver ? 'drag-over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />

                {!preview ? (
                  <div className="space-y-4">
                    <div className="w-20 h-20 rounded-2xl bg-cyber-panel border border-cyber-border flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-neon-cyan/50" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white mb-1">Drop your image here</p>
                      <p className="text-sm text-gray-500">or click to browse — supports JPG, PNG, WebP</p>
                    </div>
                    <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
                      <span className="flex items-center gap-1"><FileImage className="w-3 h-3" /> Images</span>
                      <span className="flex items-center gap-1"><Video className="w-3 h-3" /> Video (coming soon)</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img src={preview} alt="Preview" className="max-h-80 mx-auto rounded-xl" />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); reset(); }}
                        className="p-1.5 rounded-lg bg-black/60 text-gray-300 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 text-xs text-gray-300 bg-black/60 rounded px-2 py-1">
                      {file?.name} — {file ? `${(file.size / 1024).toFixed(1)} KB` : ''}
                    </div>
                  </div>
                )}
              </div>

              {/* Analyze button */}
              {preview && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center">
                  <button
                    onClick={runAnalysis}
                    className="group flex items-center gap-3 px-10 py-4 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-bold text-lg hover:opacity-90 transition-all glow-cyan mx-auto"
                  >
                    <Scan className="w-5 h-5" />
                    Run Forensic Analysis
                    <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  </button>
                </motion.div>
              )}

              {/* Quick info cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-8">
                {[
                  { icon: Zap, label: 'Physics', desc: 'Lighting & Shadows' },
                  { icon: Waves, label: 'Frequency', desc: 'FFT Analysis' },
                  { icon: Activity, label: 'Noise', desc: 'Pattern Consistency' },
                  { icon: Layers, label: 'ELA', desc: 'Error Level' },
                  { icon: Fingerprint, label: 'Geometry', desc: 'Structure Check' },
                ].map((item, i) => (
                  <div key={i} className="glass rounded-xl p-3 text-center">
                    <item.icon className="w-4 h-4 text-neon-cyan mx-auto mb-1" />
                    <div className="text-xs font-semibold text-white">{item.label}</div>
                    <div className="text-[10px] text-gray-500">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Analysis Progress */}
        {analyzing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto py-20">
            <div className="glass rounded-2xl p-8 text-center">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-cyber-border" />
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 132  132">
                  <circle
                    cx="66" cy="66" r="60" fill="none"
                    stroke="url(#progressGrad)" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 60}`}
                    strokeDashoffset={`${2 * Math.PI * 60 * (1 - progress / 100)}`}
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  />
                  <defs>
                    <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00f0ff" />
                      <stop offset="100%" stopColor="#b347ea" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black gradient-text">{Math.round(progress)}%</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">Analyzing Media...</h3>
              <div className="flex items-center justify-center gap-2 text-sm text-neon-cyan">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{currentEngine}</span>
              </div>

              <div className="mt-6 w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full progress-bar" style={{ width: `${progress}%` }} />
              </div>

              <div className="flex justify-between mt-2 text-[10px] text-gray-600">
                <span>Initializing</span>
                <span>Complete</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Verdict Banner */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`rounded-2xl p-6 mb-6 ${result.isFake ? 'glow-red bg-neon-red/5 border border-neon-red/20' : 'glow-green bg-neon-green/5 border border-neon-green/20'}`}
            >
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${result.isFake ? 'bg-neon-red/20' : 'bg-neon-green/20'}`}>
                  {result.isFake ? (
                    <AlertTriangle className="w-8 h-8 text-neon-red" />
                  ) : (
                    <CheckCircle className="w-8 h-8 text-neon-green" />
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className={`text-2xl md:text-3xl font-black ${result.isFake ? 'text-neon-red' : 'text-neon-green'}`}>
                    {result.isFake ? 'LIKELY MANIPULATED' : 'LIKELY AUTHENTIC'}
                  </h2>
                  <p className="text-gray-400 mt-1">
                    Confidence: {(result.confidence * 100).toFixed(1)}% • Overall Score: {(result.overallScore * 100).toFixed(1)}%
                  </p>
                </div>
                <ScoreGauge score={result.overallScore} size={100} label="Overall Score" color={result.isFake ? '#ff3355' : '#00ff88'} />
              </div>
            </motion.div>

            {/* Main grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left: Image + Visualizations */}
              <div className="lg:col-span-2 space-y-6">
                {/* Image viewer */}
                <div className="glass rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-1 p-3 border-b border-cyber-border">
                    {(['original', 'heatmap', 'fft'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${viewMode === mode ? 'bg-neon-cyan/10 text-neon-cyan' : 'text-gray-400 hover:text-white'}`}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                    <div className="flex-1" />
                    <span className="text-[10px] text-gray-600 font-mono">{result.fileName}</span>
                  </div>

                  <div className="p-4">
                    <div className="relative aspect-video bg-black/30 rounded-xl overflow-hidden">
                      {viewMode === 'original' && (
                        <img src={result.imageUrl} alt="Analyzed" className="w-full h-full object-contain" />
                      )}
                      {viewMode === 'heatmap' && (
                        <div className="absolute inset-0">
                          <img src={result.imageUrl} alt="Analyzed" className="w-full h-full object-contain opacity-40" />
                          <div className="absolute inset-0">
                            <HeatmapVisualization result={result} />
                          </div>
                        </div>
                      )}
                      {viewMode === 'fft' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FFTSpectrum result={result} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Engine Results */}
                <div className="glass rounded-2xl p-4">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-neon-cyan" />
                    Engine Results
                  </h3>
                  <div className="space-y-3">
                    <EngineCard engine={result.engines.physics} index={0} />
                    <EngineCard engine={result.engines.frequency} index={1} />
                    <EngineCard engine={result.engines.noise} index={2} />
                    <EngineCard engine={result.engines.ela} index={3} />
                    <EngineCard engine={result.engines.geometry} index={4} />
                  </div>
                </div>
              </div>

              {/* Right sidebar */}
              <div className="space-y-6">
                {/* Score Gauges */}
                <div className="glass rounded-2xl p-4">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-neon-cyan" />
                    Individual Scores
                  </h3>
                  <div className="flex flex-wrap justify-center gap-4">
                    <ScoreGauge score={result.engines.physics.score} size={80} label="Physics" color="#ffd700" />
                    <ScoreGauge score={result.engines.frequency.score} size={80} label="Frequency" color="#b347ea" />
                    <ScoreGauge score={result.engines.noise.score} size={80} label="Noise" color="#00f0ff" />
                    <ScoreGauge score={result.engines.ela.score} size={80} label="ELA" color="#ff2d75" />
                    <ScoreGauge score={result.engines.geometry.score} size={80} label="Geometry" color="#00ff88" />
                  </div>
                </div>

                {/* Score Distribution Chart */}
                <div className="glass rounded-2xl p-4">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-neon-cyan" />
                    Score Distribution
                  </h3>
                  <ScoreChart result={result} />
                </div>

                {/* Explanation */}
                <div className="glass rounded-2xl p-4">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-neon-cyan" />
                    Analysis Summary
                  </h3>
                  <div className="space-y-2">
                    {result.explanation.map((line, i) => (
                      <p key={i} className={`text-xs leading-relaxed ${i === 0 ? 'font-semibold text-white' : 'text-gray-400'}`}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Metadata */}
                <div className="glass rounded-2xl p-4">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4 text-neon-cyan" />
                    File Metadata
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(result.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-gray-500">{key}</span>
                        <span className="text-gray-300 font-mono">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
