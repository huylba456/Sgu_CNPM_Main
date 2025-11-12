import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../styles/theme';

const Screen = ({ children, scrollable = true, style, contentStyle }) => {
  if (scrollable) {
    return (
      <SafeAreaView style={[styles.safeArea, style]}>
        <ScrollView contentContainerStyle={[styles.content, contentStyle]}>{children}</ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.lg
  }
});

export default Screen;
