import os
from pathlib import Path

import pytest
import requests


# Modules covered: health, modes, documents/upload, indexing lifecycle, chat, viewer.


def _read_frontend_backend_url() -> str | None:
    env_url = os.environ.get("REACT_APP_BACKEND_URL")
    if env_url:
        return env_url.strip()

    env_path = Path("/app/frontend/.env")
    if not env_path.exists():
        return None

    for line in env_path.read_text().splitlines():
        if line.startswith("REACT_APP_BACKEND_URL="):
            return line.split("=", 1)[1].strip()
    return None


@pytest.fixture(scope="session")
def base_url() -> str:
    raw_backend_url = _read_frontend_backend_url()
    if not raw_backend_url:
        pytest.skip("REACT_APP_BACKEND_URL missing")

    if raw_backend_url.startswith("/"):
        preview_endpoint = os.environ.get("preview_endpoint")
        if not preview_endpoint:
            pytest.skip("preview_endpoint missing for relative backend URL")
        return f"{preview_endpoint.rstrip('/')}{raw_backend_url}"

    return raw_backend_url.rstrip("/")


@pytest.fixture()
def api_client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


def test_health_ok(api_client, base_url):
    response = api_client.get(f"{base_url}/health", timeout=20)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "smot-api"


def test_modes_get_contains_active_mode(api_client, base_url):
    response = api_client.get(f"{base_url}/modes", timeout=20)
    assert response.status_code == 200
    data = response.json()
    assert data["active_mode"] in data["available_modes"]


def test_modes_put_valid_and_invalid(api_client, base_url):
    valid = api_client.put(f"{base_url}/modes", json={"mode": "Lite"}, timeout=20)
    assert valid.status_code == 200
    valid_data = valid.json()
    assert valid_data["active_mode"] == "Lite"

    invalid = api_client.put(f"{base_url}/modes", json={"mode": "Ultra"}, timeout=20)
    assert invalid.status_code == 400
    invalid_data = invalid.json()
    assert "detail" in invalid_data


def test_documents_list_structure(api_client, base_url):
    response = api_client.get(f"{base_url}/documents", timeout=20)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    first = data[0]
    assert isinstance(first["id"], str)
    assert isinstance(first["name"], str)
    assert isinstance(first["indexed"], bool)


def test_upload_requires_files(api_client, base_url):
    response = api_client.post(
        f"{base_url}/documents/upload",
        json={"files": [], "category": "Lavoro"},
        timeout=20,
    )
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "No files provided"


def test_upload_then_get_persistence(api_client, base_url):
    upload_response = api_client.post(
        f"{base_url}/documents/upload",
        json={"files": ["TEST_contract_alpha.pdf"], "category": "Lavoro"},
        timeout=20,
    )
    assert upload_response.status_code == 200
    upload_data = upload_response.json()
    uploaded = upload_data["uploaded_documents"][0]
    assert uploaded["name"] == "TEST_contract_alpha.pdf"
    assert uploaded["category"] == "Lavoro"

    list_response = api_client.get(f"{base_url}/documents", timeout=20)
    assert list_response.status_code == 200
    docs = list_response.json()
    found = next((doc for doc in docs if doc["id"] == uploaded["id"]), None)
    assert found is not None
    assert found["name"] == "TEST_contract_alpha.pdf"


def test_indexing_start_status_pause_resume_background(api_client, base_url):
    docs_response = api_client.get(f"{base_url}/documents", timeout=20)
    assert docs_response.status_code == 200
    docs = docs_response.json()
    assert len(docs) > 0

    selected_ids = [docs[0]["id"]]
    start_response = api_client.post(
        f"{base_url}/indexing/start",
        json={"document_ids": selected_ids},
        timeout=20,
    )
    assert start_response.status_code == 200
    job_id = start_response.json()["job_id"]
    assert isinstance(job_id, str)

    status_response = api_client.get(f"{base_url}/indexing/status/{job_id}", timeout=20)
    assert status_response.status_code == 200
    status_data = status_response.json()
    assert status_data["job_id"] == job_id
    assert isinstance(status_data["files"], list)

    pause_response = api_client.post(f"{base_url}/indexing/pause/{job_id}", timeout=20)
    assert pause_response.status_code == 200
    assert pause_response.json()["status"] == "paused"

    resume_response = api_client.post(f"{base_url}/indexing/resume/{job_id}", timeout=20)
    assert resume_response.status_code == 200
    assert resume_response.json()["status"] == "running"

    background_response = api_client.post(f"{base_url}/indexing/background/{job_id}", timeout=20)
    assert background_response.status_code == 200
    assert background_response.json()["status"] == "background"


def test_indexing_start_with_invalid_document_returns_404(api_client, base_url):
    response = api_client.post(
        f"{base_url}/indexing/start",
        json={"document_ids": ["not-real-id"]},
        timeout=20,
    )
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "No valid documents selected"


def test_chat_query_returns_answer_and_sources(api_client, base_url):
    response = api_client.post(
        f"{base_url}/chat/query",
        json={"question": "Quali sono i termini di pagamento?", "filter_category": "Tutti"},
        timeout=20,
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data["answer"], str)
    assert len(data["answer"]) > 0
    assert isinstance(data["sources"], list)
    assert len(data["sources"]) > 0
    first = data["sources"][0]
    assert isinstance(first["document_id"], str)
    assert isinstance(first["page"], int)


def test_viewer_page_returns_highlights(api_client, base_url):
    docs_response = api_client.get(f"{base_url}/documents", timeout=20)
    assert docs_response.status_code == 200
    doc_id = docs_response.json()[0]["id"]

    viewer_response = api_client.get(f"{base_url}/viewer/{doc_id}/page/2", timeout=20)
    assert viewer_response.status_code == 200
    data = viewer_response.json()
    assert data["document_id"] == doc_id
    assert data["page"] == 2
    assert data["total_pages"] >= 2
    assert isinstance(data["highlights"], list)
    assert "pagamento" in [term.lower() for term in data["highlights"]]


def test_viewer_missing_document_returns_404(api_client, base_url):
    response = api_client.get(f"{base_url}/viewer/not-found-id/page/1", timeout=20)
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Document not found"
