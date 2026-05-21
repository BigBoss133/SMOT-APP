import { memo } from "react";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  count?: number;
  variant?: "text" | "rect" | "circle";
  style?: React.CSSProperties;
}

function Skeleton({
  width = "100%",
  height = 16,
  count = 1,
  variant = "text",
  style,
}: SkeletonProps) {
  const baseStyle: React.CSSProperties = {
    background: "linear-gradient(90deg, #eceffd 25%, #f5f6ff 50%, #eceffd 75%)",
    backgroundSize: "200% 100%",
    animation: "skeleton-shimmer 1.4s ease infinite",
    borderRadius: variant === "circle" ? "50%" : variant === "rect" ? "8px" : "4px",
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    display: "block",
    ...style,
  };

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="skeleton-pulse"
          style={baseStyle}
          data-testid={`skeleton-${variant}-${i}`}
        />
      ))}
    </>
  );
}

export default memo(Skeleton);
