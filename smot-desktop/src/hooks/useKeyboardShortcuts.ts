import { useEffect } from "react";

interface KeyboardShortcuts {
  onSearchFocus?: () => void;
  onHelpOpen?: () => void;
  onNavigateHome?: () => void;
}

export function useKeyboardShortcuts({ onSearchFocus, onHelpOpen, onNavigateHome }: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K: focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        onSearchFocus?.();
      }
      // Escape: go home or close dialog
      if (e.key === "Escape") {
        onNavigateHome?.();
      }
      // ?: open help
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        onHelpOpen?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onSearchFocus, onHelpOpen, onNavigateHome]);
}
