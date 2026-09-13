/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * YouTube IFrame Player API — singleton loader.
 * Loads the script once and exposes a promise that resolves when ready.
 */

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<typeof window.YT> | null = null;

export function loadYouTubeAPI(): Promise<typeof window.YT> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));

  if (window.YT?.Player) return Promise.resolve(window.YT);

  if (apiPromise) return apiPromise;

  apiPromise = new Promise<typeof window.YT>((resolve, reject) => {
    const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!existing) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.onerror = () => {
        apiPromise = null;
        reject(new Error("Failed to load YouTube IFrame API"));
      };
      document.head.appendChild(tag);
    }

    const checkReady = () => {
      if (window.YT?.Player) {
        resolve(window.YT);
      } else {
        setTimeout(checkReady, 50);
      }
    };

    if (window.YT?.Player) {
      resolve(window.YT);
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        checkReady();
      };
      checkReady();
    }
  });

  return apiPromise;
}

/**
 * Extract a YouTube video ID from various URL formats.
 * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID, raw ID.
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Already a raw ID (11 chars, alphanumeric + _ -)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace("www.", "");

    // youtu.be/VIDEO_ID
    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split(/[?&#]/)[0];
      return id.length === 11 ? id : null;
    }

    // youtube.com/watch?v=VIDEO_ID or youtube.com/embed/VIDEO_ID
    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = parsed.searchParams.get("v");
      if (v && v.length === 11) return v;

      // /shorts/VIDEO_ID or /embed/VIDEO_ID
      const match = parsed.pathname.match(/\/(shorts|embed)\/([a-zA-Z0-9_-]{11})/);
      if (match) return match[2];
    }
  } catch {
    // Not a valid URL — try raw ID
  }

  return null;
}
