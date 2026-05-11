import {
  HashFormatError,
  decodeShareHash,
  encodeShareHash,
  type SharedState,
} from "@phpolygon/shader-gen-core";

export function readHash(): SharedState | null {
  if (!location.hash || location.hash === "#") return null;
  try {
    return decodeShareHash(location.hash);
  } catch (err) {
    if (err instanceof HashFormatError) {
      console.warn("[share] discarding invalid hash:", err.message);
      return null;
    }
    throw err;
  }
}

export function writeHash(state: Omit<SharedState, "version">, options: { replace?: boolean } = {}): void {
  const encoded = encodeShareHash(state);
  const url = `${location.pathname}${location.search}#${encoded}`;
  if (options.replace) {
    history.replaceState(null, "", url);
  } else {
    history.pushState(null, "", url);
  }
}
