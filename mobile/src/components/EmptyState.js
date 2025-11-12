import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../styles/theme';

const EmptyState = ({ title, description }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {description ? <Text style={styles.description}>{description}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center'
  },
  title: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: '600',
    textAlign: 'center'
  },
  description: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    textAlign: 'center'
  }
});

export default EmptyState;
