import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen } from '../../../components/Screen';
import { colors } from '../../../constants';
import { vs } from '../../../utils/responsive';

const CreateScreen = () => {
  return (
    <Screen style={styles.container} backgroundColor={colors.background}>
      <View style={styles.content}>
        <Text style={styles.title}>Create</Text>
        <Text style={styles.subTitle}>Use this screen to build your create flow.</Text>
      </View>
    </Screen>
  );
};

export default CreateScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: vs(16),
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subTitle: {
    marginTop: vs(8),
    fontSize: 16,
    color: colors.textSecondary,
  },
});