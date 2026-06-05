import React from 'react';
import { Text, StyleSheet, TextStyle, ViewStyle } from 'react-native';

import { fontSizes } from '../utils/metrics';
import appFonts from '../constants/appFonts';
import { colors } from '../constants';

interface Props {
  title?: string;
  params?: Record<string, any>;
  children?: React.ReactNode;

  color?: keyof typeof colors;
  fontySize?: keyof typeof fontSizes;
  fontFamily?: keyof typeof appFonts;
  numberOfLines?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  textAlign?: TextStyle['textAlign'];
  textTransform?: TextStyle['textTransform'];
  style?: TextStyle;
}

export const AppText: React.FC<Props> = ({
  title,
  params,
  children,
  color = 'textPrimary',
  fontySize = 'px14',
  fontFamily = 'regular',
  numberOfLines,
  textAlign,
  marginTop,
  marginBottom,
  marginLeft,
  textTransform = 'none',
  style,
}) => {

  const resolvedColor =
    typeof color === 'string' && color in colors
      ? colors[color as keyof typeof colors]
      : color;


  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        styles.base,
        {
          color: resolvedColor,
          fontSize: fontSizes[fontySize],
          fontFamily: appFonts[fontFamily],
          textAlign,
          marginTop,
          marginBottom,
          textTransform,
          marginLeft,
        },
        style,
      ]}>
      {title || children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
