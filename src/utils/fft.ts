/**
 * RealityLens X — Fast Fourier Transform Implementation
 * Used for frequency domain analysis of image data
 */

// Cooley-Tukey radix-2 FFT
export function fft(re: number[], im: number[]): void {
  const n = re.length;
  if (n <= 1) return;

  // Bit reversal
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) {
      j ^= bit;
    }
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }

  // FFT
  for (let len = 2; len <= n; len <<= 1) {
    const halfLen = len >> 1;
    const angle = (-2 * Math.PI) / len;
    const wRe = Math.cos(angle);
    const wIm = Math.sin(angle);

    for (let i = 0; i < n; i += len) {
      let curRe = 1, curIm = 0;
      for (let j = 0; j < halfLen; j++) {
        const tRe = curRe * re[i + j + halfLen] - curIm * im[i + j + halfLen];
        const tIm = curRe * im[i + j + halfLen] + curIm * re[i + j + halfLen];
        re[i + j + halfLen] = re[i + j] - tRe;
        im[i + j + halfLen] = im[i + j] - tIm;
        re[i + j] += tRe;
        im[i + j] += tIm;
        const newCurRe = curRe * wRe - curIm * wIm;
        curIm = curRe * wIm + curIm * wRe;
        curRe = newCurRe;
      }
    }
  }
}

// Inverse FFT
export function ifft(re: number[], im: number[]): void {
  const n = re.length;
  for (let i = 0; i < n; i++) im[i] = -im[i];
  fft(re, im);
  for (let i = 0; i < n; i++) {
    re[i] /= n;
    im[i] = -im[i] / n;
  }
}

// Perform 2D FFT on a grayscale image patch
export function fft2D(data: number[][], width: number, height: number): { magnitude: number[][], phase: number[][] } {
  // Pad to next power of 2
  const pw = nextPow2(width);
  const ph = nextPow2(height);

  const magnitude: number[][] = [];
  const phase: number[][] = [];

  // Transform rows
  const rowRe = new Array(pw).fill(0);
  const rowIm = new Array(pw).fill(0);
  const temp = Array.from({ length: ph }, () => new Array(pw).fill(0));
  const tempIm = Array.from({ length: ph }, () => new Array(pw).fill(0));

  for (let y = 0; y < height; y++) {
    rowRe.fill(0);
    rowIm.fill(0);
    for (let x = 0; x < width; x++) {
      rowRe[x] = data[y][x];
    }
    fft(rowRe, rowIm);
    for (let x = 0; x < pw; x++) {
      temp[y][x] = rowRe[x];
      tempIm[y][x] = rowIm[x];
    }
  }

  // Transform columns
  const colRe = new Array(ph).fill(0);
  const colIm = new Array(ph).fill(0);

  for (let x = 0; x < pw; x++) {
    colRe.fill(0);
    colIm.fill(0);
    for (let y = 0; y < ph; y++) {
      colRe[y] = temp[y][x];
      colIm[y] = tempIm[y][x];
    }
    fft(colRe, colIm);
    for (let y = 0; y < ph; y++) {
      temp[y][x] = colRe[y];
      tempIm[y][x] = colIm[y];
    }
  }

  // Compute magnitude and phase
  for (let y = 0; y < ph; y++) {
    const magRow: number[] = [];
    const phaseRow: number[] = [];
    for (let x = 0; x < pw; x++) {
      const re = temp[y][x];
      const im = tempIm[y][x];
      magRow.push(Math.sqrt(re * re + im * im));
      phaseRow.push(Math.atan2(im, re));
    }
    magnitude.push(magRow);
    phase.push(phaseRow);
  }

  return { magnitude, phase };
}

// Generate frequency spectrum data for visualization
export function generateSpectrum(grayscaleData: number[], width: number, height: number): number[] {
  const size = 64; // Use 64x64 patch
  const patch: number[][] = [];

  for (let y = 0; y < size; y++) {
    const row: number[] = [];
    for (let x = 0; x < size; x++) {
      const sy = Math.floor((y / size) * height);
      const sx = Math.floor((x / size) * width);
      row.push(grayscaleData[sy * width + sx]);
    }
    patch.push(row);
  }

  const { magnitude } = fft2D(patch, size, size);
  const spectrum: number[] = [];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Shift DC to center
      const sy = (y + size / 2) % size;
      const sx = (x + size / 2) % size;
      spectrum.push(Math.log(1 + magnitude[sy][sx]));
    }
  }

  return spectrum;
}

// Analyze frequency distribution for GAN artifacts
export function analyzeFrequencyDistribution(grayscaleData: number[], width: number, height: number): {
  spectrum: number[];
  highFreqRatio: number;
  lowFreqEnergy: number;
  highFreqEnergy: number;
  spectralEntropy: number;
  anomalyScore: number;
} {
  const spectrum = generateSpectrum(grayscaleData, width, height);
  const size = 64;
  const center = size / 2;

  let lowFreqEnergy = 0;
  let highFreqEnergy = 0;
  let totalEnergy = 0;
  const radiusCutoff = size / 4;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const val = spectrum[y * size + x];
      totalEnergy += val;
      const dist = Math.sqrt((x - center) ** 2 + (y - center) ** 2);
      if (dist < radiusCutoff) {
        lowFreqEnergy += val;
      } else {
        highFreqEnergy += val;
      }
    }
  }

  const highFreqRatio = totalEnergy > 0 ? highFreqEnergy / totalEnergy : 0;

  // Compute spectral entropy
  const normalized = spectrum.map(v => v / (totalEnergy || 1));
  let entropy = 0;
  for (const p of normalized) {
    if (p > 0) entropy -= p * Math.log2(p);
  }

  // GAN-generated images tend to have:
  // 1. Higher high-frequency ratio
  // 2. Lower spectral entropy (more structured)
  // 3. Specific frequency patterns
  let anomalyScore = 0;

  // High frequency ratio check
  if (highFreqRatio > 0.55) anomalyScore += 0.3;
  else if (highFreqRatio > 0.45) anomalyScore += 0.15;

  // Entropy check - GANs often have unusual entropy patterns
  if (entropy < 5 || entropy > 9) anomalyScore += 0.25;

  // Check for grid-like artifacts (common in GANs)
  let gridEnergy = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (x === center || y === center) {
        gridEnergy += spectrum[y * size + x];
      }
    }
  }
  const gridRatio = gridEnergy / (totalEnergy || 1);
  if (gridRatio > 0.15) anomalyScore += 0.2;

  // Check for concentrated high-frequency peaks
  let peakCount = 0;
  const avgSpectrum = totalEnergy / spectrum.length;
  for (const v of spectrum) {
    if (v > avgSpectrum * 3) peakCount++;
  }
  if (peakCount > spectrum.length * 0.05) anomalyScore += 0.25;

  anomalyScore = Math.min(1, anomalyScore);

  return {
    spectrum,
    highFreqRatio,
    lowFreqEnergy,
    highFreqEnergy,
    spectralEntropy: entropy,
    anomalyScore,
  };
}

function nextPow2(n: number): number {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}
