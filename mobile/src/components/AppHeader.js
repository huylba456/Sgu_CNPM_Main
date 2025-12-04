import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../styles/theme';
import Stack from './Stack';

const AppHeader = ({ title, subtitle, trailing, leading, layout = 'row' }) => {
  if (layout === 'stacked') {
    return (
      <Stack direction="column" align="center" gap={spacing.sm}>
        {leading ? <View style={[styles.leading, styles.leadingStacked]}>{leading}</View> : null}
        <View style={[styles.textContainer, styles.textContainerCentered]}>
          <Text style={[styles.title, styles.titleCentered]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, styles.subtitleCentered]}>{subtitle}</Text> : null}
        </View>
        {trailing ? <View style={[styles.trailing, styles.trailingStacked]}>{trailing}</View> : null}
      </Stack>
    );
  }

  return (
    <Stack direction="row" align="center" justify="space-between" gap={spacing.md}>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </Stack>
  );
};

const styles = StyleSheet.create({
  leading: {
    marginRight: spacing.sm
  },
  leadingStacked: {
    marginRight: 0,
    marginBottom: spacing.xs
  },
  textContainer: {
    flex: 1
  },
  textContainerCentered: {
    alignItems: 'center'
  },
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700'
  },
  titleCentered: {
    textAlign: 'center'
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: typography.small
  },
  subtitleCentered: {
    textAlign: 'center'
  },
  trailing: {
    marginLeft: spacing.md
  },
  trailingStacked: {
    marginLeft: 0,
    marginTop: spacing.xs
  }
});

export default AppHeader;
