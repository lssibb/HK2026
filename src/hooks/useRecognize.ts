import { useMutation } from "@tanstack/react-query";

import { getRecognizer } from "@/api/recognize/recognizer";
import type { RecognitionCandidate } from "@/api/types";

export function useRecognize() {
  return useMutation<RecognitionCandidate[], Error, File>({
    mutationFn: (file: File) => getRecognizer().recognize(file),
  });
}
