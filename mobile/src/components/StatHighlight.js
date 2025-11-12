import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../styles/theme';

const StatHighlight = ({ label, value, helpText, tone = 'default' }) => (
  <View style={[styles.card, toneStyles[tone] ?? toneStyles.default]}>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
    {helpText ? <Text style={styles.help}>{helpText}</Text> : null}
  </View>
);

const toneStyles = {
  default: {
    backgroundColor: colors.surface
  },
  accent: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.accent
  },
  success: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.success
  }
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs
  },
  value: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700'
  },
  label: {
    color: colors.textMuted,
    fontSize: typography.small,
    textTransform: 'uppercase'
  },
  help: {
    color: colors.accent,
    fontSize: typography.small
  }
});

export default StatHighlight;
