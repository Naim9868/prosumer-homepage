"use client";

// components/product/AnchorNav.tsx
// Purely presentational smooth-scroll links — the list of sections is
// computed server-side (see lib/section-config.ts#getPresentSections) so a
// section only appears here when it actually rendered below.

export function AnchorNav({ sections }: { sections: Array<{ id: string; label: string }> }) {
  if (sections.length < 2) return null;

  return (
    <nav
      aria-label="Product page sections"
      className="sticky top-0 z-10 flex justify-center align-center gap-6 overflow-x-auto rounded-[20px] border-b border-[color:var(--titanium-800)] bg-[#0e0f11]/95 px-1 py-3 backdrop-blur-sm"
    >
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className="whitespace-nowrap  text-sm text-white transition hover:text-[color:var(--brass-500)]"
        >
          {section.label}
        </a>
      ))}
    </nav>
  );
}
