import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../styles/theme';

const formatShort = (value) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
};

const niceMax = (raw) => {
  if (raw <= 0) return 100;
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
  const normalized = raw / magnitude;
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
};

const CHART_HEIGHT = 220;
const TICK_COUNT = 4;

const RevenueChart = ({ data = [], title, subtitle = '' }) => {
  const rawMax = Math.max(...data.map((item) => item.value), 0);
  const maxValue = niceMax(rawMax);
  const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, i) => (maxValue / TICK_COUNT) * (TICK_COUNT - i));

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
          <View style={styles.chartBody}>
            <View style={styles.yAxis}>
              {ticks.map((tick) => (
                <Text key={tick} style={styles.yLabel}>{formatShort(tick)}</Text>
              ))}
            </View>
            <View style={styles.plotArea}>
              {ticks.map((tick) => (
                <View
                  key={tick}
                  style={[
                    styles.gridLine,
                    { top: `${((maxValue - tick) / maxValue) * 100}%` }
                  ]}
                />
              ))}
              <View style={styles.barRow}>
                {data.map((item) => {
                  const pct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                  return (
                    <View key={item.label} style={styles.barItem}>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.bar,
                            { height: `${pct}%`, opacity: item.value ? 1 : 0.25 }
                          ]}
                        />
                      </View>
                      <Text style={styles.barLabel}>{item.label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
          <View style={styles.valueSummary}>
            {data.map((item) => (
              <Text key={item.label} style={styles.barValue}>
                {item.value.toLocaleString('vi-VN')} đ
              </Text>
            ))}
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
  chartFrame: {
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm
  },
  chartBody: {
    flexDirection: 'row',
    height: CHART_HEIGHT
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: spacing.xs,
    paddingVertical: 2
  },
  yLabel: {
    color: colors.textMuted,
    fontSize: 10
  },
  plotArea: {
    flex: 1,
    position: 'relative'
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '100%',
    paddingHorizontal: spacing.xs
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    gap: 4
  },
  barTrack: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  bar: {
    width: '55%',
    backgroundColor: colors.primary,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    minHeight: 4
  },
  barLabel: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center'
  },
  valueSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  barValue: {
    flex: 1,
    color: colors.text,
    fontWeight: '600',
    fontSize: 10,
    textAlign: 'center'
  }
});

export default RevenueChart;
