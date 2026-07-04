import type { RecognitionCandidate } from "../types";

/**
 * Plant recognition behind one interface — mirrors the DataSource pattern.
 * The mock analyses the image in the browser; the HTTP one posts it to the Go
 * backend. Swap with VITE_DATA_SOURCE, no page changes.
 */
export interface PlantRecognizer {
  readonly kind: "local" | "http";
  /** Identify a plant from a photo; returns candidates, best first. */
  recognize(file: File): Promise<RecognitionCandidate[]>;
}

let singleton: PlantRecognizer | null = null;

export function getRecognizer(): PlantRecognizer {
  if (singleton) return singleton;
  const mode = import.meta.env.VITE_DATA_SOURCE ?? "local";
  singleton =
    mode === "http"
      ? new httpModule.HttpRecognizer()
      : new localModule.LocalRecognizer();
  return singleton;
}

import * as localModule from "./localRecognizer";
import * as httpModule from "./httpRecognizer";
