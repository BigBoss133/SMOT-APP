import { Cpu, HardDrive, MemoryStick, ShieldCheck } from "lucide-react";
import type { SystemStatus } from "../types";

interface RightSystemPanelProps {
  status: SystemStatus | null;
}

export const RightSystemPanel = ({ status }: RightSystemPanelProps) => {
  return (
    <aside className="right-sidebar" data-testid="right-system-sidebar">
      <div className="panel-card" data-testid="system-status-card">
        <div className="panel-head">
          <p data-testid="system-status-title">System Info</p>
          <ShieldCheck size={16} />
        </div>
        <p className="badge-offline" data-testid="offline-security-badge">
          ✓ {status?.offline_secure ? "Offline sicuro" : "Verifica offline"}
        </p>
        <div className="metric-row" data-testid="metric-row-ram">
          <MemoryStick size={14} />
          <span data-testid="metric-value-ram">
            RAM {status?.ram_used_gb ?? 0}/{status?.ram_total_gb ?? 0} GB
          </span>
        </div>
        <div className="metric-row" data-testid="metric-row-cpu">
          <Cpu size={14} />
          <span data-testid="metric-value-cpu">CPU {status?.cpu_percent ?? 0}%</span>
        </div>
        <div className="metric-row" data-testid="metric-row-gpu">
          <HardDrive size={14} />
          <span data-testid="metric-value-gpu">GPU {status?.gpu_percent ?? 0}%</span>
        </div>
      </div>

      <div className="panel-card" data-testid="document-summary-card">
        <p className="card-label" data-testid="document-summary-title">
          Archivio
        </p>
        <p className="card-value" data-testid="document-summary-total">
          {status?.documents_total ?? 0} documenti
        </p>
        <p className="card-muted" data-testid="document-summary-indexed">
          Indicizzati: {status?.documents_indexed ?? 0}
        </p>
        <p className="card-muted" data-testid="document-summary-storage">
          Spazio: {status?.storage_total_gb ?? 0} GB
        </p>
      </div>

      <div className="panel-card" data-testid="model-status-card">
        <p className="card-label" data-testid="model-status-title">
          Modello locale
        </p>
        <p className="card-value" data-testid="model-status-value">
          {status?.active_model ?? "—"}
        </p>
      </div>
    </aside>
  );
};
