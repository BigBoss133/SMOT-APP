import { describe, it, expect, vi, beforeEach } from "vitest";
import { startIndexing, getIndexingStatus } from "../api";

// Mock the tauri utility so we trigger the fallback logic
vi.mock("../tauri", () => ({
  invoke: vi.fn(),
  isTauri: vi.fn(() => false),
}));

describe("api services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("startIndexing", () => {
    it("handles an empty document array correctly", async () => {
      const response = await startIndexing([]);
      expect(response).toHaveProperty("job_id");

      const status = await getIndexingStatus(response.job_id);
      expect(status.total_documents).toBe(0);
      expect(status.total_kb).toBe(0);
      expect(status.files).toHaveLength(0);
    });
  });
});
