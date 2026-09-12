import type { BlockStyle, BlockBreakpointStyle, EditorDevice, BlockAdvanced, SectionStyle, ResponsiveSectionStyles, SectionTheme, SectionDevice, ResponsiveBlockStyles } from "@/types/homepage";

export function resolveSectionStyle(
  style: SectionStyle,
  responsiveStyles: ResponsiveSectionStyles | undefined,
  theme: SectionTheme,
  device: SectionDevice,
): SectionStyle {
  const deviceCascade: Record<SectionDevice, SectionDevice[]> = {
    desktop: ["desktop"],
    tablet: ["desktop", "tablet"],
    mobile: ["desktop", "tablet", "mobile"],
  };

  return deviceCascade[device].reduce<SectionStyle>(
    (resolved, currentDevice) => ({
      ...resolved,
      ...(responsiveStyles?.[theme]?.[currentDevice] || {}),
    }),
    { ...style },
  );
}

export function createResponsiveSectionStyles(style: SectionStyle): ResponsiveSectionStyles {
  return {
    light: {
      desktop: {},
      tablet: {},
      mobile: {},
    },
    dark: {
      desktop: {},
      tablet: {},
      mobile: {},
    },
  };
}

/**
 * Compute the delta (only the fields that differ from the base style) for a given device/theme slot.
 * This ensures that each slot stores only its overrides, preventing cross-device pollution.
 * Works recursively for nested objects like typography, colors, border, shadow.
 */
export function computeStyleDelta(
  baseStyle: SectionStyle | BlockBreakpointStyle,
  newStyle: SectionStyle | BlockBreakpointStyle
): Partial<SectionStyle> | Partial<BlockBreakpointStyle> {
  const delta: Record<string, any> = {};
  const allKeys = new Set<string>([...Object.keys(baseStyle || {}), ...Object.keys(newStyle || {})]);
  for (const key of allKeys) {
    const baseVal = (baseStyle as any)?.[key];
    const newVal = (newStyle as any)?.[key];

    if (typeof baseVal === "object" && typeof newVal === "object" && baseVal && newVal) {
      const innerDelta = computeStyleDelta(baseVal, newVal);
      if (Object.keys(innerDelta).length > 0) {
        delta[key] = innerDelta;
      }
    } else if (baseVal !== newVal) {
      delta[key] = newVal;
    }
  }
  return delta;
}

function sectionStyleDeclarations(style: SectionStyle): string {
  const declarations: string[] = [];
  const add = (property: string, value: string | number | undefined, suffix = "") => {
    if (value !== undefined && value !== "") declarations.push(`${property}: ${value}${suffix} !important;`);
  };

  add("background-color", style.backgroundColor);
  if (style.backgroundImage) {
    add("background-image", `url(${JSON.stringify(style.backgroundImage)})`);
    add("background-size", "cover");
    add("background-position", "center");
  }
  add("padding-top", style.paddingTop, "px");
  add("padding-bottom", style.paddingBottom, "px");
  add("min-height", style.minHeight, "px");
  add("overflow", style.overflow);
  add("position", style.position);
  add("z-index", style.zIndex);
  add("margin-top", style.marginTop, "px");
  add("margin-bottom", style.marginBottom, "px");
  add("border-radius", style.borderRadius, "px");
  add("text-align", style.textAlign);
  return declarations.join(" ");
}

export function generateResponsiveSectionCSS(
  sectionId: string,
  baseStyle: SectionStyle,
  responsiveStyles?: ResponsiveSectionStyles,
): string {
  const selector = `[data-custom-section-id="${sectionId}"]`;
  const rules: string[] = [];
  const addRule = (theme: SectionTheme, device: SectionDevice, query: string | null) => {
    const style = resolveSectionStyle(baseStyle, responsiveStyles, theme, device);
    const declarations = [
      sectionStyleDeclarations(style),
      device === "desktop" && style.hideOnDesktop ? "display: none !important;" : "",
      device === "mobile" && style.hideOnMobile ? "display: none !important;" : "",
    ].filter(Boolean).join(" ");
    if (!declarations) return;
    const themedSelector = theme === "dark" ? `.dark ${selector}` : `:root:not(.dark) ${selector}`;
    const rule = `${themedSelector} { ${declarations} }`;
    rules.push(query ? `@media ${query} { ${rule} }` : rule);
  };

  for (const theme of ["light", "dark"] as const) {
    addRule(theme, "desktop", "(min-width: 1025px)");
    addRule(theme, "tablet", "(min-width: 769px) and (max-width: 1024px)");
    addRule(theme, "mobile", "(max-width: 768px)");
  }
  return rules.join("\n");
}

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

/**
 * Resolve the effective BlockBreakpointStyle for a given theme + device.
 * Falls back: responsiveStyles[theme][device] → style[device] → undefined.
 * Device cascade: mobile → tablet → desktop within the resolved theme.
 * Empty slots ({}) are skipped so cascade continues to higher devices/legacy.
 */
export function resolveBlockBreakpointStyle(
  responsiveStyles: ResponsiveBlockStyles | undefined,
  legacyStyle: BlockStyle | undefined,
  theme: SectionTheme,
  device: EditorDevice,
): BlockBreakpointStyle | undefined {
  const fallbackOrder: EditorDevice[] = device === "desktop" ? ["desktop"] : device === "tablet" ? ["tablet", "desktop"] : ["mobile", "tablet", "desktop"];

  for (const bp of fallbackOrder) {
    const themed = responsiveStyles?.[theme]?.[bp];
    if (themed && Object.keys(themed).length > 0) return themed;
  }

  // Fall back to legacy style (theme-agnostic)
  for (const bp of fallbackOrder) {
    const legacy = legacyStyle?.[bp];
    if (legacy && Object.keys(legacy).length > 0) return legacy;
  }

  return undefined;
}

/**
 * Resolve the effective value for a property at a given theme + device.
 * Falls back: responsiveStyles[theme][device] → style[device] → undefined.
 */
export function resolveBlockProperty<T>(
  responsiveStyles: ResponsiveBlockStyles | undefined,
  legacyStyle: BlockStyle | undefined,
  theme: SectionTheme,
  device: EditorDevice,
  category: keyof BlockBreakpointStyle,
  prop: string,
): T | undefined {
  const bp = resolveBlockBreakpointStyle(responsiveStyles, legacyStyle, theme, device);
  if (!bp) return undefined;
  const cat = bp[category] as Record<string, unknown> | undefined;
  if (cat && prop in cat && cat[prop] !== undefined && cat[prop] !== "") return cat[prop] as T;
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
 * Generate a CSS properties object from a block's responsive style at a given device + theme.
 * Falls back to legacy style when responsiveStyles are not set.
 */
export function blockStyleToCSS(
  style: BlockStyle | undefined,
  device: EditorDevice,
  theme?: SectionTheme,
  responsiveStyles?: ResponsiveBlockStyles,
): Record<string, string> {
  const css: Record<string, string> = {};

  const resolve = <T>(category: keyof BlockBreakpointStyle, prop: string): T | undefined => {
    if (theme && responsiveStyles) {
      return resolveBlockProperty<T>(responsiveStyles, style, theme, device, category, prop);
    }
    return resolveLegacy<T>(style, device, category, prop);
  };

  for (const spec of PROPERTY_SPECS) {
    const val = resolve<string>(spec.category, spec.valueKey);
    if (val !== undefined && val !== "") css[spec.cssProp] = val;
  }

  // Shadow
  const shadowX = resolve<string>("shadow", "shadowX");
  const shadowY = resolve<string>("shadow", "shadowY");
  const shadowBlur = resolve<string>("shadow", "shadowBlur");
  const shadowSpread = resolve<string>("shadow", "shadowSpread");
  const shadowColor = resolve<string>("shadow", "shadowColor");
  if (shadowX || shadowY || shadowBlur || shadowSpread || shadowColor) {
    css["box-shadow"] = `${shadowX || "0"} ${shadowY || "0"} ${shadowBlur || "0"} ${shadowSpread || "0"} ${shadowColor || "rgba(0,0,0,0.2)"}`;
  }

  // Gradient background
  const gradient = resolve<string>("colors", "backgroundGradient");
  if (gradient) css["background"] = gradient;

  // Auto-inject display:flex when flex/grid properties are set but no explicit display
  if (!css["display"] && (css["align-items"] || css["justify-content"] || css["flex-direction"] || css["gap"])) {
    css["display"] = "flex";
  }

  return css;
}

/**
 * Legacy resolve — falls back: mobile → tablet → desktop → undefined.
 * Used when no theme context is available.
 */
function resolveLegacy<T>(style: BlockStyle | undefined, device: EditorDevice, category: keyof BlockBreakpointStyle, prop: string): T | undefined {
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

/**
 * Generate responsive CSS with !important for editor preview and public rendering.
 * When responsiveStyles is provided, generates theme-aware CSS for all 6 combinations
 * (light/dark × desktop/tablet/mobile). Otherwise falls back to legacy theme-agnostic CSS.
 *
 * Theme selectors:
 *   Light: :root:not(.dark) [data-block-id="X"]
 *   Dark:  .dark [data-block-id="X"]
 */
export function generateBlockCSS(
  blockId: string,
  style: BlockStyle | undefined,
  advanced?: BlockAdvanced,
  responsiveStyles?: ResponsiveBlockStyles,
  responsiveAdvanced?: import("@/types/homepage").ResponsiveBlockAdvanced,
  responsiveLayout?: import("@/types/homepage").ResponsiveBlockLayout,
): string {
  const lines: string[] = [];
  const sel = `[data-block-id="${blockId}"]`;

  function emit(css: Record<string, string>, indent: string) {
    for (const [k, v] of Object.entries(css)) {
      lines.push(`${indent}${k}: ${v} !important;`);
    }
  }

  const hasResponsiveAdvanced = responsiveAdvanced && (responsiveAdvanced.light || responsiveAdvanced.dark);
  const hasResponsiveLayout = responsiveLayout && (responsiveLayout.light || responsiveLayout.dark);
  const hasResponsiveStyles = responsiveStyles && (responsiveStyles.light || responsiveStyles.dark);

  if (hasResponsiveStyles || hasResponsiveAdvanced || hasResponsiveLayout) {
    // Theme-aware CSS generation for styles
    if (hasResponsiveStyles) {
      for (const theme of ["light", "dark"] as const) {
        const themedSelector = theme === "dark" ? `.dark ${sel}` : `:root:not(.dark) ${sel}`;

        for (const device of ["desktop", "tablet", "mobile"] as const) {
          const deviceQuery = device === "desktop" ? "(min-width: 1025px)" : device === "tablet" ? "(min-width: 769px) and (max-width: 1024px)" : "(max-width: 768px)";

          const deviceCSS = blockStyleToCSSNoCascade(responsiveStyles, theme, device);
          const textCSS = pickTextCascadeProps(deviceCSS);

          if (Object.keys(deviceCSS).length > 0) {
            lines.push(`@media ${deviceQuery} {`);
            lines.push(`  ${themedSelector} {`);
            emit(deviceCSS, "    ");
            lines.push("  }");
            lines.push("}");
          }

          if (Object.keys(textCSS).length > 0) {
            lines.push(`@media ${deviceQuery} {`);
            lines.push(`  ${themedSelector}, ${themedSelector} * {`);
            emit(textCSS, "    ");
            lines.push("  }");
            lines.push("}");
          }
        }
      }
    }

    // Theme-aware CSS generation for responsive advanced
    if (hasResponsiveAdvanced) {
      for (const theme of ["light", "dark"] as const) {
        const themedSelector = theme === "dark" ? `.dark ${sel}` : `:root:not(.dark) ${sel}`;
        for (const device of ["desktop", "tablet", "mobile"] as const) {
          const deviceQuery = device === "desktop" ? "(min-width: 1025px)" : device === "tablet" ? "(min-width: 769px) and (max-width: 1024px)" : "(max-width: 768px)";
          const deviceAdv = responsiveAdvanced?.[theme]?.[device];
          if (!deviceAdv) continue;

          const advLines: string[] = [];
          if (deviceAdv.customCSS) advLines.push(deviceAdv.customCSS);
          if (deviceAdv.animation?.type && deviceAdv.animation.type !== "none") {
            advLines.push(`animation-name: editor-${deviceAdv.animation.type};`);
            advLines.push(`animation-duration: ${deviceAdv.animation.duration || 500}ms;`);
            advLines.push(`animation-delay: ${deviceAdv.animation.delay || 0}ms;`);
            advLines.push(`animation-fill-mode: both;`);
            if (deviceAdv.animation.easing) advLines.push(`animation-timing-function: ${deviceAdv.animation.easing};`);
          }

          if (advLines.length > 0) {
            lines.push(`@media ${deviceQuery} {`);
            lines.push(`  ${themedSelector} {`);
            advLines.forEach((l) => lines.push(`    ${l}`));
            lines.push("  }");
            lines.push("}");
          }

          // Per-theme+device visibility
          if (deviceAdv.visibility?.desktop === false) {
            lines.push(`@media (min-width: 1025px) { .dark ${sel}, :root:not(.dark) ${sel} { display: none !important; } }`);
          }
          if (deviceAdv.visibility?.tablet === false) {
            lines.push(`@media (min-width: 769px) and (max-width: 1024px) { .dark ${sel}, :root:not(.dark) ${sel} { display: none !important; } }`);
          }
          if (deviceAdv.visibility?.mobile === false) {
            lines.push(`@media (max-width: 768px) { .dark ${sel}, :root:not(.dark) ${sel} { display: none !important; } }`);
          }
        }
      }
    }

    // Theme-aware CSS generation for responsive layout
    if (hasResponsiveLayout) {
      for (const theme of ["light", "dark"] as const) {
        const themedSelector = theme === "dark" ? `.dark ${sel}` : `:root:not(.dark) ${sel}`;
        for (const device of ["desktop", "tablet", "mobile"] as const) {
          const deviceQuery = device === "desktop" ? "(min-width: 1025px)" : device === "tablet" ? "(min-width: 769px) and (max-width: 1024px)" : "(max-width: 768px)";
          const deviceLayout = responsiveLayout?.[theme]?.[device];
          if (!deviceLayout) continue;

          const layoutLines: string[] = [];
          if (deviceLayout.columnSpan > 1) layoutLines.push(`grid-column: span ${deviceLayout.columnSpan};`);
          if (deviceLayout.rowSpan > 1) layoutLines.push(`grid-row: span ${deviceLayout.rowSpan};`);
          if (deviceLayout.order) layoutLines.push(`order: ${deviceLayout.order};`);
          if (deviceLayout.alignSelf !== "auto") layoutLines.push(`align-self: ${deviceLayout.alignSelf};`);

          if (layoutLines.length > 0) {
            lines.push(`@media ${deviceQuery} {`);
            lines.push(`  ${themedSelector} {`);
            layoutLines.forEach((l) => lines.push(`    ${l}`));
            lines.push("  }");
            lines.push("}");
          }
        }
      }
    }
  } else {
    // Legacy theme-agnostic CSS generation (backward compatible)
    const desktopCSS = blockStyleToCSS(style, "desktop");
    const tabletCSS = blockStyleToCSS(style, "tablet");
    const mobileCSS = blockStyleToCSS(style, "mobile");
    const desktopTextCSS = pickTextCascadeProps(desktopCSS);
    const tabletTextCSS = pickTextCascadeProps(tabletCSS);
    const mobileTextCSS = pickTextCascadeProps(mobileCSS);

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
  }

  // Legacy advanced (non-responsive) as fallback
  if (advanced?.customCSS && !hasResponsiveAdvanced) {
    lines.push(`${sel} {`);
    lines.push(advanced.customCSS);
    lines.push("}");
  }

  if (advanced?.animation?.type && advanced.animation.type !== "none" && !hasResponsiveAdvanced) {
    const anim = advanced.animation;
    lines.push(`${sel} {`);
    lines.push(`  animation-name: editor-${anim.type};`);
    lines.push(`  animation-duration: ${anim.duration || 500}ms;`);
    lines.push(`  animation-delay: ${anim.delay || 0}ms;`);
    lines.push(`  animation-fill-mode: both;`);
    if (anim.easing) lines.push(`  animation-timing-function: ${anim.easing};`);
    lines.push("}");
  }

  // Legacy visibility as fallback (only when no responsiveAdvanced)
  if (!hasResponsiveAdvanced) {
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
export function generateSectionCSS(blocks: { id: string; style?: BlockStyle; advanced?: BlockAdvanced; responsiveStyles?: ResponsiveBlockStyles; responsiveAdvanced?: import("@/types/homepage").ResponsiveBlockAdvanced; responsiveLayout?: import("@/types/homepage").ResponsiveBlockLayout }[]): string {
  return blocks.map((b) => generateBlockCSS(b.id, b.style, b.advanced, b.responsiveStyles, b.responsiveAdvanced, b.responsiveLayout)).filter(Boolean).join("\n");
}

/**
 * Non-cascading CSS resolver for the editor.
 * Reads ONLY from responsiveStyles[theme][device] — no fallback to other devices.
 * This ensures each device preview shows exactly what's saved for that device.
 */
function blockStyleToCSSNoCascade(
  responsiveStyles: ResponsiveBlockStyles | undefined,
  theme: SectionTheme,
  device: EditorDevice,
): Record<string, string> {
  const bp = responsiveStyles?.[theme]?.[device];
  if (!bp) return {};

  const css: Record<string, string> = {};

  for (const spec of PROPERTY_SPECS) {
    const cat = bp[spec.category] as Record<string, unknown> | undefined;
    if (cat && spec.valueKey in cat && cat[spec.valueKey] !== undefined && cat[spec.valueKey] !== "") {
      css[spec.cssProp] = String(cat[spec.valueKey]);
    }
  }

  // Shadow
  const shadowCat = bp.shadow as Record<string, unknown> | undefined;
  const shadowX = shadowCat?.shadowX as string | undefined;
  const shadowY = shadowCat?.shadowY as string | undefined;
  const shadowBlur = shadowCat?.shadowBlur as string | undefined;
  const shadowSpread = shadowCat?.shadowSpread as string | undefined;
  const shadowColor = shadowCat?.shadowColor as string | undefined;
  if (shadowX || shadowY || shadowBlur || shadowSpread || shadowColor) {
    css["box-shadow"] = `${shadowX || "0"} ${shadowY || "0"} ${shadowBlur || "0"} ${shadowSpread || "0"} ${shadowColor || "rgba(0,0,0,0.2)"}`;
  }

  // Gradient background
  const colorsCat = bp.colors as Record<string, unknown> | undefined;
  const gradient = colorsCat?.backgroundGradient as string | undefined;
  if (gradient) css["background"] = gradient;

  // Auto-inject display:flex when flex properties are set but no explicit display
  if (!css["display"] && (css["align-items"] || css["justify-content"] || css["flex-direction"] || css["gap"])) {
    css["display"] = "flex";
  }

  return css;
}

/**
 * Editor-only CSS: emits responsive styles + animations + custom CSS + visibility for the CURRENT device+theme.
 * Uses !important so styles override hardcoded Tailwind classes inside block components.
 * No media queries — the editor only shows one device at a time.
 * Uses NON-CASCADING resolution — each device shows only its own explicit values.
 */
export function generateBlockEditorCSS(
  blockId: string,
  advanced?: BlockAdvanced,
  responsiveStyles?: ResponsiveBlockStyles,
  responsiveAdvanced?: import("@/types/homepage").ResponsiveBlockAdvanced,
  currentTheme?: SectionTheme,
  currentDevice?: EditorDevice,
): string {
  const lines: string[] = [];
  const sel = `[data-block-id="${blockId}"]`;

  // Emit responsive styles for current theme+device as !important CSS (NO cascade)
  if (currentTheme && currentDevice && responsiveStyles) {
    const deviceCSS = blockStyleToCSSNoCascade(responsiveStyles, currentTheme, currentDevice);
    const textCSS = pickTextCascadeProps(deviceCSS);

    if (Object.keys(deviceCSS).length > 0) {
      lines.push(`${sel} {`);
      for (const [k, v] of Object.entries(deviceCSS)) {
        lines.push(`  ${k}: ${v} !important;`);
      }
      lines.push("}");
    }

    if (Object.keys(textCSS).length > 0) {
      lines.push(`${sel}, ${sel} * {`);
      for (const [k, v] of Object.entries(textCSS)) {
        lines.push(`  ${k}: ${v} !important;`);
      }
      lines.push("}");
    }
  }

  // Emit responsive advanced for current theme+device
  if (currentTheme && currentDevice && responsiveAdvanced) {
    const deviceAdv = responsiveAdvanced[currentTheme]?.[currentDevice];
    if (deviceAdv?.customCSS) {
      lines.push(`${sel} {`);
      lines.push(deviceAdv.customCSS);
      lines.push("}");
    }
    if (deviceAdv?.animation?.type && deviceAdv.animation.type !== "none") {
      const anim = deviceAdv.animation;
      lines.push(`${sel} {`);
      lines.push(`  animation-name: editor-${anim.type};`);
      lines.push(`  animation-duration: ${anim.duration || 500}ms;`);
      lines.push(`  animation-delay: ${anim.delay || 0}ms;`);
      lines.push(`  animation-fill-mode: both;`);
      if (anim.easing) lines.push(`  animation-timing-function: ${anim.easing};`);
      lines.push("}");
    }
    if (deviceAdv?.visibility?.desktop === false) {
      lines.push(`@media (min-width: 1025px) { ${sel} { display: none !important; } }`);
    }
    if (deviceAdv?.visibility?.tablet === false) {
      lines.push(`@media (min-width: 769px) and (max-width: 1024px) { ${sel} { display: none !important; } }`);
    }
    if (deviceAdv?.visibility?.mobile === false) {
      lines.push(`@media (max-width: 768px) { ${sel} { display: none !important; } }`);
    }
  }

  // Legacy advanced fallback (when no responsiveAdvanced)
  if (!responsiveAdvanced || (!responsiveAdvanced.light && !responsiveAdvanced.dark)) {
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
  }

  return lines.join("\n");
}

/**
 * Generate editor-only CSS for ALL blocks in a section.
 * Now includes responsive styles for the current device+theme.
 */
export function generateSectionEditorCSS(
  blocks: {
    id: string;
    advanced?: BlockAdvanced;
    responsiveStyles?: ResponsiveBlockStyles;
    responsiveAdvanced?: import("@/types/homepage").ResponsiveBlockAdvanced;
  }[],
  currentTheme?: SectionTheme,
  currentDevice?: EditorDevice,
): string {
  return blocks
    .map((b) => generateBlockEditorCSS(b.id, b.advanced, b.responsiveStyles, b.responsiveAdvanced, currentTheme, currentDevice))
    .filter(Boolean)
    .join("\n");
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
 * Convert a block's responsive style to React inline CSSProperties for the current device + theme.
 * Used by the editor canvas so style changes show instantly regardless of Tailwind specificity.
 */
export function blockStyleToInline(
  style: BlockStyle | undefined,
  device: EditorDevice,
  theme?: SectionTheme,
  responsiveStyles?: ResponsiveBlockStyles,
): React.CSSProperties {
  const css = blockStyleToCSS(style, device, theme, responsiveStyles);
  const result: Record<string, string> = {};
  for (const [prop, val] of Object.entries(css)) {
    if (val !== undefined && val !== "") {
      result[kebabToCamel(prop)] = val;
    }
  }
  return result as React.CSSProperties;
}

/**
 * Editor-only: convert a block's style to inline CSSProperties for EXACTLY the current device + theme.
 * Unlike blockStyleToInline, this does NOT cascade from other devices.
 * Each device shows only what it has explicitly set — no fallback to desktop/tablet/mobile.
 * This matches how the hero section previews each breakpoint independently.
 */
export function blockStyleToInlineEditor(
  responsiveStyles: ResponsiveBlockStyles | undefined,
  theme: SectionTheme,
  device: EditorDevice,
): React.CSSProperties {
  const bp = responsiveStyles?.[theme]?.[device];
  if (!bp) return {};
  const css = blockStyleToCSS(undefined, device, theme, { [theme]: { [device]: bp } });
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
  { label: "SF Pro Display", value: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Manrope", "Helvetica Neue", Arial, sans-serif' },
  { label: "SF Pro Text", value: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Inter", "Helvetica Neue", Arial, sans-serif' },
  { label: "Inter", value: '"Inter", ui-sans-serif, system-ui, sans-serif' },
  { label: "Manrope", value: '"Manrope", ui-sans-serif, system-ui, sans-serif' },
  { label: "System", value: "ui-sans-serif, system-ui, sans-serif" },
  { label: "Serif", value: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' },
  { label: "Mono", value: '"SF Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace' },
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
