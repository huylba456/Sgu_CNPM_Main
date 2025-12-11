import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../styles/theme';

const RevenueChart = ({ data = [], title, subtitle = '' }) => {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.legend}>
          <View style={styles.legendDot} />
          <Text style={styles.legendLabel}>Doanh thu</Text>
        </View>
      </View>
      {data.length ? (
        <View style={styles.chartFrame}>
          <View style={styles.chartArea}>
            <View style={styles.barRow}>
              {data.map((item) => (
                <View key={item.label} style={styles.barItem}>
                  <View
                    style={[
                      styles.bar,
                      { height: `${(item.value / maxValue) * 100}%`, opacity: item.value ? 1 : 0.35 }
                    ]}
                  />
                  <Text style={styles.barLabel}>{item.label}</Text>
                  <Text style={styles.barValue}>{item.value.toLocaleString('vi-VN')} đ</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      ) : (
        <Text style={styles.subtitle}>Chưa có dữ liệu doanh thu.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm
  },
  title: {
    fontSize: typography.subtitle,
    fontWeight: '700',
    color: colors.text
  },
  subtitle: {
    color: colors.textMuted
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary
  },
  legendLabel: {
    color: colors.textMuted
  },
  chartArea: {
    height: '100%',
    justifyContent: 'flex-end'
  },
  chartFrame: {
    height: 240,
    backgroundColor: colors.background,
    borderRadius: 14,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden'
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.xs,
    height: '100%',
    paddingHorizontal: spacing.xs
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6
  },
  bar: {
    width: '70%',
    backgroundColor: colors.primary,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    minHeight: 8,
    maxHeight: '80%'
  },
  barLabel: {
    color: colors.textMuted,
    fontSize: typography.helper,
    textAlign: 'center'
  },
  barValue: {
    color: colors.text,
    fontWeight: '600',
    fontSize: typography.helper,
    textAlign: 'center'
  }
});

export default RevenueChart;
