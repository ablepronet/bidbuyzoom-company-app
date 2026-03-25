import React from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { AppText } from './AppText';
import { colors } from '../constants';
import { ms, vs } from '../utils/responsive';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

interface ChartItem {
  label: string;
  value: number;
  formattedValue?: string;
  maxValue: number;
}

const ChartBar = ({ label, value, formattedValue, maxValue }: ChartItem) => {
  // Calculate bar width percentage
  const barWidthPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const barWidth = (barWidthPercent / 100) * (width - ms(140));
  
  const displayValue = formattedValue || value.toString();
  const hasValue = value > 0;

  return (
    <View style={styles.barContainer}>
      <View style={styles.labelContainer}>
        <AppText
          title={label}
          fontySize="px12"
          color="textPrimary"
          numberOfLines={1}
          style={styles.labelText}
        />
      </View>
      <View style={styles.barWrapper}>
        {/* Dotted line background */}
        <View style={styles.dottedLine} />
        
        {/* Only show blue bar if value > 0 */}
        {hasValue && (
          <View style={[styles.bar, { width: Math.max(barWidth, ms(50)) }]}>
            <AppText
              title={displayValue}
              fontySize="px10"
              fontFamily="bold"
              color="dark"
              style={styles.barValue}
            />
          </View>
        )}
        
        {/* Show value text for zero values */}
        {!hasValue && (
          <AppText
            title="0"
            fontySize="px10"
            fontFamily="bold"
            color="textPrimary"
            style={styles.zeroValue}
          />
        )}
      </View>
    </View>
  );
};

interface PerformanceAnalyticsProps {
  data: {
    lots: number;
    bidders: number;
    sales: number;
    commission: number;
    premium: number;
  };
  year: string;
}

const PerformanceAnalytics = ({ data, year }: PerformanceAnalyticsProps) => {
  const chartItems = [
    { label: 'Number of Lots', value: data.lots, maxValue: 340 },
    { label: 'Number of Bidders', value: data.bidders, maxValue: 340 },
    {
      label: 'Total Sales',
      value: data.sales,
      formattedValue: `$${data.sales}`,
      maxValue: 340,
    },
    {
      label: 'Commission',
      value: data.commission,
      formattedValue: `$${data.commission}`,
      maxValue: 340,
    },
    {
      label: 'Buyer Premium',
      value: data.premium,
      formattedValue: `$${data.premium}`,
      maxValue: 340,
    },
  ];

  // X-axis labels from 0 to 340 in increments of 20
  const xAxisLabels = [];
  for (let i = 0; i <= 340; i += 20) {
    xAxisLabels.push(i);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText
          title={`Sales Chart (${year})`}
          fontySize="px12"
          color="textSecondary"
          fontFamily="medium"
        />
        <Icon
          name="ellipsis-vertical"
          size={ms(16)}
          color={colors.textSecondary}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          <View style={styles.chartBody}>
            {chartItems.map((item, index) => (
              <ChartBar key={index} {...item} />
            ))}
          </View>

          {/* X-Axis Labels */}
          <View style={styles.xAxisContainer}>
            {xAxisLabels.map((val, idx) => (
              <View key={idx} style={styles.xAxisLabelWrapper}>
                <AppText
                  title={val.toString()}
                  fontySize="px8"
                  color="textSecondary"
                  style={styles.xAxisLabel}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: vs(12),
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(20),
    paddingHorizontal: ms(16),
  },
  chartContainer: {
    paddingLeft: ms(120),
    paddingRight: ms(16),
  },
  chartBody: {
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E9ECEF',
    paddingBottom: vs(8),
    minWidth: ms(600),
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(12),
    minHeight: vs(32),
    position: 'relative',
  },
  labelContainer: {
    width: ms(110),
    position: 'absolute',
    left: -ms(120),
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  labelText: {
    textAlign: 'right',
    paddingRight: ms(8),
  },
  barWrapper: {
    flex: 1,
    justifyContent: 'center',
    position: 'relative',
    minHeight: vs(32),
  },
  dottedLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 0.5,
    borderColor: '#E9ECEF',
    borderRadius: 1,
    top: vs(15),
  },
  bar: {
    height: vs(28),
    backgroundColor: '#739DFF',
    borderRadius: ms(6),
    justifyContent: 'center',
    paddingLeft: ms(8),
    zIndex: 2,
    minWidth: ms(4),
  },
  barValue: {
    position: 'absolute',
    left: ms(8),
    color: '#FFFFFF',
  },
  zeroValue: {
    marginLeft: ms(8),
    color: colors.textPrimary,
    zIndex: 2,
  },
  xAxisContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: vs(8),
    paddingLeft: ms(0),
  },
  xAxisLabelWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: ms(32),
  },
  xAxisLabel: {
    textAlign: 'center',
  },
});

export default PerformanceAnalytics;