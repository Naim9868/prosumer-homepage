import type { Block } from "@/types/homepage";

/**
 * Raw HTML block — intended for advanced admins only. In production,
 * run `block.settings.html` through a sanitizer (e.g. `isomorphic-dompurify`)
 * before storing or rendering, since this bypasses React's escaping.
 *
 * suppressHydrationWarning is used because the browser's HTML parser may
 * normalize comments/whitespace differently than React's server renderer.
 */
export function HtmlBlock({ block }: { block: Block<"html"> }) {
  return (
    <div
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: block.settings.html }}
    />
  );
}
