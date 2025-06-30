/**
 * Theme extractor for Grafana design system tokens
 * Extracts color palettes, typography, spacing, and design tokens from Grafana theme files
 */

export interface ThemeTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  shadows: ShadowTokens;
  borderRadius: BorderRadiusTokens;
  zIndex: ZIndexTokens;
  breakpoints: BreakpointTokens;
}

export interface ColorTokens {
  primary: ColorScale;
  secondary: ColorScale;
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;
  text: TextColors;
  background: BackgroundColors;
  border: BorderColors;
  action: ActionColors;
}

export interface ColorScale {
  main: string;
  light: string;
  dark: string;
  contrastText: string;
}

export interface TextColors {
  primary: string;
  secondary: string;
  disabled: string;
  maxContrast: string;
  link: string;
}

export interface BackgroundColors {
  canvas: string;
  primary: string;
  secondary: string;
  dropdown: string;
  hover: string;
}

export interface BorderColors {
  weak: string;
  medium: string;
  strong: string;
}

export interface ActionColors {
  hover: string;
  focus: string;
  selected: string;
  selectedBorder: string;
  disabledBackground: string;
  disabledText: string;
}

export interface TypographyTokens {
  fontFamily: FontFamily;
  fontSize: FontSizeScale;
  fontWeight: FontWeightScale;
  lineHeight: LineHeightScale;
  letterSpacing: LetterSpacingScale;
}

export interface FontFamily {
  sans: string;
  mono: string;
}

export interface FontSizeScale {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  h6: string;
  h5: string;
  h4: string;
  h3: string;
  h2: string;
  h1: string;
}

export interface FontWeightScale {
  light: number;
  regular: number;
  medium: number;
  semibold: number;
  bold: number;
}

export interface LineHeightScale {
  xs: number;
  sm: number;
  md: number;
  lg: number;
}

export interface LetterSpacingScale {
  normal: string;
  wide: string;
}

export interface SpacingTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
  gridSize: number;
}

export interface ShadowTokens {
  z1: string;
  z2: string;
  z3: string;
}

export interface BorderRadiusTokens {
  default: string;
  pill: string;
  circle: string;
}

export interface ZIndexTokens {
  dropdown: number;
  sticky: number;
  fixed: number;
  modal: number;
  popover: number;
  tooltip: number;
}

export interface BreakpointTokens {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeMetadata {
  name: string;
  mode: "light" | "dark";
  version: string;
  tokensCount: number;
  categories: string[];
  hasColors: boolean;
  hasTypography: boolean;
  hasSpacing: boolean;
}

/**
 * Extract theme tokens from Grafana theme files
 * @param themeCode Theme file source code (TypeScript/JavaScript)
 * @returns ThemeTokens object
 */
export function extractThemeTokens(themeCode: string): Partial<ThemeTokens> {
  const tokens: Partial<ThemeTokens> = {};

  // Extract colors
  const colors = extractColors(themeCode);
  if (colors) tokens.colors = colors;

  // Extract typography
  const typography = extractTypography(themeCode);
  if (typography) tokens.typography = typography;

  // Extract spacing
  const spacing = extractSpacing(themeCode);
  if (spacing) tokens.spacing = spacing;

  // Extract shadows
  const shadows = extractShadows(themeCode);
  if (shadows) tokens.shadows = shadows;

  // Extract border radius
  const borderRadius = extractBorderRadius(themeCode);
  if (borderRadius) tokens.borderRadius = borderRadius;

  // Extract z-index values
  const zIndex = extractZIndex(themeCode);
  if (zIndex) tokens.zIndex = zIndex;

  // Extract breakpoints
  const breakpoints = extractBreakpoints(themeCode);
  if (breakpoints) tokens.breakpoints = breakpoints;

  return tokens;
}

/**
 * Extract color tokens from theme code
 * @param themeCode Theme source code
 * @returns ColorTokens object
 */
function extractColors(themeCode: string): ColorTokens | undefined {
  const colors: Partial<ColorTokens> = {};

  // Look for color definitions in various patterns
  const colorPatterns = [
    /colors?\s*:\s*\{([^}]*)\}/gs,
    /palette\s*:\s*\{([^}]*)\}/gs,
    /color\s*=\s*\{([^}]*)\}/gs,
  ];

  for (const pattern of colorPatterns) {
    const matches = themeCode.match(pattern);
    if (matches) {
      for (const match of matches) {
        const colorObj = parseColorObject(match);
        Object.assign(colors, colorObj);
      }
    }
  }

  // Extract specific color categories
  const primaryColors = extractColorScale(themeCode, "primary");
  if (primaryColors) colors.primary = primaryColors;

  const secondaryColors = extractColorScale(themeCode, "secondary");
  if (secondaryColors) colors.secondary = secondaryColors;

  const successColors = extractColorScale(themeCode, "success");
  if (successColors) colors.success = successColors;

  const warningColors = extractColorScale(themeCode, "warning");
  if (warningColors) colors.warning = warningColors;

  const errorColors = extractColorScale(themeCode, "error");
  if (errorColors) colors.error = errorColors;

  const infoColors = extractColorScale(themeCode, "info");
  if (infoColors) colors.info = infoColors;

  const textColors = extractTextColors(themeCode);
  if (textColors) colors.text = textColors;

  const backgroundColors = extractBackgroundColors(themeCode);
  if (backgroundColors) colors.background = backgroundColors;

  const borderColors = extractBorderColors(themeCode);
  if (borderColors) colors.border = borderColors;

  const actionColors = extractActionColors(themeCode);
  if (actionColors) colors.action = actionColors;

  return Object.keys(colors).length > 0 ? (colors as ColorTokens) : undefined;
}

/**
 * Extract typography tokens from theme code
 * @param themeCode Theme source code
 * @returns TypographyTokens object
 */
function extractTypography(themeCode: string): TypographyTokens | undefined {
  const typography: Partial<TypographyTokens> = {};

  // Extract font families
  const fontFamilyRegex = /fontFamily[^:]*:\s*['"`]([^'"`]+)['"`]/g;
  let fontFamilyMatch;
  const fontFamilies: string[] = [];

  while ((fontFamilyMatch = fontFamilyRegex.exec(themeCode)) !== null) {
    fontFamilies.push(fontFamilyMatch[1]);
  }

  if (fontFamilies.length > 0) {
    typography.fontFamily = {
      sans: fontFamilies.find((f) => !f.includes("mono")) || fontFamilies[0],
      mono: fontFamilies.find((f) => f.includes("mono")) || "monospace",
    };
  }

  // Extract font sizes
  const fontSizes = extractFontSizes(themeCode);
  if (fontSizes) typography.fontSize = fontSizes;

  const fontWeights = extractFontWeights(themeCode);
  if (fontWeights) typography.fontWeight = fontWeights;

  const lineHeights = extractLineHeights(themeCode);
  if (lineHeights) typography.lineHeight = lineHeights;

  const letterSpacing = extractLetterSpacing(themeCode);
  if (letterSpacing) typography.letterSpacing = letterSpacing;

  return Object.keys(typography).length > 0
    ? (typography as TypographyTokens)
    : undefined;
}

/**
 * Extract spacing tokens from theme code
 * @param themeCode Theme source code
 * @returns SpacingTokens object
 */
function extractSpacing(themeCode: string): SpacingTokens | undefined {
  const spacing: Partial<SpacingTokens> = {};

  // Look for spacing definitions
  const spacingPatterns = [
    /spacing\s*:\s*\{([^}]*)\}/gs,
    /space\s*:\s*\{([^}]*)\}/gs,
    /gridSize\s*:\s*(\d+)/g,
  ];

  for (const pattern of spacingPatterns) {
    const matches = themeCode.match(pattern);
    if (matches) {
      for (const match of matches) {
        if (match.includes("gridSize")) {
          const gridSizeMatch = match.match(/gridSize\s*:\s*(\d+)/);
          if (gridSizeMatch) {
            spacing.gridSize = parseInt(gridSizeMatch[1], 10);
          }
        } else {
          const spacingObj = parseSpacingObject(match);
          Object.assign(spacing, spacingObj);
        }
      }
    }
  }

  return Object.keys(spacing).length > 0
    ? (spacing as SpacingTokens)
    : undefined;
}

/**
 * Extract shadow tokens from theme code
 * @param themeCode Theme source code
 * @returns ShadowTokens object
 */
function extractShadows(themeCode: string): ShadowTokens | undefined {
  const shadows: Partial<ShadowTokens> = {};

  const shadowRegex = /shadow[^:]*:\s*['"`]([^'"`]+)['"`]/g;
  let match;

  while ((match = shadowRegex.exec(themeCode)) !== null) {
    const shadowValue = match[1];

    if (match[0].includes("z1")) {
      shadows.z1 = shadowValue;
    } else if (match[0].includes("z2")) {
      shadows.z2 = shadowValue;
    } else if (match[0].includes("z3")) {
      shadows.z3 = shadowValue;
    }
  }

  return Object.keys(shadows).length > 0
    ? (shadows as ShadowTokens)
    : undefined;
}

/**
 * Extract border radius tokens from theme code
 * @param themeCode Theme source code
 * @returns BorderRadiusTokens object
 */
function extractBorderRadius(
  themeCode: string,
): BorderRadiusTokens | undefined {
  const borderRadius: Partial<BorderRadiusTokens> = {};

  const radiusRegex = /radius[^:]*:\s*['"`]?([^'"`\s,}]+)['"`]?/g;
  let match;

  while ((match = radiusRegex.exec(themeCode)) !== null) {
    const radiusValue = match[1];

    if (match[0].includes("default") || match[0].includes("base")) {
      borderRadius.default = radiusValue;
    } else if (match[0].includes("pill")) {
      borderRadius.pill = radiusValue;
    } else if (match[0].includes("circle")) {
      borderRadius.circle = radiusValue;
    }
  }

  return Object.keys(borderRadius).length > 0
    ? (borderRadius as BorderRadiusTokens)
    : undefined;
}

/**
 * Extract z-index tokens from theme code
 * @param themeCode Theme source code
 * @returns ZIndexTokens object
 */
function extractZIndex(themeCode: string): ZIndexTokens | undefined {
  const zIndex: Partial<ZIndexTokens> = {};

  const zIndexRegex = /zIndex[^:]*:\s*(\d+)/g;
  let match;

  while ((match = zIndexRegex.exec(themeCode)) !== null) {
    const zIndexValue = parseInt(match[1], 10);

    if (match[0].includes("dropdown")) {
      zIndex.dropdown = zIndexValue;
    } else if (match[0].includes("modal")) {
      zIndex.modal = zIndexValue;
    } else if (match[0].includes("tooltip")) {
      zIndex.tooltip = zIndexValue;
    }
  }

  return Object.keys(zIndex).length > 0 ? (zIndex as ZIndexTokens) : undefined;
}

/**
 * Extract breakpoint tokens from theme code
 * @param themeCode Theme source code
 * @returns BreakpointTokens object
 */
function extractBreakpoints(themeCode: string): BreakpointTokens | undefined {
  const breakpoints: Partial<BreakpointTokens> = {};

  const breakpointRegex = /breakpoint[^:]*:\s*(\d+)/g;
  let match;

  while ((match = breakpointRegex.exec(themeCode)) !== null) {
    const breakpointValue = parseInt(match[1], 10);

    if (match[0].includes("xs")) {
      breakpoints.xs = breakpointValue;
    } else if (match[0].includes("sm")) {
      breakpoints.sm = breakpointValue;
    } else if (match[0].includes("md")) {
      breakpoints.md = breakpointValue;
    } else if (match[0].includes("lg")) {
      breakpoints.lg = breakpointValue;
    } else if (match[0].includes("xl")) {
      breakpoints.xl = breakpointValue;
    }
  }

  return Object.keys(breakpoints).length > 0
    ? (breakpoints as BreakpointTokens)
    : undefined;
}

// Helper functions for parsing specific token types

function extractColorScale(
  themeCode: string,
  colorName: string,
): ColorScale | undefined {
  const colorScale: Partial<ColorScale> = {};

  const patterns = [
    new RegExp(`${colorName}[^:]*main[^:]*:\\s*['"\`]([^'"\`]+)['"\`]`, "g"),
    new RegExp(`${colorName}[^:]*light[^:]*:\\s*['"\`]([^'"\`]+)['"\`]`, "g"),
    new RegExp(`${colorName}[^:]*dark[^:]*:\\s*['"\`]([^'"\`]+)['"\`]`, "g"),
    new RegExp(
      `${colorName}[^:]*contrast[^:]*:\\s*['"\`]([^'"\`]+)['"\`]`,
      "g",
    ),
  ];

  const keys = ["main", "light", "dark", "contrastText"];

  patterns.forEach((pattern, index) => {
    const match = themeCode.match(pattern);
    if (match) {
      colorScale[keys[index] as keyof ColorScale] = match[1];
    }
  });

  return Object.keys(colorScale).length > 0
    ? (colorScale as ColorScale)
    : undefined;
}

function extractTextColors(themeCode: string): TextColors | undefined {
  const textColors: Partial<TextColors> = {};

  const textPatterns = {
    primary: /text[^:]*primary[^:]*:\s*['"`]([^'"`]+)['"`]/g,
    secondary: /text[^:]*secondary[^:]*:\s*['"`]([^'"`]+)['"`]/g,
    disabled: /text[^:]*disabled[^:]*:\s*['"`]([^'"`]+)['"`]/g,
    link: /text[^:]*link[^:]*:\s*['"`]([^'"`]+)['"`]/g,
  };

  Object.entries(textPatterns).forEach(([key, pattern]) => {
    const match = themeCode.match(pattern);
    if (match) {
      textColors[key as keyof TextColors] = match[1];
    }
  });

  return Object.keys(textColors).length > 0
    ? (textColors as TextColors)
    : undefined;
}

function extractBackgroundColors(
  themeCode: string,
): BackgroundColors | undefined {
  const backgroundColors: Partial<BackgroundColors> = {};

  const bgPatterns = {
    canvas: /background[^:]*canvas[^:]*:\s*['"`]([^'"`]+)['"`]/g,
    primary: /background[^:]*primary[^:]*:\s*['"`]([^'"`]+)['"`]/g,
    secondary: /background[^:]*secondary[^:]*:\s*['"`]([^'"`]+)['"`]/g,
    dropdown: /background[^:]*dropdown[^:]*:\s*['"`]([^'"`]+)['"`]/g,
    hover: /background[^:]*hover[^:]*:\s*['"`]([^'"`]+)['"`]/g,
  };

  Object.entries(bgPatterns).forEach(([key, pattern]) => {
    const match = themeCode.match(pattern);
    if (match) {
      backgroundColors[key as keyof BackgroundColors] = match[1];
    }
  });

  return Object.keys(backgroundColors).length > 0
    ? (backgroundColors as BackgroundColors)
    : undefined;
}

function extractBorderColors(themeCode: string): BorderColors | undefined {
  const borderColors: Partial<BorderColors> = {};

  const borderPatterns = {
    weak: /border[^:]*weak[^:]*:\s*['"`]([^'"`]+)['"`]/g,
    medium: /border[^:]*medium[^:]*:\s*['"`]([^'"`]+)['"`]/g,
    strong: /border[^:]*strong[^:]*:\s*['"`]([^'"`]+)['"`]/g,
  };

  Object.entries(borderPatterns).forEach(([key, pattern]) => {
    const match = themeCode.match(pattern);
    if (match) {
      borderColors[key as keyof BorderColors] = match[1];
    }
  });

  return Object.keys(borderColors).length > 0
    ? (borderColors as BorderColors)
    : undefined;
}

function extractActionColors(themeCode: string): ActionColors | undefined {
  const actionColors: Partial<ActionColors> = {};

  const actionPatterns = {
    hover: /action[^:]*hover[^:]*:\s*['"`]([^'"`]+)['"`]/g,
    focus: /action[^:]*focus[^:]*:\s*['"`]([^'"`]+)['"`]/g,
    selected: /action[^:]*selected[^:]*:\s*['"`]([^'"`]+)['"`]/g,
    disabledBackground:
      /action[^:]*disabled[^:]*background[^:]*:\s*['"`]([^'"`]+)['"`]/g,
    disabledText: /action[^:]*disabled[^:]*text[^:]*:\s*['"`]([^'"`]+)['"`]/g,
  };

  Object.entries(actionPatterns).forEach(([key, pattern]) => {
    const match = themeCode.match(pattern);
    if (match) {
      actionColors[key as keyof ActionColors] = match[1];
    }
  });

  return Object.keys(actionColors).length > 0
    ? (actionColors as ActionColors)
    : undefined;
}

function extractFontSizes(themeCode: string): FontSizeScale | undefined {
  const fontSizes: Partial<FontSizeScale> = {};

  const sizePatterns = {
    xs: /fontSize[^:]*xs[^:]*:\s*['"`]([^'"`]+)['"`]/g,
    sm: /fontSize[^:]*sm[^:]*:\s*['"`]([^'"`]+)['"`]/g,
    md: /fontSize[^:]*md[^:]*:\s*['"`]([^'"`]+)['"`]/g,
    lg: /fontSize[^:]*lg[^:]*:\s*['"`]([^'"`]+)['"`]/g,
    xl: /fontSize[^:]*xl[^:]*:\s*['"`]([^'"`]+)['"`]/g,
    h1: /fontSize[^:]*h1[^:]*:\s*['"`]([^'"`]+)['"`]/g,
    h2: /fontSize[^:]*h2[^:]*:\s*['"`]([^'"`]+)['"`]/g,
    h3: /fontSize[^:]*h3[^:]*:\s*['"`]([^'"`]+)['"`]/g,
    h4: /fontSize[^:]*h4[^:]*:\s*['"`]([^'"`]+)['"`]/g,
    h5: /fontSize[^:]*h5[^:]*:\s*['"`]([^'"`]+)['"`]/g,
    h6: /fontSize[^:]*h6[^:]*:\s*['"`]([^'"`]+)['"`]/g,
  };

  Object.entries(sizePatterns).forEach(([key, pattern]) => {
    const match = themeCode.match(pattern);
    if (match) {
      fontSizes[key as keyof FontSizeScale] = match[1];
    }
  });

  return Object.keys(fontSizes).length > 0
    ? (fontSizes as FontSizeScale)
    : undefined;
}

function extractFontWeights(themeCode: string): FontWeightScale | undefined {
  const fontWeights: Partial<FontWeightScale> = {};

  const weightPatterns = {
    light: /fontWeight[^:]*light[^:]*:\s*(\d+)/g,
    regular: /fontWeight[^:]*regular[^:]*:\s*(\d+)/g,
    medium: /fontWeight[^:]*medium[^:]*:\s*(\d+)/g,
    semibold: /fontWeight[^:]*semibold[^:]*:\s*(\d+)/g,
    bold: /fontWeight[^:]*bold[^:]*:\s*(\d+)/g,
  };

  Object.entries(weightPatterns).forEach(([key, pattern]) => {
    const match = themeCode.match(pattern);
    if (match) {
      fontWeights[key as keyof FontWeightScale] = parseInt(match[1], 10);
    }
  });

  return Object.keys(fontWeights).length > 0
    ? (fontWeights as FontWeightScale)
    : undefined;
}

function extractLineHeights(themeCode: string): LineHeightScale | undefined {
  const lineHeights: Partial<LineHeightScale> = {};

  const lineHeightPatterns = {
    xs: /lineHeight[^:]*xs[^:]*:\s*([\d.]+)/g,
    sm: /lineHeight[^:]*sm[^:]*:\s*([\d.]+)/g,
    md: /lineHeight[^:]*md[^:]*:\s*([\d.]+)/g,
    lg: /lineHeight[^:]*lg[^:]*:\s*([\d.]+)/g,
  };

  Object.entries(lineHeightPatterns).forEach(([key, pattern]) => {
    const match = themeCode.match(pattern);
    if (match) {
      lineHeights[key as keyof LineHeightScale] = parseFloat(match[1]);
    }
  });

  return Object.keys(lineHeights).length > 0
    ? (lineHeights as LineHeightScale)
    : undefined;
}

function extractLetterSpacing(
  themeCode: string,
): LetterSpacingScale | undefined {
  const letterSpacing: Partial<LetterSpacingScale> = {};

  const spacingPatterns = {
    normal: /letterSpacing[^:]*normal[^:]*:\s*['"`]([^'"`]+)['"`]/g,
    wide: /letterSpacing[^:]*wide[^:]*:\s*['"`]([^'"`]+)['"`]/g,
  };

  Object.entries(spacingPatterns).forEach(([key, pattern]) => {
    const match = themeCode.match(pattern);
    if (match) {
      letterSpacing[key as keyof LetterSpacingScale] = match[1];
    }
  });

  return Object.keys(letterSpacing).length > 0
    ? (letterSpacing as LetterSpacingScale)
    : undefined;
}

function parseColorObject(colorMatch: string): Partial<ColorTokens> {
  // Simple parser for color objects - can be enhanced
  const colors: Partial<ColorTokens> = {};

  const colorRegex = /(\w+):\s*['"`]([^'"`]+)['"`]/g;
  let match;

  while ((match = colorRegex.exec(colorMatch)) !== null) {
    const [, key, value] = match;
    // This is a simplified implementation
    // In a real implementation, you'd want more sophisticated parsing
  }

  return colors;
}

function parseSpacingObject(spacingMatch: string): Partial<SpacingTokens> {
  const spacing: Partial<SpacingTokens> = {};

  const spacingRegex = /(\w+):\s*['"`]?([^'"`\s,}]+)['"`]?/g;
  let match;

  while ((match = spacingRegex.exec(spacingMatch)) !== null) {
    const [, key, value] = match;

    if (
      key === "xs" ||
      key === "sm" ||
      key === "md" ||
      key === "lg" ||
      key === "xl" ||
      key === "xxl"
    ) {
      (spacing as any)[key] = value;
    } else if (key === "gridSize") {
      spacing.gridSize = parseInt(value, 10);
    }
  }

  return spacing;
}

/**
 * Extract theme metadata from theme file
 * @param themeCode Theme source code
 * @returns Theme metadata
 */
export function extractThemeMetadata(themeCode: string): ThemeMetadata {
  const tokens = extractThemeTokens(themeCode);

  return {
    name: extractThemeName(themeCode) || "Grafana Theme",
    mode: detectThemeMode(themeCode),
    version: extractVersion(themeCode) || "1.0.0",
    tokensCount: countTokens(tokens),
    categories: Object.keys(tokens),
    hasColors: !!tokens.colors,
    hasTypography: !!tokens.typography,
    hasSpacing: !!tokens.spacing,
  };
}

function extractThemeName(themeCode: string): string | undefined {
  const nameRegex = /name\s*:\s*['"`]([^'"`]+)['"`]/;
  const match = themeCode.match(nameRegex);
  return match ? match[1] : undefined;
}

function detectThemeMode(themeCode: string): "light" | "dark" {
  const darkIndicators = ["dark", "night", "black"];
  const lightIndicators = ["light", "day", "white"];

  const codeLC = themeCode.toLowerCase();

  if (darkIndicators.some((indicator) => codeLC.includes(indicator))) {
    return "dark";
  }

  return "light";
}

function extractVersion(themeCode: string): string | undefined {
  const versionRegex = /version\s*:\s*['"`]([^'"`]+)['"`]/;
  const match = themeCode.match(versionRegex);
  return match ? match[1] : undefined;
}

function countTokens(tokens: Partial<ThemeTokens>): number {
  let count = 0;

  Object.values(tokens).forEach((tokenCategory) => {
    if (typeof tokenCategory === "object" && tokenCategory !== null) {
      count += countObjectProperties(tokenCategory);
    }
  });

  return count;
}

function countObjectProperties(obj: any): number {
  let count = 0;

  for (const value of Object.values(obj)) {
    if (typeof value === "object" && value !== null) {
      count += countObjectProperties(value);
    } else {
      count++;
    }
  }

  return count;
}

/**
 * Filter theme tokens by category
 * @param tokens Theme tokens
 * @param category Category to filter by
 * @returns Filtered tokens
 */
export function filterTokensByCategory(
  tokens: Partial<ThemeTokens>,
  category: string,
): any {
  const categoryMap: Record<string, keyof ThemeTokens> = {
    colors: "colors",
    color: "colors",
    typography: "typography",
    font: "typography",
    spacing: "spacing",
    space: "spacing",
    shadows: "shadows",
    shadow: "shadows",
    radius: "borderRadius",
    borderRadius: "borderRadius",
    zIndex: "zIndex",
    z: "zIndex",
    breakpoints: "breakpoints",
    breakpoint: "breakpoints",
  };

  const mappedCategory = categoryMap[category.toLowerCase()];

  if (mappedCategory && tokens[mappedCategory]) {
    return { [mappedCategory]: tokens[mappedCategory] };
  }

  return tokens;
}
