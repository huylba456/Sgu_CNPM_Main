import { StyleSheet } from 'react-native';

const originalFlatten = StyleSheet.flatten;

const normalizeGapStyle = (style) => {
  if (!style) return style;
  const flattened = originalFlatten(style);
  if (!flattened) return flattened;

  const { gap, rowGap, columnGap, ...rest } = flattened;
  const normalized = { ...rest };

  const resolvedRowGap = rowGap ?? gap;
  const resolvedColumnGap = columnGap ?? gap;

  if (resolvedRowGap !== undefined) {
    normalized.rowGap = resolvedRowGap;
  }
  if (resolvedColumnGap !== undefined) {
    normalized.columnGap = resolvedColumnGap;
  }

  return normalized;
};

const originalCreate = StyleSheet.create;
StyleSheet.create = (styles) => {
  const patched = Object.fromEntries(
    Object.entries(styles).map(([key, value]) => [key, normalizeGapStyle(value)])
  );
  return originalCreate(patched);
};

StyleSheet.flatten = (input) => normalizeGapStyle(originalFlatten(input));
