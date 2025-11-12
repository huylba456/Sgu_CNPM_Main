import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../styles/theme';

const AppHeader = ({ title, subtitle, trailing }) => (
  <View style={styles.container}>
    <View style={styles.textContainer}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
    {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md
  },
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
