import { describe, it, expect } from "vitest";
import { getSystemStatus } from "./api";

describe("api services", () => {
  it("getSystemStatus should return fallback system status when not in Tauri environment", async () => {
    const status = await getSystemStatus();
    expect(status).toEqual({
      offline_secure: true,
      ram_used_gb: 6.4,
      ram_total_gb: 16,
      cpu_percent: 22,
      gpu_percent: 14,
      documents_total: 3,
      documents_indexed: 2,
      storage_total_gb: 512,
      active_model: "llama3.1:8b",
    });
  });
});
