import math
import random
from datetime import datetime, timezone
from typing import Dict, List
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


app = FastAPI(title="SMOT API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Document(BaseModel):
    id: str
    name: str
    category: str
    file_type: str
    size_kb: float
    indexed: bool = False
    created_at: str


class UploadRequest(BaseModel):
    files: List[str] = Field(default_factory=list)
    category: str = "Lavoro"


class UploadResponse(BaseModel):
    uploaded_documents: List[Document]


class IndexStartRequest(BaseModel):
    document_ids: List[str]


class IndexFileProgress(BaseModel):
    document_id: str
    document_name: str
    file_progress: int
    chunk_done: int
    chunk_total: int
    embedding_done: int
    embedding_total: int
    text_extraction_done: bool


class IndexStatusResponse(BaseModel):
    job_id: str
    status: str
    overall_progress: int
    completed_documents: int
    total_documents: int
    eta_seconds: int
    processed_kb: float
    total_kb: float
    files: List[IndexFileProgress]


class ChatRequest(BaseModel):
    question: str
    filter_category: str = "Tutti"


class ChatSource(BaseModel):
    document_id: str
    document_name: str
    page: int
    snippet: str


class ChatResponse(BaseModel):
    answer: str
    sources: List[ChatSource]


class ModeUpdateRequest(BaseModel):
    mode: str


class ModeResponse(BaseModel):
    active_mode: str
    available_modes: List[str]


class ViewerPageResponse(BaseModel):
    document_id: str
    document_name: str
    page: int
    total_pages: int
    text: str
    highlights: List[str]


DOCUMENTS: Dict[str, Document] = {}
INDEX_JOBS: Dict[str, Dict] = {}
ACTIVE_MODE = "Balanced"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _seed_documents() -> None:
    examples = [
        ("Contratto_2024.pdf", "Lavoro", "PDF", 820.3, True),
        ("Tesi_Ricerca.docx", "Studio", "DOCX", 1580.2, True),
        ("Note_progetto.txt", "Personale", "TXT", 124.9, False),
    ]
    for name, category, file_type, size_kb, indexed in examples:
        doc_id = str(uuid4())
        DOCUMENTS[doc_id] = Document(
            id=doc_id,
            name=name,
            category=category,
            file_type=file_type,
            size_kb=size_kb,
            indexed=indexed,
            created_at=_now_iso(),
        )


_seed_documents()


def _safe_status(job: Dict) -> str:
    if job["paused"]:
        return "paused"
    if job["background"]:
        return "background"
    return "running"


def _compute_job_progress(job: Dict) -> IndexStatusResponse:
    docs = [DOCUMENTS[doc_id] for doc_id in job["document_ids"] if doc_id in DOCUMENTS]
    total_docs = len(docs)
    if total_docs == 0:
        raise HTTPException(status_code=404, detail="No documents in indexing job")

    if job["completed"]:
        total_kb = round(sum(doc.size_kb for doc in docs), 2)
        return IndexStatusResponse(
            job_id=job["id"],
            status="completed",
            overall_progress=100,
            completed_documents=total_docs,
            total_documents=total_docs,
            eta_seconds=0,
            processed_kb=total_kb,
            total_kb=total_kb,
            files=[
                IndexFileProgress(
                    document_id=doc.id,
                    document_name=doc.name,
                    file_progress=100,
                    chunk_done=15,
                    chunk_total=15,
                    embedding_done=15,
                    embedding_total=15,
                    text_extraction_done=True,
                )
                for doc in docs
            ],
        )

    elapsed = (datetime.now(timezone.utc) - job["started_at"]).total_seconds()
    elapsed = elapsed if elapsed > 0 else 0
    total_seconds = max(12, total_docs * 16)
    overall_progress = min(100, int((elapsed / total_seconds) * 100))
    completed_docs = min(total_docs, math.floor(overall_progress / (100 / total_docs)))

    file_data: List[IndexFileProgress] = []
    for index, doc in enumerate(docs):
        start = index * (100 / total_docs)
        end = (index + 1) * (100 / total_docs)
        if overall_progress <= start:
            local_progress = 0
        elif overall_progress >= end:
            local_progress = 100
        else:
            local_progress = int(((overall_progress - start) / (end - start)) * 100)

        chunk_done = min(15, math.ceil((local_progress / 100) * 15))
        embedding_done = min(15, math.floor((local_progress / 100) * 15))
        file_data.append(
            IndexFileProgress(
                document_id=doc.id,
                document_name=doc.name,
                file_progress=local_progress,
                chunk_done=chunk_done,
                chunk_total=15,
                embedding_done=embedding_done,
                embedding_total=15,
                text_extraction_done=local_progress > 20,
            )
        )

    if overall_progress >= 100:
        job["completed"] = True
        for doc in docs:
            doc.indexed = True

    total_kb = round(sum(doc.size_kb for doc in docs), 2)
    processed_kb = round((overall_progress / 100) * total_kb, 2)
    eta_seconds = max(0, int(total_seconds - elapsed))

    return IndexStatusResponse(
        job_id=job["id"],
        status=_safe_status(job),
        overall_progress=overall_progress,
        completed_documents=completed_docs,
        total_documents=total_docs,
        eta_seconds=eta_seconds,
        processed_kb=processed_kb,
        total_kb=total_kb,
        files=file_data,
    )


@app.get("/api/health")
def health() -> Dict[str, str]:
    return {"status": "ok", "service": "smot-api"}


@app.get("/api/system/status")
def get_system_status() -> Dict:
    return {
        "offline_secure": True,
        "cpu_percent": random.randint(18, 64),
        "ram_used_gb": round(random.uniform(6.2, 11.8), 1),
        "ram_total_gb": 16,
        "gpu_percent": random.randint(10, 72),
        "active_model": "SMOT Local RAG v2",
        "last_update": _now_iso(),
        "documents_total": len(DOCUMENTS),
        "documents_indexed": len([doc for doc in DOCUMENTS.values() if doc.indexed]),
        "storage_total_gb": round(sum(doc.size_kb for doc in DOCUMENTS.values()) / 1024 / 1024, 2),
    }


@app.get("/api/modes", response_model=ModeResponse)
def get_modes() -> ModeResponse:
    return ModeResponse(active_mode=ACTIVE_MODE, available_modes=["Performance", "Balanced", "Lite"])


@app.put("/api/modes", response_model=ModeResponse)
def set_mode(payload: ModeUpdateRequest) -> ModeResponse:
    global ACTIVE_MODE
    if payload.mode not in ["Performance", "Balanced", "Lite"]:
        raise HTTPException(status_code=400, detail="Invalid mode")
    ACTIVE_MODE = payload.mode
    return ModeResponse(active_mode=ACTIVE_MODE, available_modes=["Performance", "Balanced", "Lite"])


@app.get("/api/documents", response_model=List[Document])
def list_documents() -> List[Document]:
    return list(DOCUMENTS.values())


@app.post("/api/documents/upload", response_model=UploadResponse)
def upload_documents(payload: UploadRequest) -> UploadResponse:
    if not payload.files:
        raise HTTPException(status_code=400, detail="No files provided")

    uploaded_docs: List[Document] = []
    for file_name in payload.files:
        doc_id = str(uuid4())
        extension = file_name.split(".")[-1].upper() if "." in file_name else "FILE"
        size_kb = round(random.uniform(120, 1950), 2)
        doc = Document(
            id=doc_id,
            name=file_name,
            category=payload.category,
            file_type=extension,
            size_kb=size_kb,
            indexed=False,
            created_at=_now_iso(),
        )
        DOCUMENTS[doc_id] = doc
        uploaded_docs.append(doc)

    return UploadResponse(uploaded_documents=uploaded_docs)


@app.post("/api/indexing/start")
def start_indexing(payload: IndexStartRequest) -> Dict[str, str]:
    valid_ids = [doc_id for doc_id in payload.document_ids if doc_id in DOCUMENTS]
    if not valid_ids:
        raise HTTPException(status_code=404, detail="No valid documents selected")

    job_id = str(uuid4())
    INDEX_JOBS[job_id] = {
        "id": job_id,
        "document_ids": valid_ids,
        "started_at": datetime.now(timezone.utc),
        "paused": False,
        "background": False,
        "completed": False,
    }
    return {"job_id": job_id}


@app.get("/api/indexing/status/{job_id}", response_model=IndexStatusResponse)
def indexing_status(job_id: str) -> IndexStatusResponse:
    job = INDEX_JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Indexing job not found")
    return _compute_job_progress(job)


@app.post("/api/indexing/pause/{job_id}")
def pause_indexing(job_id: str) -> Dict[str, str]:
    job = INDEX_JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Indexing job not found")
    job["paused"] = True
    return {"status": "paused"}


@app.post("/api/indexing/resume/{job_id}")
def resume_indexing(job_id: str) -> Dict[str, str]:
    job = INDEX_JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Indexing job not found")
    job["paused"] = False
    job["background"] = False
    return {"status": "running"}


@app.post("/api/indexing/background/{job_id}")
def background_indexing(job_id: str) -> Dict[str, str]:
    job = INDEX_JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Indexing job not found")
    job["background"] = True
    return {"status": "background"}


@app.post("/api/chat/query", response_model=ChatResponse)
def query_documents(payload: ChatRequest) -> ChatResponse:
    question_lower = payload.question.lower()
    if "pagamento" in question_lower or "payment" in question_lower:
        answer = (
            "Il contratto specifica pagamento entro 30 giorni dalla fattura, "
            "con penale del 2% oltre 45 giorni."
        )
    else:
        answer = (
            "Ho analizzato i documenti indicizzati. La risposta più rilevante è disponibile "
            "nelle fonti con riferimenti di pagina qui a destra."
        )

    indexed_docs = [doc for doc in DOCUMENTS.values() if doc.indexed]
    top_docs = indexed_docs[:2] if indexed_docs else list(DOCUMENTS.values())[:2]
    sources = [
        ChatSource(
            document_id=doc.id,
            document_name=doc.name,
            page=4 if index == 0 else 2,
            snippet="Termini economici, clausole di pagamento e condizioni operative.",
        )
        for index, doc in enumerate(top_docs)
    ]

    return ChatResponse(answer=answer, sources=sources)


@app.get("/api/viewer/{document_id}/page/{page}", response_model=ViewerPageResponse)
def viewer_page(document_id: str, page: int) -> ViewerPageResponse:
    doc = DOCUMENTS.get(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    total_pages = 12
    current_page = min(max(page, 1), total_pages)
    text = (
        "Il presente contratto stabilisce che il pagamento deve avvenire entro 30 giorni dalla "
        "data di emissione fattura. In caso di ritardo superiore a 45 giorni si applica una penale "
        "del 2% sull'importo residuo."
    )
    highlights = ["pagamento", "30 giorni", "penale", "45 giorni", "2%"]
    return ViewerPageResponse(
        document_id=doc.id,
        document_name=doc.name,
        page=current_page,
        total_pages=total_pages,
        text=text,
        highlights=highlights,
    )
