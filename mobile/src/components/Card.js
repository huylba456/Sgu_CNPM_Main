import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '../styles/theme';

const Card = ({ children, style }) => <View style={[styles.card, style]}>{children}</View>;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6
  }
});

export default Card;
