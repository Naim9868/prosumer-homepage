"use client";

import type { Section } from "@/types/homepage";
import { SECTION_TYPE_META } from "@/types/homepage";
import { Field, TextInput } from "@/components/homepage-builder/fields";
import { StyleControls } from "@/components/homepage-builder/style-controls";
import { BlockList } from "@/components/homepage-builder/block-list";
import { SECTION_EDITOR_REGISTRY } from "@/components/homepage-builder/section-editors/registry";

export function SectionEditorPanel({
  section,
  onChange,
}: {
  section: Section;
  onChange: (next: Section) => void;
}) {
  if (section.type === "custom") {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Custom Section</p>
          <Field label="Section Name (admin-only label)">
            <TextInput
              value={section.settings.name}
              onChange={(e) => onChange({ ...section, settings: { ...section.settings, name: e.target.value } })}
            />
          </Field>
        </div>

        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Blocks</p>
          <BlockList blocks={section.blocks} onChange={(blocks) => onChange({ ...section, blocks })} />
        </div>

        <StyleControls style={section.style} onChange={(style) => onChange({ ...section, style })} />
      </div>
    );
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
          footer={section.type === "hero" ? styleControls : undefined}
        />
      )}
      {section.type !== "hero" && styleControls}
    </div>
  );
}
