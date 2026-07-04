import type { PlantRecognizer } from "./recognizer";
import type { Plant, RecognitionCandidate } from "../types";
import seed from "../seed/plants.seed.json";

const CATALOG = seed as Plant[];

type Bucket = "flower" | "succulent" | "foliage";

function bucketOf(p: Plant): Bucket {
  const tags = p.tags ?? [];
  if (tags.includes("цветущее")) return "flower";
  if (tags.includes("суккулент")) return "succulent";
  return "foliage";
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Не удалось прочитать изображение"));
    img.src = url;
  });
}

interface Signal {
  r: number;
  g: number;
  b: number;
  greenness: number;
  saturation: number;
  brightness: number;
  sig: string;
}

async function analyze(file: File): Promise<Signal> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = 24;
    canvas.height = 24;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, 24, 24);
    const { data } = ctx.getImageData(0, 0, 24, 24);
    let r = 0;
    let g = 0;
    let b = 0;
    const n = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }
    r /= n;
    g /= n;
    b /= n;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    return {
      r,
      g,
      b,
      greenness: g - (r + b) / 2,
      saturation: max === 0 ? 0 : (max - min) / max,
      brightness: (r + g + b) / 3 / 255,
      sig: `${Math.round(r / 16)}-${Math.round(g / 16)}-${Math.round(
        b / 16
      )}-${file.size}`,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Deterministic 0..1 jitter so results are stable per image but vary per plant.
function jitter(seedStr: string): number {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (Math.abs(h) % 1000) / 1000;
}

/**
 * Browser-side placeholder recognizer. It genuinely reads the photo's average
 * colour to bias which kind of plant it proposes (green → foliage, colourful →
 * flowering, pale/muted → succulent), then returns the top candidates with a
 * confidence. Not a real model — swap VITE_DATA_SOURCE=http for the backend.
 */
export class LocalRecognizer implements PlantRecognizer {
  readonly kind = "local" as const;

  async recognize(file: File): Promise<RecognitionCandidate[]> {
    let signal: Signal | null = null;
    try {
      signal = await analyze(file);
    } catch {
      signal = null;
    }
    // simulate inference latency for a believable UX
    await new Promise((r) => setTimeout(r, 850));

    const affinity = signal
      ? {
          foliage: clamp01(0.5 + signal.greenness / 120),
          flower: clamp01(
            signal.saturation * clamp01((signal.r - signal.g + 25) / 80)
          ),
          succulent:
            clamp01((1 - signal.saturation) * (0.4 + signal.brightness)) *
            (signal.greenness > -12 ? 1 : 0.6),
        }
      : { foliage: 0.5, flower: 0.5, succulent: 0.5 };

    const sig = signal?.sig ?? String(file.size);
    const scored = CATALOG.map((plant) => {
      const base = affinity[bucketOf(plant)];
      return { plant, score: base + jitter(sig + plant.id) * 0.3 + 0.05 };
    }).sort((a, b) => b.score - a.score);

    const top = scored.slice(0, 3);
    const best = top[0]?.score || 1;
    return top.map(({ plant, score }) => ({
      plantId: plant.id,
      confidence: Math.max(0.36, Math.min(0.94, score / (best + 0.12))),
    }));
  }
}
