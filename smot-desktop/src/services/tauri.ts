type TauriEventModule = typeof import("@tauri-apps/api/event");
type TauriCoreModule = typeof import("@tauri-apps/api/core");
type TauriWindowModule = typeof import("@tauri-apps/api/window");

let eventModule: TauriEventModule | null = null;
let coreModule: TauriCoreModule | null = null;
let windowModule: TauriWindowModule | null = null;

function isTauri(): boolean {
  try {
    return !!(window as unknown as Record<string, unknown>).__TAURI_INTERNALS__;
  } catch {
    return false;
  }
}

async function getEvent(): Promise<TauriEventModule | null> {
  if (!isTauri()) return null;
  if (!eventModule) {
    eventModule = await import("@tauri-apps/api/event");
  }
  return eventModule;
}

async function getCore(): Promise<TauriCoreModule | null> {
  if (!isTauri()) return null;
  if (!coreModule) {
    coreModule = await import("@tauri-apps/api/core");
  }
  return coreModule;
}

async function getWindow(): Promise<TauriWindowModule | null> {
  if (!isTauri()) return null;
  if (!windowModule) {
    windowModule = await import("@tauri-apps/api/window");
  }
  return windowModule;
}

export async function listen<T = unknown>(
  event: string,
  handler: (payload: T) => void,
): Promise<() => void> {
  const mod = await getEvent();
  if (!mod) return () => {};
  return mod.listen(event, (e: { payload: T }) => handler(e.payload));
}

export async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  const mod = await getCore();
  if (!mod) throw new Error("Not in Tauri environment");
  return mod.invoke<T>(cmd, args);
}

export async function getCurrentWindow() {
  const mod = await getWindow();
  if (!mod) return null;
  return mod.getCurrentWindow();
}

export { isTauri };
