import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../styles/theme';
import Stack from './Stack';

const AppHeader = ({ title, subtitle, trailing }) => (
  <Stack direction="row" align="center" justify="space-between" gap={spacing.md}>
    <View style={styles.textContainer}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
    {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
  </Stack>
);

const styles = StyleSheet.create({
  textContainer: {
    flex: 1
  },
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700'
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: typography.small
  },
  trailing: {
    marginLeft: spacing.md
  }
});

export default AppHeader;
