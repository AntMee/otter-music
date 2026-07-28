import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { FavoritesView } from "./FavoritesView";

vi.mock("@/lib/storage-adapter", () => ({
  idbStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

vi.mock("@/components/MusicTrackList", () => ({
  MusicTrackList: () => <div data-testid="music-track-list" />,
}));

vi.mock("@/components/PlaylistOperations", () => ({
  PlaylistOperations: () => <button type="button">operations</button>,
}));

vi.mock("@/components/AddByUrlDrawer", () => ({
  AddByUrlDrawer: () => null,
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/utils/toast", () => ({
  toastUtils: {
    info: vi.fn(),
  },
}));

describe("FavoritesView", () => {
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

  it("uses a contrast foreground icon for the favorites cover placeholder", () => {
    act(() => {
      root?.render(<FavoritesView tracks={[]} onPlay={vi.fn()} />);
    });

    const coverSurface = Array.from(
      container?.querySelectorAll("div") ?? []
    ).find((element) => element.className.includes("min-w-20"));
    const icon = coverSurface?.querySelector("svg");

    expect(coverSurface).toBeDefined();
    expect(coverSurface?.className).toContain("bg-primary");
    expect(icon?.className.baseVal).toContain("text-primary-foreground");
  });
});
