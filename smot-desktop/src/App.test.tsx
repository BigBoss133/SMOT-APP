import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import * as api from './services/api';
import { vi, describe, it, expect, beforeEach, beforeAll, type Mock } from 'vitest';

// Mock dialog functions to avoid issues with ConfirmDialog
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

vi.mock('./services/api', () => ({
  getDocuments: vi.fn(),
  getSystemStatus: vi.fn(),
  getModes: vi.fn(),
  updateMode: vi.fn(),
  uploadDocuments: vi.fn(),
  startIndexing: vi.fn(),
}));

const mockApi = api as unknown as {
  getDocuments: Mock;
  getSystemStatus: Mock;
  getModes: Mock;
  updateMode: Mock;
  uploadDocuments: Mock;
  startIndexing: Mock;
};

vi.mock('./services/tauri', () => ({
  invoke: vi.fn().mockResolvedValue({ status: 'active' }),
  listen: vi.fn().mockResolvedValue(() => {}),
  isTauri: vi.fn().mockReturnValue(true),
}));

describe('App Component - Error Handling in refreshDocuments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets documents to an empty array when getDocuments fails during refresh', async () => {
    // Return empty array instead of throwing when rendering initially
    mockApi.getDocuments.mockResolvedValueOnce([
      { id: '1', name: 'Test Doc', indexed: true, size_kb: 10, pages: 1 }
    ]);
    mockApi.getSystemStatus.mockResolvedValue({ offline_secure: true });
    mockApi.getModes.mockResolvedValue({ active_mode: 'Balanced', available_modes: ['Balanced'] });

    render(
      <MemoryRouter initialEntries={['/upload']}>
        <LanguageProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </LanguageProvider>
      </MemoryRouter>
    );

    // Initial state: We should see that StatusBar says there are 1 documents indexed (or total)
    await waitFor(() => {
      expect(screen.getByTestId('statusbar-documents')).toHaveTextContent('1');
    });

    // Wait for the upload page to render
    const input = await screen.findByTestId('upload-file-picker-input');

    // Pick a file to upload
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    await userEvent.upload(input, file);

    // Mock the responses for the upload process
    mockApi.uploadDocuments.mockResolvedValueOnce({
      uploaded_documents: [{ id: '2', name: 'hello.png' }]
    });
    mockApi.startIndexing.mockResolvedValueOnce({ job_id: 'job-1' });

    // IMPORTANT: Make the next getDocuments call (triggered by refreshDocuments) throw an error!
    mockApi.getDocuments.mockRejectedValueOnce(new Error('Failed to fetch documents'));

    // Let's also mock the polling `getSystemStatus` so it doesn't crash
    mockApi.getSystemStatus.mockResolvedValue({ offline_secure: true });

    // Trigger upload + index
    const startBtn = await screen.findByTestId('upload-start-indexing-button');
    await userEvent.click(startBtn);

    // The UI should catch the error and set documents to []
    // Wait for the StatusBar to update to 0/0.
    await waitFor(() => {
      const statusBarDocText = screen.getByTestId('statusbar-documents').textContent;
      expect(statusBarDocText).toMatch(/0\/0/);
    });
  });
});
