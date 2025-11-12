import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, typography } from '../styles/theme';

const Chip = ({ label, active, onPress }) => (
  <Pressable onPress={onPress} style={[styles.base, active ? styles.active : styles.inactive]}>
    <Text style={[styles.label, active ? styles.activeLabel : null]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginRight: spacing.sm
  },
  inactive: {
    backgroundColor: colors.surface,
    borderColor: colors.border
  },
  active: {
    backgroundColor: colors.primary,
    borderColor: colors.primarySoft
  },
  label: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: '500'
  },
  activeLabel: {
    color: colors.textOnPrimary
  }
});

export default Chip;
