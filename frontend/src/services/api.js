import axios from 'axios';

const baseURL = process.env.REACT_APP_BACKEND_URL;

if (!baseURL) {
  throw new Error('REACT_APP_BACKEND_URL is required');
}

const client = axios.create({
  baseURL,
  timeout: 12000,
});

export const getSystemStatus = async () => {
  const response = await client.get('/api/system/status');
  return response.data;
};

export const getModes = async () => {
  const response = await client.get('/api/modes');
  return response.data;
};

export const updateMode = async (mode) => {
  const response = await client.put('/api/modes', { mode });
  return response.data;
};

export const getDocuments = async () => {
  const response = await client.get('/api/documents');
  return response.data;
};

export const uploadDocuments = async (files, category = 'Lavoro') => {
  const response = await client.post('/api/documents/upload', {
    files,
    category,
  });
  return response.data;
};

export const startIndexing = async (documentIds) => {
  const response = await client.post('/api/indexing/start', {
    document_ids: documentIds,
  });
  return response.data;
};

export const getIndexingStatus = async (jobId) => {
  const response = await client.get(`/api/indexing/status/${jobId}`);
  return response.data;
};

export const pauseIndexing = async (jobId) => {
  const response = await client.post(`/api/indexing/pause/${jobId}`);
  return response.data;
};

export const resumeIndexing = async (jobId) => {
  const response = await client.post(`/api/indexing/resume/${jobId}`);
  return response.data;
};

export const continueInBackground = async (jobId) => {
  const response = await client.post(`/api/indexing/background/${jobId}`);
  return response.data;
};

export const sendQuestion = async (question, filterCategory = 'Tutti') => {
  const response = await client.post('/api/chat/query', {
    question,
    filter_category: filterCategory,
  });
  return response.data;
};

export const getViewerPage = async (documentId, page) => {
  const response = await client.get(`/api/viewer/${documentId}/page/${page}`);
  return response.data;
};
