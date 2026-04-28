import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Eye, Cpu, Zap, Activity, Scan, BarChart3, Brain,
  AlertTriangle, CheckCircle, ArrowRight, Fingerprint,
  Waves, ScanLine, Microscope, Gauge, Database
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

// Animated particles
function ParticleField() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number; delay: number }>>([]);

  useEffect(() => {
    const p = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(p);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.id % 3 === 0 ? '#00f0ff' : p.id % 3 === 1 ? '#b347ea' : '#00ff88',
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: p.speed,
            repeat: Infinity,
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

// Scan line animation
function ScanLineEffect() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute left-0 w-full h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.3), transparent)' }}
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute left-0 w-full h-[1px]"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(179,71,234,0.2), transparent)' }}
        animate={{ top: ['100%', '0%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

// Hexagonal grid background
function HexGrid() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="hexGrid" width="60" height="52" patternUnits="userSpaceOnUse">
          <polygon points="30,0 60,15 60,37 30,52 0,37 0,15" fill="none" stroke="#00f0ff" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hexGrid)" />
    </svg>
  );
}

const engines = [
  {
    name: 'Physics Engine',
    icon: SunIcon,
    color: 'from-yellow-500 to-orange-500',
    borderColor: 'border-yellow-500/30',
    glowColor: 'shadow-yellow-500/20',
    description: 'Analyzes lighting direction, shadow consistency, and physical plausibility of illumination across image regions.',
    details: ['Light direction estimation', 'Shadow consistency check', 'Illumination gradient analysis', 'Reflection anomaly detection'],
  },
  {
    name: 'Frequency Engine',
    icon: WavesIcon,
    color: 'from-purple-500 to-pink-500',
    borderColor: 'border-purple-500/30',
    glowColor: 'shadow-purple-500/20',
    description: 'Performs FFT spectral analysis to detect GAN-generated artifacts invisible to the human eye.',
    details: ['2D FFT transformation', 'Spectral entropy analysis', 'High-frequency artifact detection', 'GAN pattern recognition'],
  },
  {
    name: 'Noise Engine',
    icon: ActivityIcon,
    color: 'from-cyan-500 to-blue-500',
    borderColor: 'border-cyan-500/30',
    glowColor: 'shadow-cyan-500/20',
    description: 'Examines noise patterns and their consistency across the image to identify spliced or edited regions.',
    details: ['Noise variance mapping', 'Inconsistency detection', 'Pattern uniformity analysis', 'Sensor noise fingerprinting'],
  },
  {
    name: 'ELA Engine',
    icon: ScanLineIcon,
    color: 'from-pink-500 to-red-500',
    borderColor: 'border-pink-500/30',
    glowColor: 'shadow-pink-500/20',
    description: 'Error Level Analysis reveals compression inconsistencies that expose manipulated areas.',
    details: ['Re-compression analysis', 'Error variance mapping', 'Artifact localization', 'JPEG quality assessment'],
  },
  {
    name: 'Geometry Engine',
    icon: FingerprintIcon,
    color: 'from-green-500 to-emerald-500',
    borderColor: 'border-green-500/30',
    glowColor: 'shadow-green-500/20',
    description: 'Analyzes geometric symmetry, proportions, and structural coherence of detected features.',
    details: ['Symmetry analysis', 'Proportion assessment', 'Edge density evaluation', 'Structural coherence check'],
  },
];

function SunIcon({ className }: { className?: string }) {
  return <Zap className={className} />;
}
function WavesIcon({ className }: { className?: string }) {
  return <Waves className={className} />;
}
function ActivityIcon({ className }: { className?: string }) {
  return <Activity className={className} />;
}
function ScanLineIcon({ className }: { className?: string }) {
  return <ScanLine className={className} />;
}
function FingerprintIcon({ className }: { className?: string }) {
  return <Fingerprint className={className} />;
}

const stats = [
  { label: 'Analysis Engines', value: '5', icon: Cpu, suffix: '' },
  { label: 'Detection Layers', value: '12', icon: BarChart3, suffix: '+' },
  { label: 'Feature Vectors', value: '24', icon: Database, suffix: '' },
  { label: 'Accuracy Target', value: '95', icon: Gauge, suffix: '%' },
];

const processSteps = [
  { step: '01', title: 'Upload Media', desc: 'Upload any image or video file for analysis', icon: Eye },
  { step: '02', title: 'Multi-Engine Scan', desc: '5 forensic engines analyze the media simultaneously', icon: Cpu },
  { step: '03', title: 'Feature Fusion', desc: 'All analysis results are combined and weighted', icon: Brain },
  { step: '04', title: 'Explainable Output', desc: 'Get detailed forensic report with visual evidence', icon: Shield },
];

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const [activeEngine, setActiveEngine] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setActiveEngine(prev => (prev + 1) % engines.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = useCallback(() => {
    onNavigate('dashboard');
  }, [onNavigate]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-cyber-black grid-bg">
      <ParticleField />
      <ScanLineEffect />
      <HexGrid />

      {/* Gradient overlays */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-[120px]" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-neon-purple/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-neon-green/5 rounded-full blur-[100px]" />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-50 flex items-center justify-between px-6 md:px-12 py-4"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 blur-sm" />
          </div>
          <div>
            <span className="text-lg font-bold gradient-text">RealityLens X</span>
            <span className="ml-2 text-[10px] text-neon-cyan/60 font-mono">v2.0</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm">
          <button onClick={() => onNavigate('dashboard')} className="text-gray-400 hover:text-neon-cyan transition-colors">Dashboard</button>
          <button onClick={() => onNavigate('training')} className="text-gray-400 hover:text-neon-cyan transition-colors">Training</button>
          <a href="#features" className="text-gray-400 hover:text-neon-cyan transition-colors">Features</a>
          <a href="#process" className="text-gray-400 hover:text-neon-cyan transition-colors">Process</a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGetStarted}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple text-white hover:opacity-90 transition-opacity"
          >
            Launch System
          </button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-12 md:pt-20 pb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={mounted ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-cyan/20 bg-neon-cyan/5 mb-6">
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              <span className="text-xs text-neon-cyan font-mono">SYSTEM ONLINE — FORENSIC AI ACTIVE</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
              <span className="text-white">Detect</span>
              <br />
              <span className="gradient-text">Deepfakes</span>
              <br />
              <span className="text-white">with Science</span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
              A multi-layer forensic AI system that identifies manipulated media by detecting violations of
              <span className="text-neon-cyan"> natural laws</span> — physics, biology, geometry, and signal patterns.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleGetStarted}
                className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-bold text-lg hover:opacity-90 transition-all glow-cyan"
              >
                Start Analysis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => onNavigate('training')}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-neon-purple/30 text-neon-purple font-semibold hover:bg-neon-purple/10 transition-all"
              >
                <Brain className="w-5 h-5" />
                Train Model
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ y: 20, opacity: 0 }}
                  animate={mounted ? { y: 0, opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                  className="text-center"
                >
                  <stat.icon className="w-5 h-5 text-neon-cyan mx-auto mb-1" />
                  <div className="text-2xl font-black text-white">{stat.value}<span className="text-neon-cyan">{stat.suffix}</span></div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={mounted ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative hidden md:block"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Outer ring */}
              <motion.div
                className="absolute inset-0 rounded-full border border-neon-cyan/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-neon-cyan glow-cyan" />
              </motion.div>

              {/* Middle ring */}
              <motion.div
                className="absolute inset-12 rounded-full border border-neon-purple/20"
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rounded-full bg-neon-purple glow-purple" />
              </motion.div>

              {/* Inner ring */}
              <motion.div
                className="absolute inset-24 rounded-full border border-neon-green/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              >
                <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-neon-green glow-green" />
              </motion.div>

              {/* Center display */}
              <div className="absolute inset-32 flex flex-col items-center justify-center">
                <Shield className="w-16 h-16 text-neon-cyan/60 mb-3" />
                <div className="text-2xl font-black gradient-text text-center">REALITY</div>
                <div className="text-sm text-neon-purple font-mono">LENS X</div>

                {/* Animated status text */}
                <div className="mt-4 text-xs text-gray-500 font-mono text-center">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={activeEngine}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      {engines[activeEngine].name}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>

              {/* Floating data points */}
              {['FFT', 'ELA', 'rPPG', 'CV', 'ML'].map((text, i) => {
                const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
                const radius = 42;
                const x = 50 + radius * Math.cos(angle);
                const y = 50 + radius * Math.sin(angle);
                return (
                  <motion.div
                    key={text}
                    className="absolute text-[10px] font-mono text-neon-cyan/50"
                    style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
                  >
                    {text}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-purple/20 bg-neon-purple/5 mb-4">
            <Cpu className="w-3 h-3 text-neon-purple" />
            <span className="text-xs text-neon-purple font-mono">FORENSIC ENGINES</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            Five-Layer <span className="gradient-text">Detection System</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Each engine specializes in a different aspect of forensic analysis, creating a comprehensive detection system.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {engines.map((engine, i) => (
            <motion.div
              key={engine.name}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`group relative rounded-2xl border ${engine.borderColor} bg-cyber-panel/50 p-6 hover:bg-cyber-panel/80 transition-all duration-300 cursor-pointer`}
              onClick={() => setActiveEngine(i)}
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${engine.color} opacity-0 group-hover:opacity-5 transition-opacity`} />

              <div className="relative">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${engine.color} flex items-center justify-center mb-4`}>
                  <engine.icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{engine.name}</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">{engine.description}</p>

                <div className="space-y-2">
                  {engine.details.map((detail, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs">
                      <CheckCircle className="w-3 h-3 text-neon-green" />
                      <span className="text-gray-300">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Training card */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="group relative rounded-2xl border border-neon-yellow/30 bg-cyber-panel/50 p-6 hover:bg-cyber-panel/80 transition-all duration-300 cursor-pointer"
            onClick={() => onNavigate('training')}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 opacity-0 group-hover:opacity-5 transition-opacity" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Custom Training</h3>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                Train the system with your own real and fake image samples to improve detection accuracy.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="w-3 h-3 text-neon-green" />
                  <span className="text-gray-300">Upload labeled samples</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="w-3 h-3 text-neon-green" />
                  <span className="text-gray-300">Feature extraction & model training</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="w-3 h-3 text-neon-green" />
                  <span className="text-gray-300">Improved detection accuracy</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-green/20 bg-neon-green/5 mb-4">
            <Scan className="w-3 h-3 text-neon-green" />
            <span className="text-xs text-neon-green font-mono">ANALYSIS PIPELINE</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            How It <span className="gradient-text-alt">Works</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6">
          {processSteps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative"
            >
              {i < processSteps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-[1px] bg-gradient-to-r from-neon-cyan/30 to-transparent" />
              )}
              <div className="text-center">
                <div className="relative inline-flex mb-4">
                  <div className="w-20 h-20 rounded-2xl bg-cyber-panel border border-neon-cyan/20 flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-neon-cyan" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-xs font-bold text-white">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 py-20">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-8 md:p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center mx-auto mb-6">
            <Microscope className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Ready to Detect <span className="gradient-text">Deepfakes?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
            Upload any image and get a comprehensive forensic analysis in seconds. No registration required. Completely free.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={handleGetStarted}
              className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-bold text-lg hover:opacity-90 transition-all glow-cyan"
            >
              <Scan className="w-5 h-5" />
              Launch Forensic Analysis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-cyber-border py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-neon-cyan" />
            <span className="text-sm text-gray-500">RealityLens X — Open Source Forensic AI</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              For educational & research purposes
            </span>
            <span>v2.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
