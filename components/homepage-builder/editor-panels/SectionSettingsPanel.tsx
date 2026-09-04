"use client";
import type { CustomSection, CustomSectionLayout, EditorDevice, SectionDevice, SectionTheme } from "@/types/homepage";
import { DEFAULT_CUSTOM_LAYOUT } from "@/types/homepage";
import { SectionHeader } from "@/components/homepage-builder/editor-controls/SectionHeader";
import { StyleControls } from "@/components/homepage-builder/style-controls";
import { useEditorDevice } from "@/components/homepage-builder/editor-context";
import { useEditorTheme } from "@/components/homepage-builder/editor-context";
import { computeStyleDelta, resolveSectionStyle } from "@/lib/style-utils";
import { Field, FieldGrid, TextInput, Select } from "@/components/homepage-builder/fields";

function parseColumnRatios(input: string): number[] | undefined {
  const values = input
    .split(",")
    .map((v) => Number(v.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
  return values.length > 0 ? values : undefined;
}

function ratiosToInput(ratios?: number[]): string {
  return ratios && ratios.length > 0 ? ratios.join(",") : "";
}

function ResponsiveLayoutControls({
  layout,
  device,
  onChange,
}: {
  layout: CustomSectionLayout;
  device: EditorDevice;
  onChange: (l: CustomSectionLayout) => void;
}) {
  if (device === "desktop") {
    return (
      <p className="text-[11px] leading-relaxed text-foreground-muted">
        Desktop is the base layout. Switch to tablet or mobile to set per-device overrides.
      </p>
    );
  }

  type ResponsiveOverride = Partial<Pick<CustomSectionLayout, "mode" | "columns" | "columnRatios" | "gap" | "flexDirection" | "justifyContent" | "alignItems">>;
  const current: ResponsiveOverride = layout.responsive?.[device] ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (key: string, value: any) => {
    onChange({
      ...layout,
      responsive: {
        ...(layout.responsive || {}),
        [device]: {
          ...(layout.responsive?.[device] || {}),
          [key]: value,
        },
      },
    });
  };

  const clear = () => {
    const nextResponsive = { ...(layout.responsive || {}) };
    delete nextResponsive[device];
    onChange({
      ...layout,
      responsive: Object.keys(nextResponsive).length > 0 ? nextResponsive : undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-md border border-dashed border-border px-3 py-2 text-[11px]">
        <span className="font-medium text-foreground-muted">Editing {device} overrides</span>
        <button type="button" onClick={clear} className="font-semibold text-primary">Reset {device}</button>
      </div>

      <FieldGrid>
        <Field label="Layout Mode">
          <Select
            value={current.mode ?? ""}
            onChange={(v) => set("mode", v || undefined)}
            options={[
              { label: "Inherit Desktop", value: "" },
              { label: "Stack (Vertical)", value: "stack" },
              { label: "Grid", value: "grid" },
              { label: "Flex", value: "flex" },
            ]}
          />
        </Field>
        <Field label="Gap (px)">
          <TextInput
            type="number"
            min={0}
            max={120}
            value={current.gap ?? ""}
            onChange={(e) => set("gap", e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </Field>
        <Field label="Columns (grid/flex basis)">
          <Select
            value={current.columns ? String(current.columns) : ""}
            onChange={(v) => set("columns", v ? Number(v) : undefined)}
            options={[{ label: "Inherit Desktop", value: "" }, ...Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}`, value: String(i + 1) }))]}
          />
        </Field>
        <Field label="Column Ratios (e.g. 2,1)">
          <TextInput
            value={ratiosToInput(current.columnRatios)}
            onChange={(e) => set("columnRatios", parseColumnRatios(e.target.value))}
          />
        </Field>
      </FieldGrid>

      <FieldGrid>
        <Field label="Flex Direction">
          <Select
            value={current.flexDirection ?? ""}
            onChange={(v) => set("flexDirection", v || undefined)}
            options={[
              { label: "Inherit Desktop", value: "" },
              { label: "Row", value: "row" },
              { label: "Row (Wrap)", value: "row-wrap" },
              { label: "Column", value: "column" },
              { label: "Column (Wrap)", value: "column-wrap" },
            ]}
          />
        </Field>
        <Field label="Justify Content">
          <Select
            value={current.justifyContent ?? ""}
            onChange={(v) => set("justifyContent", v || undefined)}
            options={[
              { label: "Inherit Desktop", value: "" },
              { label: "Flex Start", value: "flex-start" },
              { label: "Center", value: "center" },
              { label: "Flex End", value: "flex-end" },
              { label: "Space Between", value: "space-between" },
              { label: "Space Around", value: "space-around" },
              { label: "Space Evenly", value: "space-evenly" },
            ]}
          />
        </Field>
      </FieldGrid>

      <Field label="Align Items">
        <Select
          value={current.alignItems ?? ""}
          onChange={(v) => set("alignItems", v || undefined)}
          options={[
            { label: "Inherit Desktop", value: "" },
            { label: "Stretch", value: "stretch" },
            { label: "Flex Start", value: "flex-start" },
            { label: "Center", value: "center" },
            { label: "Flex End", value: "flex-end" },
            { label: "Baseline", value: "baseline" },
          ]}
        />
      </Field>
    </div>
  );
}

function LayoutControls({
  layout,
  onChange,
}: {
  layout: CustomSectionLayout;
  onChange: (l: CustomSectionLayout) => void;
}) {
  return (
    <div className="space-y-4">
      <FieldGrid>
        <Field label="Layout Mode">
          <Select
            value={layout.mode}
            onChange={(v) => onChange({ ...layout, mode: v as CustomSectionLayout["mode"] })}
            options={[
              { label: "Stack (Vertical)", value: "stack" },
              { label: "Grid", value: "grid" },
              { label: "Flex", value: "flex" },
            ]}
          />
        </Field>
        <Field label="Gap (px)">
          <TextInput
            type="number"
            min={0}
            max={120}
            value={layout.gap}
            onChange={(e) => onChange({ ...layout, gap: Number(e.target.value) })}
          />
        </Field>
      </FieldGrid>

      {layout.mode === "grid" && (
        <FieldGrid>
          <Field label="Columns (1–12)">
            <Select
              value={String(layout.columns)}
              onChange={(v) => onChange({ ...layout, columns: Number(v) as CustomSectionLayout["columns"] })}
              options={Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}`, value: String(i + 1) }))}
            />
          </Field>
          <Field label="Align Items">
            <Select
              value={layout.alignItems}
              onChange={(v) => onChange({ ...layout, alignItems: v })}
              options={[
                { label: "Stretch", value: "stretch" },
                { label: "Start", value: "start" },
                { label: "Center", value: "center" },
                { label: "End", value: "end" },
              ]}
            />
          </Field>
          <Field label="Column Ratios (e.g. 2,1,1)">
            <TextInput
              value={ratiosToInput(layout.columnRatios)}
              onChange={(e) => onChange({ ...layout, columnRatios: parseColumnRatios(e.target.value) })}
            />
          </Field>
        </FieldGrid>
      )}

      {layout.mode === "flex" && (
        <>
          <FieldGrid>
            <Field label="Direction">
              <Select
                value={layout.flexDirection}
                onChange={(v) => onChange({ ...layout, flexDirection: v as CustomSectionLayout["flexDirection"] })}
                options={[
                  { label: "Row", value: "row" },
                  { label: "Row (Wrap)", value: "row-wrap" },
                  { label: "Column", value: "column" },
                  { label: "Column (Wrap)", value: "column-wrap" },
                ]}
              />
            </Field>
            <Field label="Justify Content">
              <Select
                value={layout.justifyContent}
                onChange={(v) => onChange({ ...layout, justifyContent: v })}
                options={[
                  { label: "Flex Start", value: "flex-start" },
                  { label: "Center", value: "center" },
                  { label: "Flex End", value: "flex-end" },
                  { label: "Space Between", value: "space-between" },
                  { label: "Space Around", value: "space-around" },
                  { label: "Space Evenly", value: "space-evenly" },
                ]}
              />
            </Field>
          </FieldGrid>
          <FieldGrid>
            <Field label="Align Items">
              <Select
                value={layout.alignItems}
                onChange={(v) => onChange({ ...layout, alignItems: v })}
                options={[
                  { label: "Stretch", value: "stretch" },
                  { label: "Flex Start", value: "flex-start" },
                  { label: "Center", value: "center" },
                  { label: "Flex End", value: "flex-end" },
                  { label: "Baseline", value: "baseline" },
                ]}
              />
            </Field>
          </FieldGrid>
        </>
      )}
    </div>
  );
}

export function SectionSettingsPanel({
  section,
  onChange,
}: {
  section: CustomSection;
  onChange: (next: CustomSection) => void;
}) {
  const { device } = useEditorDevice();
  const { resolvedTheme } = useEditorTheme();
  const layout = section.settings.layout ?? DEFAULT_CUSTOM_LAYOUT;
  const styleDevice = device as SectionDevice;
  const styleTheme = resolvedTheme as SectionTheme;
  const activeStyle = resolveSectionStyle(section.style, section.responsiveStyles, styleTheme, styleDevice);

  const updateStyle = (style: typeof activeStyle) => {
    const delta = computeStyleDelta(section.style, style);
    onChange({
      ...section,
      responsiveStyles: {
        ...(section.responsiveStyles || {}),
        [styleTheme]: {
          ...(section.responsiveStyles?.[styleTheme] || {}),
          [styleDevice]: delta,
        },
      },
    });
  };

  return (
    <div className="space-y-0">
      <SectionHeader title="Section Settings">
        <Field label="Section Name (admin-only label)">
          <TextInput
            value={section.settings.name}
            onChange={(e) => onChange({ ...section, settings: { ...section.settings, name: e.target.value } })}
          />
        </Field>
      </SectionHeader>
      <SectionHeader title="Layout">
        <LayoutControls
          layout={layout}
          onChange={(newLayout) =>
            onChange({ ...section, settings: { ...section.settings, layout: newLayout } })
          }
        />
      </SectionHeader>
      <SectionHeader title="Responsive Layout">
        <ResponsiveLayoutControls
          layout={layout}
          device={device}
          onChange={(newLayout) =>
            onChange({ ...section, settings: { ...section.settings, layout: newLayout } })
          }
        />
      </SectionHeader>
      <SectionHeader title="Section Styling" defaultOpen={false}>
        <StyleControls style={activeStyle} onChange={updateStyle} />
      </SectionHeader>
    </div>
  );
}
