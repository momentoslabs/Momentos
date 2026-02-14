// Calculate relative luminance of a color (0-1, where 0 is darkest, 1 is lightest)
// Uses WCAG formula for perceived brightness
export const calculateLuminance = (hex: string): number => {
  // Remove # if present
  const color = hex.replace("#", "");

  // Parse RGB values
  const r = parseInt(color.substring(0, 2), 16) / 255;
  const g = parseInt(color.substring(2, 4), 16) / 255;
  const b = parseInt(color.substring(4, 6), 16) / 255;

  // Apply gamma correction
  const [rs, gs, bs] = [r, g, b].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );

  // Calculate luminance
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

// Determine if a color is light (true) or dark (false)
export const isLightColor = (hex: string): boolean => {
  return calculateLuminance(hex) > 0.5;
};

// Core color palette - only 7 colors total
const colors = {
  // Single background
  background: "#444444",

  // Borders
  primaryBorder: "#888888",
  secondaryBorder: "#cccccc",

  // Grid
  gridBackground: "#eeeeee",

  // Status
  success: "#44ee44",
  error: "#ee4444",

  // Accent (controls all highlights, accents, and icon colors)
  accent: "#4444ee",

  // Text colors
  lightText: "#000000",
  darkText: "#ffffff",
} as const;

// Theme-aware color mappings
export const getThemeColors = (customColors?: {
  background?: string;
  primaryBorder?: string;
  secondaryBorder?: string;
  gridBackground?: string;
  success?: string;
  error?: string;
  accent?: string;
}) => {
  const bgColor = customColors?.background || colors.background;
  const isLight = isLightColor(bgColor);

  return {
    // Backgrounds
    background: bgColor,
    surface: bgColor,
    gridBackground: customColors?.gridBackground || colors.gridBackground,

    // Borders and lines
    border: customColors?.primaryBorder || colors.primaryBorder,
    primaryBorder: customColors?.primaryBorder || colors.primaryBorder,
    gridLine: customColors?.secondaryBorder || colors.secondaryBorder,
    secondaryBorder: customColors?.secondaryBorder || colors.secondaryBorder,

    // Text (automatically determined based on background)
    text: isLight ? colors.lightText : colors.darkText,

    // Accent (used for all icons, highlights, selections)
    accent: customColors?.accent || colors.accent,
    primary: customColors?.accent || colors.accent,

    // Status
    success: customColors?.success || colors.success,
    error: customColors?.error || colors.error,

    // Expose whether background is light or dark
    isLight,
  };
};

export type ThemeColors = ReturnType<typeof getThemeColors>;

export default colors;
