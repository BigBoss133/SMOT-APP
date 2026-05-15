import { useCallback } from "react";

interface WindowControls {
  minimizeToTray: () => Promise<void>;
  minimize: () => Promise<void>;
  close: () => Promise<void>;
  toggleFullscreen: () => Promise<void>;
}

export function useWindowControls(): WindowControls {
  const minimizeToTray = useCallback(async () => {
    try {
      // @ts-ignore
      if (window.__TAURI_INTERNALS__) {
        const tauriCore = await import("@tauri-apps/api/core");
        await tauriCore.invoke("open_dev_tools");
      }
    } catch {
      try {
        // @ts-ignore
        if (!window.__TAURI_INTERNALS__) return;
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
      // @ts-ignore
      if (!window.__TAURI_INTERNALS__) return;
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      const win = getCurrentWindow();
      await win.minimize();
    } catch {
      // Not in Tauri; no-op
    }
  }, []);

  const close = useCallback(async () => {
    try {
      // @ts-ignore
      if (!window.__TAURI_INTERNALS__) return;
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      const win = getCurrentWindow();
      await win.close();
    } catch {
      window.close();
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      // @ts-ignore
      if (!window.__TAURI_INTERNALS__) return;
      const { getCurrentWindow } = await import(/* @vite-ignore */ "@tauri-apps/api/window");
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
