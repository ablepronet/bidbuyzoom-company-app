import React, {memo} from 'react';
import {
  Switch,
  View,
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {AppText} from './AppText';
import {colors} from '../constants';
import {vs, scale} from '../utils/responsive';

type Props = {
  title?: string;
  subtitle?: string;
  value: boolean;
  disabled?: boolean;
  onToggle: (val: boolean) => void;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  switchStyle?: any;
};

const ToggleRow = ({
  title,
  subtitle,
  value,
  disabled = false,
  onToggle,
  containerStyle,
  textStyle,
  switchStyle,
}: Props) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <AppText
        title={title}
        fontySize="px18"
        fontFamily="medium"
        color="textSecondary"
      />

      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onToggle}
        trackColor={{false: colors.softGray, true: colors.primary}}
        thumbColor={colors.white}
        style={[styles.switch, switchStyle]}
      />
    </View>
  );
};

export default memo(ToggleRow);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: vs(10),
  },
  textContainer: {
    flex: 1,
    marginRight: scale(10),
  },
switch: {
  transform: [
    {scaleX: Platform.OS === 'ios' ? 0.80 : 1.2},
    {scaleY: Platform.OS === 'ios' ? 0.80 : 1.2},
  ],
},
});
