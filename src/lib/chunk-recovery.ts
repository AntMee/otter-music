interface ServiceWorkerRegistrationLike {
  unregister(): Promise<boolean>;
}

interface ChunkRecoveryOptions {
  getRegistrations?: () => Promise<readonly ServiceWorkerRegistrationLike[]>;
  reload?: () => void;
}

/** Remove a stale app worker without touching IndexedDB, then load a fresh module graph. */
export async function recoverFromChunkLoadError(
  options: ChunkRecoveryOptions = {}
): Promise<void> {
  const getRegistrations =
    options.getRegistrations ??
    (typeof navigator !== "undefined" && "serviceWorker" in navigator
      ? () => navigator.serviceWorker.getRegistrations()
      : undefined);
  const reload = options.reload ?? (() => window.location.reload());

  try {
    const registrations = await getRegistrations?.();
    await Promise.all(
      registrations?.map((registration) => registration.unregister()) ?? []
    );
  } finally {
    reload();
  }
}
