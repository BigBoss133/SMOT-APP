import { describe, it, expect, vi, beforeEach } from "vitest";
import { getOllamaStatus, pullModel, checkDiskSpace, OllamaStatus } from "../../services/ollama";
import { invoke } from "../../services/tauri";

vi.mock("../../services/tauri", () => ({
  invoke: vi.fn(),
}));

describe("ollama service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getOllamaStatus", () => {
    it("should call invoke with get_ollama_status command", async () => {
      const mockStatus: OllamaStatus = {
        installed: true,
        version: "0.1.27",
        running: true,
        models: ["llama3"],
        error: null,
      };

      vi.mocked(invoke).mockResolvedValueOnce(mockStatus);

      const result = await getOllamaStatus();

      expect(invoke).toHaveBeenCalledTimes(1);
      expect(invoke).toHaveBeenCalledWith("get_ollama_status");
      expect(result).toEqual(mockStatus);
    });

    it("should propagate errors from invoke", async () => {
      const error = new Error("Tauri invoke failed");
      vi.mocked(invoke).mockRejectedValueOnce(error);

      await expect(getOllamaStatus()).rejects.toThrow("Tauri invoke failed");
    });
  });

  describe("pullModel", () => {
    it("should call invoke with pull_ollama_model command and model parameter", async () => {
      vi.mocked(invoke).mockResolvedValueOnce(undefined);

      await pullModel("llama3");

      expect(invoke).toHaveBeenCalledTimes(1);
      expect(invoke).toHaveBeenCalledWith("pull_ollama_model", { model: "llama3" });
    });

    it("should propagate errors from invoke", async () => {
      const error = new Error("Failed to pull model");
      vi.mocked(invoke).mockRejectedValueOnce(error);

      await expect(pullModel("llama3")).rejects.toThrow("Failed to pull model");
    });
  });

  describe("checkDiskSpace", () => {
    it("should call invoke with check_disk_space command and minGb parameter", async () => {
      vi.mocked(invoke).mockResolvedValueOnce(true);

      const result = await checkDiskSpace(10);

      expect(invoke).toHaveBeenCalledTimes(1);
      expect(invoke).toHaveBeenCalledWith("check_disk_space", { minGb: 10 });
      expect(result).toBe(true);
    });

    it("should return false when disk space check fails", async () => {
      vi.mocked(invoke).mockResolvedValueOnce(false);

      const result = await checkDiskSpace(1000);

      expect(invoke).toHaveBeenCalledTimes(1);
      expect(invoke).toHaveBeenCalledWith("check_disk_space", { minGb: 1000 });
      expect(result).toBe(false);
    });

    it("should propagate errors from invoke", async () => {
      const error = new Error("Failed to check disk space");
      vi.mocked(invoke).mockRejectedValueOnce(error);

      await expect(checkDiskSpace(10)).rejects.toThrow("Failed to check disk space");
    });
  });
});
