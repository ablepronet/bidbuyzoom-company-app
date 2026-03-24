import React from 'react';
import {View, StyleProp, ViewStyle} from 'react-native';
import {scale} from '../utils/responsive';
import {ImageComponent} from './AppImage';
import AppPressable from './appPressable';

interface Props {
  source: any;
  onPress?: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
  iconStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  hitSlop?: number;
  iconWidth?: number;
  iconHeight?: number;
}

const AppIconButton: React.FC<Props> = ({
  source,
  onPress,
  size = scale(24),
  style,
  iconWidth = size * 0.6,
  iconHeight = size * 0.6,
  backgroundColor = 'transparent',
  hitSlop = 8,
}) => {
  const isDisabled = !onPress;

  return (
    <AppPressable
      onPress={onPress}
      disabled={isDisabled}
      hitSlop={isDisabled ? undefined : hitSlop}>
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: scale(100),
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor,
            opacity: 1,
          },
          style,
        ]}>
        <ImageComponent
          source={source}
          style={[
            {
              width: iconWidth,
              height: iconHeight,
            },
          ]}
        />
      </View>
    </AppPressable>
  );
};

export default AppIconButton;
