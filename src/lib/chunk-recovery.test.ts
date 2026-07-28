import { describe, expect, it, vi } from "vitest";
import { recoverFromChunkLoadError } from "./chunk-recovery";

describe("recoverFromChunkLoadError", () => {
  it("unregisters every service worker before reloading the page", async () => {
    const unregisterFirst = vi.fn().mockResolvedValue(true);
    const unregisterSecond = vi.fn().mockResolvedValue(true);
    const reload = vi.fn();

    await recoverFromChunkLoadError({
      getRegistrations: async () => [
        { unregister: unregisterFirst },
        { unregister: unregisterSecond },
      ],
      reload,
    });

    expect(unregisterFirst).toHaveBeenCalledOnce();
    expect(unregisterSecond).toHaveBeenCalledOnce();
    expect(reload).toHaveBeenCalledOnce();
    expect(unregisterFirst.mock.invocationCallOrder[0]).toBeLessThan(
      reload.mock.invocationCallOrder[0]
    );
  });

  it("still reloads when service workers are unavailable", async () => {
    const reload = vi.fn();

    await recoverFromChunkLoadError({ reload });

    expect(reload).toHaveBeenCalledOnce();
  });
});
