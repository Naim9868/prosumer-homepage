import type { BlockStyle, BlockBreakpointStyle, EditorDevice, BlockAdvanced } from "@/types/homepage";

/**
 * Get the effective value for a property at a given device.
 * Falls back: mobile → tablet → desktop → undefined.
 */
export function resolve<T>(style: BlockStyle | undefined, device: EditorDevice, category: keyof BlockBreakpointStyle, prop: string): T | undefined {
  if (!style) return undefined;
  const fallbackOrder: Record<EditorDevice, EditorDevice[]> = {
    desktop: ["desktop"],
    tablet: ["tablet", "desktop"],
    mobile: ["mobile", "tablet", "desktop"],
  };
  for (const bpKey of fallbackOrder[device]) {
    const bp = style[bpKey]?.[category] as Record<string, unknown> | undefined;
    if (bp && prop in bp && bp[prop] !== undefined && bp[prop] !== "") return bp[prop] as T;
  }
  return undefined;
}

/** Convert a kebab-case CSS property name to camelCase. */
function kebabToCamel(s: string): string {
  return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

type PropertySpec = {
  cssProp: string;
  category: keyof BlockBreakpointStyle;
  valueKey: string;
};

/** Map style object keys (camelCase) to emitted CSS properties (kebab-case). */
const PROPERTY_SPECS: PropertySpec[] = [
  { cssProp: "width", category: "layout", valueKey: "width" },
  { cssProp: "height", category: "layout", valueKey: "height" },
  { cssProp: "min-width", category: "layout", valueKey: "minWidth" },
  { cssProp: "max-width", category: "layout", valueKey: "maxWidth" },
  { cssProp: "margin", category: "layout", valueKey: "margin" },
  { cssProp: "padding", category: "layout", valueKey: "padding" },
  { cssProp: "display", category: "layout", valueKey: "display" },
  { cssProp: "position", category: "layout", valueKey: "position" },
  { cssProp: "top", category: "layout", valueKey: "top" },
  { cssProp: "right", category: "layout", valueKey: "right" },
  { cssProp: "bottom", category: "layout", valueKey: "bottom" },
  { cssProp: "left", category: "layout", valueKey: "left" },
  { cssProp: "z-index", category: "layout", valueKey: "zIndex" },
  { cssProp: "overflow", category: "layout", valueKey: "overflow" },
  { cssProp: "gap", category: "layout", valueKey: "gap" },
  { cssProp: "align-items", category: "layout", valueKey: "alignItems" },
  { cssProp: "justify-content", category: "layout", valueKey: "justifyContent" },
  { cssProp: "flex-direction", category: "layout", valueKey: "flexDirection" },

  { cssProp: "font-family", category: "typography", valueKey: "fontFamily" },
  { cssProp: "font-size", category: "typography", valueKey: "fontSize" },
  { cssProp: "font-weight", category: "typography", valueKey: "fontWeight" },
  { cssProp: "line-height", category: "typography", valueKey: "lineHeight" },
  { cssProp: "letter-spacing", category: "typography", valueKey: "letterSpacing" },
  { cssProp: "text-transform", category: "typography", valueKey: "textTransform" },
  { cssProp: "text-decoration", category: "typography", valueKey: "textDecoration" },
  { cssProp: "text-align", category: "typography", valueKey: "textAlign" },

  { cssProp: "color", category: "colors", valueKey: "color" },
  { cssProp: "background-color", category: "colors", valueKey: "backgroundColor" },
  { cssProp: "opacity", category: "colors", valueKey: "opacity" },

  { cssProp: "border-style", category: "border", valueKey: "borderType" },
  { cssProp: "border-width", category: "border", valueKey: "borderWidth" },
  { cssProp: "border-color", category: "border", valueKey: "borderColor" },
  { cssProp: "border-radius", category: "border", valueKey: "borderRadius" },
];

const DESCENDANT_TEXT_PROPS = new Set([
  "font-family",
  "font-size",
  "font-weight",
  "line-height",
  "letter-spacing",
  "text-transform",
  "text-decoration",
  "text-align",
  "color",
]);

function pickTextCascadeProps(css: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(css)) {
    if (DESCENDANT_TEXT_PROPS.has(k)) out[k] = v;
  }
  return out;
}

/**
 * Generate a CSS properties object from a block's responsive style at a given device.
 * Merges desktop → tablet → mobile.
 */
export function blockStyleToCSS(style: BlockStyle | undefined, device: EditorDevice): Record<string, string> {
  const css: Record<string, string> = {};
  if (!style) return css;

  for (const spec of PROPERTY_SPECS) {
    const val = resolve<string>(style, device, spec.category, spec.valueKey);
    if (val !== undefined && val !== "") css[spec.cssProp] = val;
  }

  // Shadow
  const shadowX = resolve<string>(style, device, "shadow", "shadowX");
  const shadowY = resolve<string>(style, device, "shadow", "shadowY");
  const shadowBlur = resolve<string>(style, device, "shadow", "shadowBlur");
  const shadowSpread = resolve<string>(style, device, "shadow", "shadowSpread");
  const shadowColor = resolve<string>(style, device, "shadow", "shadowColor");
  if (shadowX || shadowY || shadowBlur || shadowSpread || shadowColor) {
    css["box-shadow"] = `${shadowX || "0"} ${shadowY || "0"} ${shadowBlur || "0"} ${shadowSpread || "0"} ${shadowColor || "rgba(0,0,0,0.2)"}`;
  }

  // Gradient background
  const gradient = resolve<string>(style, device, "colors", "backgroundGradient");
  if (gradient) css["background"] = gradient;

  return css;
}

/**
 * Generate responsive CSS with !important for editor preview.
 * Two selectors per block:
 *   [data-block-id="X"]        — applies to the wrapper (background, border, margin, etc.)
 *   [data-block-id="X"] > *    — applies to direct children (overrides Tailwind classes on block elements)
 */
export function generateBlockCSS(blockId: string, style: BlockStyle | undefined, advanced?: BlockAdvanced): string {
  const desktopCSS = blockStyleToCSS(style, "desktop");
  const tabletCSS = blockStyleToCSS(style, "tablet");
  const mobileCSS = blockStyleToCSS(style, "mobile");
  const desktopTextCSS = pickTextCascadeProps(desktopCSS);
  const tabletTextCSS = pickTextCascadeProps(tabletCSS);
  const mobileTextCSS = pickTextCascadeProps(mobileCSS);

  const lines: string[] = [];
  const sel = `[data-block-id="${blockId}"]`;

  function emit(css: Record<string, string>, indent: string) {
    for (const [k, v] of Object.entries(css)) {
      lines.push(`${indent}${k}: ${v} !important;`);
    }
  }

  if (Object.keys(desktopCSS).length > 0) {
    lines.push(`${sel} {`);
    emit(desktopCSS, "  ");
    lines.push("}");
  }

  if (Object.keys(desktopTextCSS).length > 0) {
    lines.push(`${sel}, ${sel} * {`);
    emit(desktopTextCSS, "  ");
    lines.push("}");
  }

  if (Object.keys(tabletCSS).length > 0) {
    lines.push(`@media (max-width: 1024px) {`);
    lines.push(`  ${sel} {`);
    emit(tabletCSS, "    ");
    lines.push("  }");

    if (Object.keys(tabletTextCSS).length > 0) {
      lines.push(`  ${sel}, ${sel} * {`);
      emit(tabletTextCSS, "    ");
      lines.push("  }");
    }

    lines.push("}");
  }

  if (Object.keys(mobileCSS).length > 0) {
    lines.push(`@media (max-width: 768px) {`);
    lines.push(`  ${sel} {`);
    emit(mobileCSS, "    ");
    lines.push("  }");

    if (Object.keys(mobileTextCSS).length > 0) {
      lines.push(`  ${sel}, ${sel} * {`);
      emit(mobileTextCSS, "    ");
      lines.push("  }");
    }

    lines.push("}");
  }

  if (advanced?.customCSS) {
    lines.push(`${sel} {`);
    lines.push(advanced.customCSS);
    lines.push("}");
  }

  if (advanced?.animation?.type && advanced.animation.type !== "none") {
    const anim = advanced.animation;
    lines.push(`${sel} {`);
    lines.push(`  animation-name: editor-${anim.type};`);
    lines.push(`  animation-duration: ${anim.duration || 500}ms;`);
    lines.push(`  animation-delay: ${anim.delay || 0}ms;`);
    lines.push(`  animation-fill-mode: both;`);
    if (anim.easing) lines.push(`  animation-timing-function: ${anim.easing};`);
    lines.push("}");
  }

  const visibility = advanced?.visibility;
  if (visibility?.desktop === false) {
    lines.push(`@media (min-width: 1025px) { ${sel} { display: none !important; } }`);
  }
  if (visibility?.tablet === false) {
    lines.push(`@media (min-width: 769px) and (max-width: 1024px) { ${sel} { display: none !important; } }`);
  }
  if (visibility?.mobile === false) {
    lines.push(`@media (max-width: 768px) { ${sel} { display: none !important; } }`);
  }

  return lines.join("\n");
}

/**
 * Parse a compact custom-attributes string like: data-x="1" aria-label="Hi"
 * Only safe HTML attributes are allowed.
 */
export function parseCustomAttributes(input?: string): Record<string, string> {
  if (!input) return {};

  const allowed = /^(data-[\w:-]+|aria-[\w:-]+|role|title|tabindex)$/i;
  const attrRe = /([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"']+)))?/g;
  const out: Record<string, string> = {};

  let match: RegExpExecArray | null;
  while ((match = attrRe.exec(input)) !== null) {
    const name = match[1];
    if (!allowed.test(name)) continue;
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    out[name] = value;
  }

  return out;
}

/**
 * Generate CSS for ALL blocks in a section.
 * Returns a single <style> string.
 */
export function generateSectionCSS(blocks: { id: string; style?: BlockStyle; advanced?: BlockAdvanced }[]): string {
  return blocks.map((b) => generateBlockCSS(b.id, b.style, b.advanced)).filter(Boolean).join("\n");
}

/** Map animation type names to readable labels. */
export const ANIMATION_TYPES: { value: string; label: string }[] = [
  { value: "none", label: "None" },
  { value: "fadeIn", label: "Fade In" },
  { value: "fadeInUp", label: "Fade In Up" },
  { value: "fadeInDown", label: "Fade In Down" },
  { value: "fadeInLeft", label: "Fade In Left" },
  { value: "fadeInRight", label: "Fade In Right" },
  { value: "scaleIn", label: "Scale In" },
  { value: "slideInUp", label: "Slide In Up" },
  { value: "slideInDown", label: "Slide In Down" },
];

/**
 * Convert a block's responsive style to React inline CSSProperties for the current device.
 * Used by the editor canvas so style changes show instantly regardless of Tailwind specificity.
 */
export function blockStyleToInline(style: BlockStyle | undefined, device: EditorDevice): React.CSSProperties {
  if (!style) return {};
  const css = blockStyleToCSS(style, device);
  const result: Record<string, string> = {};
  for (const [prop, val] of Object.entries(css)) {
    if (val !== undefined && val !== "") {
      result[kebabToCamel(prop)] = val;
    }
  }
  return result as React.CSSProperties;
}

/** Common CSS display values. */
export const DISPLAY_OPTIONS = ["block", "inline-block", "inline", "flex", "grid", "none"];

/** Common CSS position values. */
export const POSITION_OPTIONS = ["static", "relative", "absolute", "fixed", "sticky"];

/** Common CSS overflow values. */
export const OVERFLOW_OPTIONS = ["visible", "hidden", "scroll", "auto"];

/** Common CSS text-transform values. */
export const TEXT_TRANSFORM_OPTIONS = ["none", "uppercase", "lowercase", "capitalize"];

/** Common CSS text-decoration values. */
export const TEXT_DECORATION_OPTIONS = ["none", "underline", "line-through", "overline"];

/** Common CSS border-type values. */
export const BORDER_TYPE_OPTIONS = ["none", "solid", "dashed", "dotted"];

/** Common CSS font-weight values. */
export const FONT_WEIGHT_OPTIONS = ["100", "200", "300", "400", "500", "600", "700", "800", "900"];

/** Common CSS font-family options. */
export const FONT_FAMILY_OPTIONS = [
  { label: "Inherit", value: "" },
  { label: "Inter", value: '"Inter", ui-sans-serif, system-ui, sans-serif' },
  { label: "Manrope", value: '"Manrope", ui-sans-serif, system-ui, sans-serif' },
  { label: "System", value: "ui-sans-serif, system-ui, sans-serif" },
  { label: "Serif", value: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' },
  { label: "Mono", value: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace' },
];

/** Common easing values. */
export const EASING_OPTIONS = [
  { label: "Ease", value: "ease" },
  { label: "Ease In", value: "ease-in" },
  { label: "Ease Out", value: "ease-out" },
  { label: "Ease In Out", value: "ease-in-out" },
  { label: "Linear", value: "linear" },
  { label: "Optical (Project)", value: "cubic-bezier(0.22, 1, 0.36, 1)" },
];
