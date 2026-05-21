import "@testing-library/jest-dom";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(() => Promise.resolve({})),
}));

vi.mock("@tauri-apps/api/event", () => ({
  listen: vi.fn(() => Promise.resolve(() => {})),
}));

vi.mock("../services/tauri", () => ({
  invoke: vi.fn(() => Promise.resolve({})),
  listen: vi.fn(() => Promise.resolve(() => {})),
  isTauri: vi.fn(() => false),
  getCurrentWindow: vi.fn(() => Promise.resolve(null)),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...(actual as object),
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: "/", search: "", hash: "", state: null, key: "default" }),
  };
});

// Mock HTMLDialogElement for ConfirmDialog
class MockDialog {
  showModal = vi.fn();
  close = vi.fn();
  show = vi.fn();
}

globalThis.HTMLDialogElement = MockDialog as unknown as typeof HTMLDialogElement;

const originalCreateElement = document.createElement.bind(document);
document.createElement = ((tagName: string, options?: ElementCreationOptions) => {
  if (tagName.toLowerCase() === "dialog") {
    const el = originalCreateElement(tagName, options);
    el.showModal = vi.fn();
    el.close = vi.fn();
    el.show = vi.fn();
    return el;
  }
  return originalCreateElement(tagName, options);
}) as typeof document.createElement;
