import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";

import { MinePage } from "./MinePage";

vi.mock("@/lib/storage-adapter", () => ({
  idbStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

vi.mock("@/hooks/use-active-playlists", () => ({
  useActivePlaylists: vi.fn(() => []),
}));

vi.mock("@/hooks/use-network-status", () => ({
  useNetworkStatus: vi.fn(() => true),
}));

vi.mock("@/hooks/use-offline-playlist", () => ({
  useOfflinePlaylist: vi.fn(() => []),
}));

vi.mock("@/components/PlaylistImportDrawer", () => ({
  PlaylistImportDrawer: () => null,
}));

describe("MinePage", () => {
  let root: Root | undefined;
  let container: HTMLDivElement | undefined;

  beforeEach(() => {
    (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    vi.clearAllMocks();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => root?.unmount());
    }
    container?.remove();
    root = undefined;
    container = undefined;
  });

  it("uses contrast foreground icons for the mine shortcut cards", () => {
    act(() => {
      root?.render(
        <MemoryRouter>
          <MinePage onSelectPlaylist={vi.fn()} />
        </MemoryRouter>
      );
    });

    const shortcutButtons = Array.from(
      container?.querySelectorAll("button") ?? []
    ).slice(0, 4);

    expect(shortcutButtons).toHaveLength(4);
    shortcutButtons.forEach((button) => {
      const iconSurface = Array.from(button.querySelectorAll("div")).find(
        (element) => element.className.includes("bg-primary")
      );
      const icon = button.querySelector("svg");

      expect(iconSurface).toBeDefined();
      expect(icon?.className.baseVal).toContain("text-primary-foreground");
    });
  });
});
