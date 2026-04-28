import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Brain, CheckCircle, XCircle, Trash2,
  Database, BarChart3, Cpu, Zap, Activity, AlertTriangle,
  RefreshCw, Eye, Plus, X, ArrowRight, Layers
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { TrainingModel } from '../utils/analysis';
import { loadTrainingModel, saveTrainingModel, addTrainingSample, extractFeatures } from '../utils/analysis';

interface TrainingPageProps {
  onNavigate: (page: string) => void;
}

function loadAndDrawImage(src: string): Promise<{ canvas: HTMLCanvasElement; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxSize = 256;
      let w = img.width, h = img.height;
      if (w > maxSize || h > maxSize) {
        const scale = maxSize / Math.max(w, h);
        w = Math.floor(w * scale);
        h = Math.floor(h * scale);
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      resolve({ canvas, width: w, height: h });
    };
    img.onerror = reject;
    img.src = src;
  });
}

export default function TrainingPage({ onNavigate }: TrainingPageProps) {
  const [model, setModel] = useState<TrainingModel>(loadTrainingModel());
  const [realFiles, setRealFiles] = useState<Array<{ file: File; preview: string }>>([]);
  const [fakeFiles, setFakeFiles] = useState<Array<{ file: File; preview: string }>>([]);
  const [training, setTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const realInputRef = useRef<HTMLInputElement>(null);
  const fakeInputRef = useRef<HTMLInputElement>(null);

  const realCount = model.samples.filter(s => s.label === 'real').length;
  const fakeCount = model.samples.filter(s => s.label === 'fake').length;

  const handleRealFiles = useCallback((files: FileList) => {
    const newFiles = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setRealFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleFakeFiles = useCallback((files: FileList) => {
    const newFiles = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setFakeFiles(prev => [...prev, ...newFiles]);
  }, []);

  const trainModel = useCallback(async () => {
    if (realFiles.length === 0 && fakeFiles.length === 0) return;
    setTraining(true);
    setProgress(0);
    setStatusMsg('Initializing feature extraction...');

    let currentModel = { ...model };

    // Process real files
    for (let i = 0; i < realFiles.length; i++) {
      setStatusMsg(`Extracting features from real image ${i + 1}/${realFiles.length}...`);
      setProgress(((i) / (realFiles.length + fakeFiles.length)) * 100);
      try {
        const { canvas, width, height } = await loadAndDrawImage(realFiles[i].preview);
        const ctx = canvas.getContext('2d')!;
        const imageData = ctx.getImageData(0, 0, width, height);
        const features = extractFeatures(imageData.data, width, height);
        currentModel = addTrainingSample(currentModel, features, 'real', realFiles[i].file.name);
      } catch (e) {
        console.error('Error processing real file:', e);
      }
      await new Promise(r => setTimeout(r, 100));
    }

    // Process fake files
    for (let i = 0; i < fakeFiles.length; i++) {
      setStatusMsg(`Extracting features from fake image ${i + 1}/${fakeFiles.length}...`);
      setProgress(((realFiles.length + i) / (realFiles.length + fakeFiles.length)) * 100);
      try {
        const { canvas, width, height } = await loadAndDrawImage(fakeFiles[i].preview);
        const ctx = canvas.getContext('2d')!;
        const imageData = ctx.getImageData(0, 0, width, height);
        const features = extractFeatures(imageData.data, width, height);
        currentModel = addTrainingSample(currentModel, features, 'fake', fakeFiles[i].file.name);
      } catch (e) {
        console.error('Error processing fake file:', e);
      }
      await new Promise(r => setTimeout(r, 100));
    }

    setProgress(100);
    setStatusMsg('Training complete!');
    setModel(currentModel);

    // Cleanup previews
    realFiles.forEach(f => URL.revokeObjectURL(f.preview));
    fakeFiles.forEach(f => URL.revokeObjectURL(f.preview));
    setRealFiles([]);
    setFakeFiles([]);

    await new Promise(r => setTimeout(r, 1000));
    setTraining(false);
  }, [realFiles, fakeFiles, model]);

  const clearModel = useCallback(() => {
    const emptyModel: TrainingModel = {
      samples: [],
      realStats: { mean: [], std: [] },
      fakeStats: { mean: [], std: [] },
      accuracy: 0,
      trained: false,
    };
    setModel(emptyModel);
    saveTrainingModel(emptyModel);
  }, []);

  // Feature comparison chart data
  const featureChartData = () => {
    if (!model.trained || model.realStats.mean.length === 0) return [];
    const labels = ['R Mean', 'G Mean', 'B Mean', 'HF Ratio', 'Entropy', 'Noise', 'Color', 'Symmetry', 'Edge'];
    return labels.map((name, i) => ({
      name,
      real: i < model.realStats.mean.length ? +(model.realStats.mean[i] * 100).toFixed(1) : 0,
      fake: i < model.fakeStats.mean.length ? +(model.fakeStats.mean[i] * 100).toFixed(1) : 0,
    }));
  };

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
              <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-gray-400 hover:text-neon-cyan hover:bg-neon-cyan/10 text-xs font-medium transition-colors">
                <Eye className="w-3 h-3" />
                Dashboard
              </button>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neon-purple/10 text-neon-purple text-xs font-medium">
                <Brain className="w-3 h-3" />
                Training
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            System Active
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-purple/20 bg-neon-purple/5 mb-4">
            <Brain className="w-3 h-3 text-neon-purple" />
            <span className="text-xs text-neon-purple font-mono">CUSTOM TRAINING MODULE</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
            Train the <span className="gradient-text">Detection Model</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Upload real and fake images to help the system learn distinctive patterns. The more diverse samples you provide, the better the detection accuracy.
          </p>
        </motion.div>

        {/* Model Status */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-5 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-black text-neon-green">{realCount}</div>
                <div className="text-xs text-gray-500">Real Samples</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-neon-red">{fakeCount}</div>
                <div className="text-xs text-gray-500">Fake Samples</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-neon-cyan">{model.trained ? `${(model.accuracy * 100).toFixed(0)}%` : '—'}</div>
                <div className="text-xs text-gray-500">Accuracy</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-black ${model.trained ? 'text-neon-green' : 'text-gray-600'}`}>
                  {model.trained ? 'Active' : 'Inactive'}
                </div>
                <div className="text-xs text-gray-500">Model Status</div>
              </div>
            </div>

            {model.samples.length > 0 && (
              <button
                onClick={clearModel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neon-red/20 text-neon-red text-xs hover:bg-neon-red/10 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Reset Model
              </button>
            )}
          </div>
        </motion.div>

        {/* Upload zones */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Real images */}
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <div
              className="upload-zone rounded-2xl p-6 min-h-[250px] flex flex-col items-center justify-center border-neon-green/30"
              onClick={() => realInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); e.dataTransfer.files.length && handleRealFiles(e.dataTransfer.files); }}
            >
              <input ref={realInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handleRealFiles(e.target.files)} />

              <div className="w-16 h-16 rounded-2xl bg-neon-green/10 border border-neon-green/20 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-neon-green" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Upload REAL Images</h3>
              <p className="text-sm text-gray-500 text-center mb-3">Upload authentic, unmodified photographs</p>

              {realFiles.length > 0 && (
                <div className="mt-4 w-full">
                  <div className="flex flex-wrap gap-2 justify-center mb-3">
                    {realFiles.slice(0, 6).map((f, i) => (
                      <div key={i} className="relative group">
                        <img src={f.preview} alt="" className="w-14 h-14 rounded-lg object-cover border border-neon-green/20" />
                        <button
                          onClick={(e) => { e.stopPropagation(); setRealFiles(prev => prev.filter((_, idx) => idx !== i)); }}
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neon-red flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-2.5 h-2.5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-neon-green text-center">{realFiles.length} image(s) selected</div>
                </div>
              )}

              <div className="mt-3 flex items-center gap-1.5 text-xs text-neon-green">
                <Plus className="w-3 h-3" />
                Add Files
              </div>
            </div>
          </motion.div>

          {/* Fake images */}
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <div
              className="upload-zone rounded-2xl p-6 min-h-[250px] flex flex-col items-center justify-center border-neon-red/30"
              onClick={() => fakeInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); e.dataTransfer.files.length && handleFakeFiles(e.dataTransfer.files); }}
            >
              <input ref={fakeInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handleFakeFiles(e.target.files)} />

              <div className="w-16 h-16 rounded-2xl bg-neon-red/10 border border-neon-red/20 flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-neon-red" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Upload FAKE Images</h3>
              <p className="text-sm text-gray-500 text-center mb-3">Upload AI-generated or manipulated images</p>

              {fakeFiles.length > 0 && (
                <div className="mt-4 w-full">
                  <div className="flex flex-wrap gap-2 justify-center mb-3">
                    {fakeFiles.slice(0, 6).map((f, i) => (
                      <div key={i} className="relative group">
                        <img src={f.preview} alt="" className="w-14 h-14 rounded-lg object-cover border border-neon-red/20" />
                        <button
                          onClick={(e) => { e.stopPropagation(); setFakeFiles(prev => prev.filter((_, idx) => idx !== i)); }}
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neon-red flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-2.5 h-2.5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-neon-red text-center">{fakeFiles.length} image(s) selected</div>
                </div>
              )}

              <div className="mt-3 flex items-center gap-1.5 text-xs text-neon-red">
                <Plus className="w-3 h-3" />
                Add Files
              </div>
            </div>
          </motion.div>
        </div>

        {/* Train button */}
        {(realFiles.length > 0 || fakeFiles.length > 0) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <button
              onClick={trainModel}
              disabled={training}
              className="group flex items-center gap-3 px-10 py-4 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink text-white font-bold text-lg hover:opacity-90 transition-all glow-purple mx-auto disabled:opacity-50"
            >
              {training ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  {statusMsg}
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Train Model
                  <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                </>
              )}
            </button>
            {training && (
              <div className="mt-4 max-w-md mx-auto">
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-neon-purple to-neon-pink"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">{Math.round(progress)}%</div>
              </div>
            )}
          </motion.div>
        )}

        {/* Feature Comparison Chart */}
        {model.trained && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 mb-8">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-neon-cyan" />
              Feature Distribution: Real vs Fake
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={featureChartData()}>
                <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#111128', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#00f0ff' }}
                />
                <Bar dataKey="real" name="Real" radius={[4, 4, 0, 0]}>
                  {featureChartData().map((_, i) => (
                    <Cell key={i} fill="#00ff88" fillOpacity={0.7} />
                  ))}
                </Bar>
                <Bar dataKey="fake" name="Fake" radius={[4, 4, 0, 0]}>
                  {featureChartData().map((_, i) => (
                    <Cell key={i} fill="#ff3355" fillOpacity={0.7} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-neon-green/70" /> Real Images</span>
              <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-neon-red/70" /> Fake Images</span>
            </div>
          </motion.div>
        )}

        {/* Training Samples List */}
        {model.samples.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 mb-8">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-neon-cyan" />
              Training Samples ({model.samples.length})
            </h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {model.samples.slice(-20).reverse().map((sample) => (
                <div key={sample.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${sample.label === 'real' ? 'bg-neon-green/20' : 'bg-neon-red/20'}`}>
                    {sample.label === 'real' ? (
                      <CheckCircle className="w-3 h-3 text-neon-green" />
                    ) : (
                      <XCircle className="w-3 h-3 text-neon-red" />
                    )}
                  </div>
                  <span className="text-sm text-gray-300 flex-1 truncate">{sample.fileName}</span>
                  <span className={`text-xs font-medium ${sample.label === 'real' ? 'text-neon-green' : 'text-neon-red'}`}>
                    {sample.label.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-gray-600 font-mono">{sample.features.length} features</span>
                </div>
              ))}
            </div>
            {model.samples.length > 20 && (
              <div className="text-center text-xs text-gray-500 mt-3">
                Showing latest 20 of {model.samples.length} samples
              </div>
            )}
          </motion.div>
        )}

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="glass rounded-xl p-4">
            <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center mb-3">
              <Cpu className="w-5 h-5 text-neon-cyan" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Feature Extraction</h4>
            <p className="text-xs text-gray-400">24-dimensional feature vectors extracted from each image covering color, frequency, noise, and geometry patterns.</p>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="w-10 h-10 rounded-lg bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center mb-3">
              <Brain className="w-5 h-5 text-neon-purple" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Statistical Model</h4>
            <p className="text-xs text-gray-400">Mahalanobis distance classifier trained on your labeled data with leave-one-out cross-validation for accuracy estimation.</p>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="w-10 h-10 rounded-lg bg-neon-green/10 border border-neon-green/20 flex items-center justify-center mb-3">
              <Activity className="w-5 h-5 text-neon-green" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Continuous Learning</h4>
            <p className="text-xs text-gray-400">Model improves with every sample you add. The more diverse your dataset, the more accurate the detection becomes.</p>
          </div>
        </div>

        {/* Tips */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-neon-yellow" />
            Training Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-neon-green flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3" />
                For Best Results:
              </h4>
              <ul className="space-y-1.5 text-xs text-gray-400">
                <li className="flex items-start gap-2"><span className="text-neon-cyan">•</span> Upload at least 5 real and 5 fake images</li>
                <li className="flex items-start gap-2"><span className="text-neon-cyan">•</span> Include diverse image types and sources</li>
                <li className="flex items-start gap-2"><span className="text-neon-cyan">•</span> Mix different GAN architectures for fake images</li>
                <li className="flex items-start gap-2"><span className="text-neon-cyan">•</span> Include both faces and non-face images</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-neon-red flex items-center gap-1.5">
                <XCircle className="w-3 h-3" />
                Avoid:
              </h4>
              <ul className="space-y-1.5 text-xs text-gray-400">
                <li className="flex items-start gap-2"><span className="text-neon-red">•</span> Very small or heavily compressed images</li>
                <li className="flex items-start gap-2"><span className="text-neon-red">•</span> Identical or near-duplicate samples</li>
                <li className="flex items-start gap-2"><span className="text-neon-red">•</span> Mixing up real and fake labels</li>
                <li className="flex items-start gap-2"><span className="text-neon-red">•</span> Only one category (need both real and fake)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        {model.trained && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-8">
            <p className="text-gray-400 mb-4">Model trained and ready! Go to the dashboard to test it on new images.</p>
            <button
              onClick={() => onNavigate('dashboard')}
              className="group flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-bold hover:opacity-90 transition-all glow-cyan mx-auto"
            >
              <Layers className="w-5 h-5" />
              Go to Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
