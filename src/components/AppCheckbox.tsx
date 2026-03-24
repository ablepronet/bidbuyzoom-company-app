import React, {memo} from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import AppPressable from './appPressable';
import {colors, appIcons} from '../constants';
import {scale, vs} from '../utils/responsive';
import {fontSizes} from '../utils/metrics';
import { ImageComponent } from './AppImage';
import { AppText } from './AppText';

interface AppCheckboxProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

const AppCheckbox: React.FC<AppCheckboxProps> = ({
  value,
  onChange,
  label,
  disabled = false,
  error,
  containerStyle,
}) => {
  const onPress = () => {
    if (!disabled) {
      onChange(!value);
    }
  };

  return (
    <View>
      <AppPressable
        style={[styles.container, containerStyle]}
        onPress={onPress}
        disabled={disabled}
        hitSlop={8}>
        <View
          style={[
            styles.checkbox,
            value && styles.checked,
            disabled && styles.disabled,
          ]}>
          {value && (
            <ImageComponent
              source={appIcons.white.check}
              style={styles.icon}
              resizeMode="contain"
            />
          )}
        </View>

        {label && (
          <AppText
            fontFamily="medium"
            fontySize="px14"
            style={styles.label}
            title={label}
          />
        )}
      </AppPressable>

      {!!error && <AppText style={styles.error}>{error}</AppText>}
    </View>
  );
};

export default memo(AppCheckbox);
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(4),
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  checked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    width: scale(12),
    height: scale(12),
    tintColor: colors.white,
  },
  label: {
    marginLeft: scale(10),
    color: colors.textPrimary,
  },
  error: {
    marginTop: vs(4),
    color: colors.error,
    fontSize: scale(12),
  },
});
