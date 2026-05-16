import { useCallback } from "react";
import { invoke, getCurrentWindow, isTauri } from "../services/tauri";

interface WindowControls {
  minimizeToTray: () => Promise<void>;
  minimize: () => Promise<void>;
  close: () => Promise<void>;
  toggleFullscreen: () => Promise<void>;
}

export function useWindowControls(): WindowControls {
  const minimizeToTray = useCallback(async () => {
    if (!isTauri()) return;
    try {
      await invoke("open_dev_tools");
    } catch {
      try {
        const win = await getCurrentWindow();
        if (!win) return;
        await win.hide();
      } catch {
        // Not in Tauri; no-op
      }
    }
  }, []);

  const minimize = useCallback(async () => {
    if (!isTauri()) return;
    try {
      const win = await getCurrentWindow();
      if (!win) return;
      await win.minimize();
    } catch {
      // Not in Tauri; no-op
    }
  }, []);

  const close = useCallback(async () => {
    if (!isTauri()) return;
    try {
      const win = await getCurrentWindow();
      if (!win) return;
      await win.close();
    } catch {
      window.close();
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!isTauri()) return;
    try {
      const win = await getCurrentWindow();
      if (!win) return;
      const isFullscreen = await win.isFullscreen();
      if (isFullscreen) {
        await win.setFullscreen(false);
      } else {
        await win.setFullscreen(true);
      }
    } catch {
      // Not in Tauri; no-op
    }
  }, []);

  return { minimizeToTray, minimize, close, toggleFullscreen };
}
