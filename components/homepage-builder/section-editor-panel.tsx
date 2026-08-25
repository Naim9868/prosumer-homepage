"use client";

import type { Section } from "@/types/homepage";
import { SECTION_TYPE_META } from "@/types/homepage";
import { StyleControls } from "@/components/homepage-builder/style-controls";
import { CustomSectionEditor } from "@/components/homepage-builder/custom-section-editor";
import { SECTION_EDITOR_REGISTRY } from "@/components/homepage-builder/section-editors/registry";

export function SectionEditorPanel({
  section,
  onChange,
}: {
  section: Section;
  onChange: (next: Section) => void;
}) {
  if (section.type === "custom") {
    return <CustomSectionEditor section={section} onChange={onChange} />;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Editor = SECTION_EDITOR_REGISTRY[section.type] as any;

  const styleControls = (
    <StyleControls style={section.style} onChange={(style) => onChange({ ...section, style })} />
  );

  return (
    <div className="space-y-6">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{SECTION_TYPE_META[section.type].label}</p>
      {Editor && (
        <Editor
          settings={section.settings}
          onChange={(settings: Section["settings"]) => onChange({ ...section, settings } as Section)}
          style={section.style}
          footer={section.type === "hero" ? styleControls : undefined}
        />
      )}
      {section.type !== "hero" && styleControls}
    </div>
  );
}
