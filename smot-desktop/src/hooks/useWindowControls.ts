import { useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

interface WindowControls {
  minimizeToTray: () => Promise<void>;
  minimize: () => Promise<void>;
  close: () => Promise<void>;
  toggleFullscreen: () => Promise<void>;
}

export function useWindowControls(): WindowControls {
  const minimizeToTray = useCallback(async () => {
    try {
      await invoke("minimize_to_tray");
    } catch {
      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        const win = getCurrentWindow();
        await win.hide();
      } catch {
        // Not in Tauri; no-op
      }
    }
  }, []);

  const minimize = useCallback(async () => {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      const win = getCurrentWindow();
      await win.minimize();
    } catch {
      // Not in Tauri; no-op
    }
  }, []);

  const close = useCallback(async () => {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      const win = getCurrentWindow();
      await win.close();
    } catch {
      window.close();
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      const win = getCurrentWindow();
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
