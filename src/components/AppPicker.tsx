import React, { useEffect } from 'react';
import {View, StyleSheet, ScrollView, Keyboard} from 'react-native';
import ReactNativeModal from 'react-native-modal';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AppPressable from './appPressable';
import {AppText } from './AppText';
import {colors} from '../constants';
import {scale, vs} from '../utils/responsive';

export interface PickerOption<T = string> {
  label: string;
  value: T;
}

interface AppPickerProps<T = string> {
  visible: boolean;
  title?: string;
  value?: T;
  options: PickerOption<T>[];
  onSelect: (value: T, option: PickerOption<T>) => void;
  onClose: () => void;
  loading?: boolean;
}

const AppPicker = <T,>({
  visible,
  title = 'Select option',
  value,
  options,
  onSelect,
  onClose,
  loading,
}: AppPickerProps<T>) => {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      Keyboard.dismiss();
    }
  }, [visible]);



  return (
    <ReactNativeModal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
      backdropOpacity={0.45}
      useNativeDriver>
      <View style={[styles.container, {paddingBottom: insets.bottom + vs(20)}]}>
        <AppText
          title={title}
          fontFamily="medium"
          fontySize="px18"
          marginBottom={vs(12)}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {loading ? (
            <AppText
              title="Loading..."
              textAlign="center"
              fontySize="px16"
              color="textSecondary"
              marginTop={vs(20)}
              isTr={false}
            />
          ) : options.length === 0 ? (
            <AppText
              title="No options available"
              textAlign="center"
              fontySize="px16"
              color="textSecondary"
              marginTop={vs(20)}
              isTr={false}
            />
          ) : (
            options.map(item => {
              const isSelected = value === item.value;

              return (
                <AppPressable
                  key={String(item.value)}
                  onPress={() => {
                    onSelect(item.value, item);
                    onClose();
                  }}
                  style={[styles.option, isSelected && styles.selectedOption]}>
                  <AppText
                    title={item.label}
                    fontySize="px16"
                    color={isSelected ? 'primary' : 'textPrimary'}
                    fontFamily="medium"
                    isTr={false}
                  />
                </AppPressable>
              );
            })
          )}
        </ScrollView>
      </View>
    </ReactNativeModal>
  );
};

export default React.memo(AppPicker);
const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    backgroundColor: colors.white,
    padding: scale(16),
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
    maxHeight: vs(600),
  },
  option: {
    paddingVertical: vs(14),
    borderBottomColor: colors.border,
  },
  selectedOption: {
    backgroundColor: colors.light100,
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
  },
});
