import type { PlantRecognizer } from "./recognizer";
import type { RecognitionCandidate } from "../types";
import { ApiError } from "../http/client";

const BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

/**
 * Posts the photo to the Go backend as multipart/form-data (field "image") and
 * expects `RecognitionCandidate[]`. See docs/openapi.yaml `/recognize`.
 * Enabled with VITE_DATA_SOURCE=http.
 */
export class HttpRecognizer implements PlantRecognizer {
  readonly kind = "http" as const;

  async recognize(file: File): Promise<RecognitionCandidate[]> {
    const body = new FormData();
    body.append("image", file);
    // Let the browser set the multipart boundary — do not set Content-Type.
    const res = await fetch(`${BASE}/api/v1/ai/recognize`, { method: "POST", body });
    if (!res.ok) {
      let message = `${res.status} ${res.statusText}`;
      try {
        const j = (await res.json()) as { error?: string };
        message = j.error ?? message;
      } catch {
        /* keep status line */
      }
      throw new ApiError(res.status, message);
    }
    return (await res.json()) as RecognitionCandidate[];
  }
}
