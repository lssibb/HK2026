/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Which data source the app talks to: "local" (localStorage) or "http" (Go backend). */
  readonly VITE_DATA_SOURCE?: "local" | "http";
  /** Base URL of the Go backend when VITE_DATA_SOURCE=http. Defaults to same-origin. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
