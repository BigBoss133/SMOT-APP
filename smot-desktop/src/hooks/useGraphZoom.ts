import { useCallback, useRef, useState } from 'react';

export interface ZoomState {
  scale: number;
  x: number;
  y: number;
}

export function useGraphZoom(initialScale = 1) {
  const [zoom, setZoom] = useState<ZoomState>({ scale: initialScale, x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ mx: 0, my: 0, zx: 0, zy: 0 });

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => {
      const factor = e.deltaY < 0 ? 1.12 : 0.9;
      const newScale = Math.min(4, Math.max(0.1, prev.scale * factor));
      return { ...prev, scale: newScale };
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isPanning.current = true;
    setZoom(prev => {
      panStart.current = { mx: e.clientX, my: e.clientY, zx: prev.x, zy: prev.y };
      return prev;
    });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    setZoom(prev => ({
      ...prev,
      x: panStart.current.zx + e.clientX - panStart.current.mx,
      y: panStart.current.zy + e.clientY - panStart.current.my,
    }));
  }, []);

  const handleMouseUp = useCallback(() => { isPanning.current = false; }, []);

  const zoomIn = useCallback(() => setZoom(p => ({ ...p, scale: Math.min(4, p.scale * 1.25) })), []);
  const zoomOut = useCallback(() => setZoom(p => ({ ...p, scale: Math.max(0.1, p.scale * 0.8) })), []);
  const resetView = useCallback(() => setZoom({ scale: 1, x: 0, y: 0 }), []);

  return { zoom, handleWheel, handleMouseDown, handleMouseMove, handleMouseUp, zoomIn, zoomOut, resetView };
}
