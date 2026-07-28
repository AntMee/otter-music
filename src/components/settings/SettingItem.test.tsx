import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Volume2 } from "lucide-react";

import { SettingItem } from "./SettingItem";

describe("SettingItem", () => {
  let root: Root | undefined;
  let container: HTMLDivElement | undefined;

  beforeEach(() => {
    (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
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

  it("uses a contrast foreground icon inside the setting icon surface", () => {
    act(() => {
      root?.render(<SettingItem icon={Volume2} title="Volume" />);
    });

    const iconSurface = Array.from(
      container?.querySelectorAll("div") ?? []
    ).find((element) => element.className.includes("min-w-9"));
    const icon = iconSurface?.querySelector("svg");

    expect(iconSurface).toBeDefined();
    expect(iconSurface?.className).toContain("bg-primary");
    expect(icon?.className.baseVal).toContain("text-primary-foreground");
  });
});
