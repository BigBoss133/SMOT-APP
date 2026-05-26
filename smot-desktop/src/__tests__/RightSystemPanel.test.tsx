import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RightSystemPanel } from "../components/RightSystemPanel";
import type { SystemStatus } from "../types";

describe("RightSystemPanel", () => {
  const mockStatus: SystemStatus = {
    offline_secure: true,
    ram_used_gb: 16,
    ram_total_gb: 32,
    cpu_percent: 45,
    gpu_percent: 60,
    documents_total: 1500,
    documents_indexed: 1450,
    storage_total_gb: 50,
    active_model: "llama-3-8b"
  };

  it("renders correctly with status data", () => {
    render(<RightSystemPanel status={mockStatus} />);

    // System Info Card
    expect(screen.getByTestId("system-status-title")).toBeInTheDocument();
    expect(screen.getByTestId("offline-security-badge")).toHaveTextContent("Offline sicuro");
    expect(screen.getByTestId("metric-value-ram")).toHaveTextContent("RAM 16/32 GB");
    expect(screen.getByTestId("metric-value-cpu")).toHaveTextContent("CPU 45%");
    expect(screen.getByTestId("metric-value-gpu")).toHaveTextContent("GPU 60%");

    // Document Summary Card
    expect(screen.getByTestId("document-summary-total")).toHaveTextContent("1500 documenti");
    expect(screen.getByTestId("document-summary-indexed")).toHaveTextContent("Indicizzati: 1450");
    expect(screen.getByTestId("document-summary-storage")).toHaveTextContent("Spazio: 50 GB");

    // Model Status Card
    expect(screen.getByTestId("model-status-value")).toHaveTextContent("llama-3-8b");
  });

  it("renders fallback data when status is null", () => {
    render(<RightSystemPanel status={null} />);

    expect(screen.getByTestId("offline-security-badge")).toHaveTextContent("Verifica offline");
    expect(screen.getByTestId("metric-value-ram")).toHaveTextContent("RAM 0/0 GB");
    expect(screen.getByTestId("metric-value-cpu")).toHaveTextContent("CPU 0%");
    expect(screen.getByTestId("metric-value-gpu")).toHaveTextContent("GPU 0%");

    expect(screen.getByTestId("document-summary-total")).toHaveTextContent("0 documenti");
    expect(screen.getByTestId("document-summary-indexed")).toHaveTextContent("Indicizzati: 0");
    expect(screen.getByTestId("document-summary-storage")).toHaveTextContent("Spazio: 0 GB");

    expect(screen.getByTestId("model-status-value")).toHaveTextContent("—");
  });

  it("renders correct text when offline_secure is false", () => {
    render(<RightSystemPanel status={{ ...mockStatus, offline_secure: false }} />);
    expect(screen.getByTestId("offline-security-badge")).toHaveTextContent("Verifica offline");
  });
});
