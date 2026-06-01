import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { AppText } from './AppText';
import { colors } from '../constants';
import { ms, vs } from '../utils/responsive';
import Icon from 'react-native-vector-icons/Ionicons';

interface Step {
  key: string;
  title: string;
  isCompleted: boolean;
}

interface AccountSetupProps {
  steps: Step[];
  completedCount: number;
  totalCount: number;
  progress: number;
}

const AccountSetup = ({ steps, completedCount, totalCount, progress }: AccountSetupProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <View style={styles.container}>
      <View style={[styles.header, isCollapsed && { justifyContent: 'flex-start' }]}>
        <View style={styles.titleRow}>
          <Icon name="lock-closed-outline" size={ms(16)} color={colors.primary} />
          <AppText title="Account Setup" fontySize="px14" fontFamily="bold" marginLeft={ms(8)} />
        </View>
        <View style={[
          styles.badge,
          { backgroundColor: progress === 100 ? colors.success : colors.primary },
          isCollapsed && { marginLeft: ms(10), paddingHorizontal: ms(8) }
        ]}>
          {!isCollapsed && <AppText title={`${completedCount}/${totalCount} Complete`} color="white" fontySize="px10" />}
          <TouchableOpacity
            style={[styles.hideButton, isCollapsed && { marginLeft: 0 }]}
            onPress={() => setIsCollapsed(!isCollapsed)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name={isCollapsed ? "eye-outline" : "eye-off-outline"} size={ms(14)} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {!isCollapsed && (
        <>
          <View style={styles.progressContainer}>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: progress === 100 ? colors.success : colors.primary }]} />
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.stepsWrapper}>
              {steps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={[styles.stepCircle, { backgroundColor: step.isCompleted ? colors.success : '#D1D5DB' }]}>
                    {step.isCompleted ? (
                      <Icon name="checkmark-outline" size={ms(12)} color={colors.white} />
                    ) : (
                      <View style={styles.innerDot} />
                    )}
                  </View>
                  <AppText title={step.title} fontySize="px10" color={step.isCompleted ? 'textPrimary' : 'textSecondary'} textAlign="center" />
                </View>
              ))}
            </View>
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: vs(5),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(15),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ms(10),
    paddingVertical: vs(4),
    borderRadius: 20,
  },
  hideButton: {
    marginLeft: ms(8),
  },
  progressContainer: {
    marginBottom: vs(20),
  },
  progressBg: {
    height: vs(4),
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  stepsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: vs(5),
  },
  stepItem: {
    alignItems: 'center',
    width: ms(80),
    marginRight: ms(10),
  },
  stepCircle: {
    width: ms(22),
    height: ms(22),
    borderRadius: ms(11),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(6),
  },
  innerDot: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: colors.white,
  },
});

export default AccountSetup;
