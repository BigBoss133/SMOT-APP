export interface ModeData {
  active_mode: string;
  available_modes: string[];
}

export interface ViewerDocument {
  id: string;
  name: string;
  file_type: string;
  category: string;
  indexed: boolean;
  size_kb: number;
  pages: number;
}

export interface SystemStatus {
  offline_secure: boolean;
  ram_used_gb: number;
  ram_total_gb: number;
  cpu_percent: number;
  gpu_percent: number;
  documents_total: number;
  documents_indexed: number;
  storage_total_gb: number;
  active_model: string;
}

export interface UploadedDocument {
  id: string;
  name: string;
}

export interface UploadResponse {
  uploaded_documents: UploadedDocument[];
}

export interface StartIndexingResponse {
  job_id: string;
}

export interface IndexingFileStatus {
  document_id: string;
  document_name: string;
  file_progress: number;
  chunk_done: number;
  chunk_total: number;
  embedding_done: number;
  embedding_total: number;
}

export interface IndexingStatus {
  status: "running" | "paused" | "completed" | "background";
  overall_progress: number;
  completed_documents: number;
  total_documents: number;
  eta_seconds: number;
  processed_kb: number;
  total_kb: number;
  files: IndexingFileStatus[];
}

export interface ChatSource {
  document_id: string;
  document_name: string;
  page: number;
  snippet: string;
}

export interface ChatResponse {
  answer: string;
  sources: ChatSource[];
}

export interface ViewerPageData {
  document_id: string;
  document_name: string;
  page: number;
  total_pages: number;
  highlights: string[];
  text: string;
}

export type LicenseStatusType = "active" | "grace" | "blocked" | "trial";

export interface LicenseInfo {
  status: LicenseStatusType;
  plan?: string;
  expires_at?: string;
  key?: string;
  days_left?: number;
}
