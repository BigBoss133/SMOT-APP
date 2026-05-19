import { invoke } from "../services/tauri";

export interface OllamaStatus {
  installed: boolean;
  version: string | null;
  running: boolean;
  models: string[];
  error: string | null;
}

export interface DownloadProgress {
  model: string;
  status: string;
  percent: number;
  downloaded_mb: number;
  total_mb: number;
  eta_seconds: number;
  error: string | null;
}

export const getOllamaStatus = (): Promise<OllamaStatus> =>
  invoke("get_ollama_status");

export const pullModel = (model: string): Promise<void> =>
  invoke("pull_ollama_model", { model });

export const checkDiskSpace = (minGb: number): Promise<boolean> =>
  invoke("check_disk_space", { minGb });
