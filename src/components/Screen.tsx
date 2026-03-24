import React from 'react';
import {View, StyleProp, ViewStyle} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import globalStyles from '../styles/globalStyles';
import {colors} from '../constants';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  isSafeView?: boolean;
  backgroundColor?: string;
}

export const Screen: React.FC<Props> = ({
  children,
  style,
  edges = ['top'],
  isSafeView = true,
  backgroundColor = colors.lightBackground,
}) => {
  const containerStyle: StyleProp<ViewStyle> = [
    globalStyles.innerWrapper,
    backgroundColor ? {backgroundColor} : null,
    style,
  ];

  if (!isSafeView) {
    return (
      <View
        style={[backgroundColor ? {backgroundColor, flex: 1} : null, style]}>
        {children}
      </View>
    );
  }

  return (
    <SafeAreaView style={containerStyle} edges={edges}>
      {children}
    </SafeAreaView>
  );
};
