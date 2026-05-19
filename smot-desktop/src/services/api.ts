import { invoke, isTauri } from "../services/tauri";
import type {
  ChatResponse,
  IndexingStatus,
  ModeData,
  StartIndexingResponse,
  SystemStatus,
  UploadResponse,
  ViewerDocument,
  ViewerPageData,
} from "../types";

const defaultDocs: ViewerDocument[] = [
  {
    id: "doc-1",
    name: "Contratto_Fornitura_2026.pdf",
    file_type: "PDF",
    category: "Lavoro",
    indexed: true,
    size_kb: 1890,
    pages: 8,
  },
  {
    id: "doc-2",
    name: "Piano_Studio_AI.docx",
    file_type: "DOCX",
    category: "Studio",
    indexed: true,
    size_kb: 640,
    pages: 4,
  },
  {
    id: "doc-3",
    name: "Spese_Casa_Q1.xlsx",
    file_type: "XLSX",
    category: "Personale",
    indexed: false,
    size_kb: 420,
    pages: 3,
  },
];

let docsState = [...defaultDocs];
let activeMode = "Balanced";

const jobState = new Map<string, IndexingStatus>();

const runFallback = async <T>(
  command: string,
  fallback: () => Promise<T> | T,
  args?: Record<string, unknown>
) => {
  if (isTauri()) {
    try {
      return await invoke<T>(command, args);
    } catch {
      return await fallback();
    }
  }
  return await fallback();
};

const buildSystemStatus = (): SystemStatus => {
  const indexed = docsState.filter((doc) => doc.indexed).length;
  return {
    offline_secure: true,
    ram_used_gb: 6.4,
    ram_total_gb: 16,
    cpu_percent: 22,
    gpu_percent: 14,
    documents_total: docsState.length,
    documents_indexed: indexed,
    storage_total_gb: 512,
    active_model: "llama3.1:8b",
  };
};

const tickJob = (job: IndexingStatus): IndexingStatus => {
  if (job.status === "paused" || job.status === "completed") return job;
  const updatedFiles = job.files.map((file) => {
    const nextProgress = Math.min(100, file.file_progress + 12);
    const chunkDone = Math.min(file.chunk_total, Math.ceil((nextProgress / 100) * file.chunk_total));
    const embeddingDone = Math.min(
      file.embedding_total,
      Math.ceil((nextProgress / 100) * file.embedding_total)
    );
    return {
      ...file,
      file_progress: nextProgress,
      chunk_done: chunkDone,
      embedding_done: embeddingDone,
    };
  });
  const overall = Math.round(
    updatedFiles.reduce((sum, item) => sum + item.file_progress, 0) /
      Math.max(updatedFiles.length, 1)
  );
  const completedDocuments = updatedFiles.filter((item) => item.file_progress >= 100).length;

  const nextStatus: IndexingStatus = {
    ...job,
    files: updatedFiles,
    overall_progress: overall,
    completed_documents: completedDocuments,
    eta_seconds: Math.max(0, Math.round((100 - overall) * 1.5)),
    processed_kb: Math.round((job.total_kb * overall) / 100),
    status: overall >= 100 ? "completed" : job.status,
  };

  if (nextStatus.status === "completed") {
    docsState = docsState.map((doc) =>
      updatedFiles.some((file) => file.document_id === doc.id)
        ? { ...doc, indexed: true }
        : doc
    );
  }

  return nextStatus;
};

export const getSystemStatus = async () =>
  runFallback<SystemStatus>("get_system_status", async () => buildSystemStatus());

export const getModes = async () =>
  runFallback<ModeData>("get_modes", async () => ({
    active_mode: activeMode,
    available_modes: ["Performance", "Balanced", "Lite"],
  }));

export const updateMode = async (mode: string) =>
  runFallback<ModeData>(
    "update_mode",
    async () => {
      activeMode = mode;
      return {
        active_mode: activeMode,
        available_modes: ["Performance", "Balanced", "Lite"],
      };
    },
    { mode }
  );

export const getDocuments = async () =>
  runFallback<ViewerDocument[]>("get_documents", async () => docsState);

export const uploadDocuments = async (files: string[], category = "Lavoro") =>
  runFallback<UploadResponse>(
    "upload_documents",
    async () => {
      const uploaded_documents = files.map((name, index) => {
        const id = `doc-${Date.now()}-${index}`;
        const ext = name.split(".").pop()?.toUpperCase() || "TXT";
        docsState = [
          {
            id,
            name,
            file_type: ext,
            category,
            indexed: false,
            size_kb: 300 + index * 40,
            pages: 2 + index,
          },
          ...docsState,
        ];
        return { id, name };
      });
      return { uploaded_documents };
    },
    { files, category }
  );

export const startIndexing = async (documentIds: string[]) =>
  runFallback<StartIndexingResponse>(
    "start_indexing",
    async () => {
      const selected = docsState.filter((doc) => documentIds.includes(doc.id));
      const job_id = `job-${Date.now()}`;
      const files = selected.map((doc) => ({
        document_id: doc.id,
        document_name: doc.name,
        file_progress: 0,
        chunk_done: 0,
        chunk_total: 12,
        embedding_done: 0,
        embedding_total: 12,
      }));
      jobState.set(job_id, {
        status: "running",
        overall_progress: 0,
        completed_documents: 0,
        total_documents: selected.length,
        eta_seconds: 120,
        processed_kb: 0,
        total_kb: selected.reduce((sum, doc) => sum + doc.size_kb, 0),
        files,
      });
      return { job_id };
    },
    { document_ids: documentIds }
  );

export const getIndexingStatus = async (jobId: string) =>
  runFallback<IndexingStatus>(
    "get_indexing_status",
    async () => {
      const current = jobState.get(jobId);
      if (!current) {
        throw new Error("Job not found");
      }
      const next = tickJob(current);
      jobState.set(jobId, next);
      return next;
    },
    { job_id: jobId }
  );

export const pauseIndexing = async (jobId: string) =>
  runFallback<IndexingStatus | null>(
    "pause_indexing",
    async () => {
      const current = jobState.get(jobId);
      if (!current) return null;
      const next = { ...current, status: "paused" as const };
      jobState.set(jobId, next);
      return next;
    },
    { job_id: jobId }
  );

export const resumeIndexing = async (jobId: string) =>
  runFallback<IndexingStatus | null>(
    "resume_indexing",
    async () => {
      const current = jobState.get(jobId);
      if (!current) return null;
      const next = { ...current, status: "running" as const };
      jobState.set(jobId, next);
      return next;
    },
    { job_id: jobId }
  );

export const continueInBackground = async (jobId: string) =>
  runFallback<IndexingStatus | null>(
    "continue_in_background",
    async () => {
      const current = jobState.get(jobId);
      if (!current) return null;
      const next = { ...current, status: "background" as const };
      jobState.set(jobId, next);
      return next;
    },
    { job_id: jobId }
  );

export const sendQuestion = async (
  question: string,
  filterCategory = "Tutti"
) =>
  runFallback<ChatResponse>(
    "chat_query",
    async () => {
      const indexedDocs = docsState.filter((doc) => doc.indexed);
      const filtered =
        filterCategory === "Tutti"
          ? indexedDocs
          : indexedDocs.filter((doc) => doc.category === filterCategory);
      const chosen = filtered.slice(0, 2);
      return {
        answer: `Risposta locale simulata per: "${question}". Ho analizzato ${chosen.length} documenti pertinenti.`,
        sources: chosen.map((doc, index) => ({
          document_id: doc.id,
          document_name: doc.name,
          page: index + 1,
          snippet: "Estratto rilevante collegato alla tua domanda.",
        })),
      };
    },
    { question, filter_category: filterCategory }
  );

export const getViewerPage = async (documentId: string, page: number) =>
  runFallback<ViewerPageData>(
    "get_viewer_page",
    async () => {
      const doc = docsState.find((item) => item.id === documentId) ?? docsState[0];
      return {
        document_id: doc.id,
        document_name: doc.name,
        page,
        total_pages: doc.pages,
        highlights: ["SMOT", "indicizzazione", "Ollama"],
        text: "SMOT mantiene i dati in locale e lavora offline. L'indicizzazione prepara chunk e metadati per ricerca rapida. Il supporto Ollama viene verificato all'avvio con fallback sicuro.",
      };
    },
    { document_id: documentId, page }
  );
