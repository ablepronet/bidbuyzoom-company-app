// components/Card/index.tsx
import React, {ReactNode} from 'react';
import {View, StyleSheet, ViewStyle, StyleProp} from 'react-native';
import {scale, vs} from '../utils/responsive';
import globalStyles from '../styles/globalStyles';
import {colors} from '../constants';

interface CardProps {
  children?: ReactNode;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

const Card: React.FC<CardProps> = ({children, height, style}) => {
  return (
    <View style={[styles.wrapper, {}]}>
      <View style={[styles.card, height ? {height} : null, style]}>
        {children}
      </View>
    </View>
  );
};

export default React.memo(Card);

const styles = StyleSheet.create({
  wrapper: {
    // paddingHorizontal: scale(15),
  },
  card: {
    borderRadius: vs(10),
    padding: scale(15),
    paddingHorizontal: scale(15),
    ...globalStyles.appShadow,
  },
});
