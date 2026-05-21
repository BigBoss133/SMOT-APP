import { useEffect, useState } from "react";
import { Cpu, HardDrive, Monitor, Sparkles } from "lucide-react";

interface SystemProfile {
  cpu_cores: number;
  ram_total_gb: number;
  ram_available_gb: number;
  gpu_name: string | null;
  gpu_vram_gb: number | null;
  is_unified_memory: boolean;
  os_name: string;
}

interface SystemDiscoveryStepProps {
  profile: SystemProfile | null;
  tier: string;
  t: {
    scanTitle: string;
    scanCpu: string;
    scanRam: string;
    scanGpu: string;
    scanTier: string;
  };
}

const tierColors: Record<string, { bg: string; text: string }> = {
  Premium: { bg: "#4338f5", text: "#ffffff" },
  Standard: { bg: "#6b7280", text: "#ffffff" },
  Essential: { bg: "#f59e0b", text: "#000000" },
  Minimal: { bg: "#9ca3af", text: "#000000" },
};

export function SystemDiscoveryStep({ profile, tier, t }: SystemDiscoveryStepProps) {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const [showTier, setShowTier] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setVisibleItems([0]), 800));
    timers.push(setTimeout(() => setVisibleItems([0, 1]), 1600));
    timers.push(setTimeout(() => setVisibleItems([0, 1, 2]), 2400));
    timers.push(setTimeout(() => {
      setVisibleItems([0, 1, 2, 3]);
      setShowTier(true);
    }, 3200));

    return () => timers.forEach(clearTimeout);
  }, []);

  const items = [
    {
      icon: <Cpu size={20} />,
      text: `✅ ${t.scanCpu} — ${profile?.cpu_cores ?? "verificato!"}`,
    },
    {
      icon: <HardDrive size={20} />,
      text: `✅ ${profile?.ram_total_gb ?? "8"} GB ${t.scanRam} — spazio per tutto`,
    },
    {
      icon: <Monitor size={20} />,
      text: profile?.is_unified_memory
        ? `✅ Memoria Unificata — ${profile?.ram_available_gb ?? "?"} GB disponibili di ${profile?.ram_total_gb ?? "?"} GB totali`
        : `✅ ${profile?.gpu_name ?? "Nessuna GPU dedicata"} — ${profile?.gpu_vram_gb ? `${profile.gpu_vram_gb}GB VRAM` : "modalità CPU"}`,
    },
    {
      icon: <Sparkles size={20} />,
      text: `${t.scanTier} ${tier}`,
    },
  ];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{t.scanTitle}</h2>
      <div style={styles.itemsContainer}>
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              ...styles.item,
              ...(visibleItems.includes(index) ? styles.itemVisible : {}),
              ...(index === 3 && showTier ? styles.tierItem : {}),
            }}
          >
            <span
              style={{
                ...styles.icon,
                ...(index === 3 ? styles.tierIcon : {}),
              }}
            >
              {item.icon}
            </span>
            <span style={styles.text}>{item.text}</span>
            {index === 3 && showTier && (
              <span
                style={{
                  ...styles.tierBadge,
                  background: tierColors[tier]?.bg ?? tierColors.Minimal.bg,
                  color: tierColors[tier]?.text ?? tierColors.Minimal.text,
                }}
              >
                {tier}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "32px",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#ffffff",
    textAlign: "center",
  },
  itemsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    width: "100%",
    maxWidth: "400px",
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px 20px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    opacity: 0,
    transform: "translateY(10px)",
    transition: "opacity 400ms ease, transform 400ms ease",
  },
  itemVisible: {
    opacity: 1,
    transform: "translateY(0)",
  },
  tierItem: {
    background: "rgba(67, 56, 245, 0.15)",
    border: "1px solid rgba(67, 56, 245, 0.3)",
  },
  icon: {
    color: "rgba(255,255,255,0.7)",
    display: "flex",
    alignItems: "center",
  },
  tierIcon: {
    color: "#4338f5",
  },
  text: {
    color: "#ffffff",
    fontSize: "0.95rem",
    flex: 1,
  },
  tierBadge: {
    padding: "4px 12px",
    borderRadius: "9999px",
    fontSize: "0.8rem",
    fontWeight: 700,
  },
};

