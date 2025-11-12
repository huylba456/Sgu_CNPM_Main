import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, typography } from '../styles/theme';

const Button = ({ label, onPress, variant = 'primary', disabled, style }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.base,
      styles[variant],
      pressed && !disabled ? styles.pressed : null,
      disabled ? styles.disabled : null,
      style
    ]}
    disabled={disabled}
  >
    <Text style={[styles.label, styles[`${variant}Label`], disabled ? styles.disabledLabel : null]}>
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center'
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primarySoft
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: colors.border
  },
  primaryLabel: {
    color: colors.textOnPrimary,
    fontWeight: '600'
  },
  secondaryLabel: {
    color: colors.text
  },
  ghostLabel: {
    color: colors.textMuted
  },
  label: {
    fontSize: typography.body
  },
  pressed: {
    opacity: 0.8
  },
  disabled: {
    opacity: 0.5
  },
  disabledLabel: {
    color: colors.textMuted
  }
});

export default Button;
