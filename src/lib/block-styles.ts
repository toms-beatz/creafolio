/**
 * Shared spacing / radius maps for all builder blocks + the properties panel.
 * Keep these in sync with the SpacingButtons / RadiusButtons UI components.
 */

export const SPACING_PX: Record<string, string> = {
  none: "0px",
  xs: "16px",
  sm: "32px",
  md: "48px",
  lg: "80px",
  xl: "120px",
};

export const RADIUS_PX: Record<string, string> = {
  none: "0px",
  sm: "6px",
  md: "12px",
  lg: "20px",
  xl: "32px",
  full: "9999px",
};
