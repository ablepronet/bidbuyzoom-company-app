import React from 'react';
import {View, StyleProp, ViewStyle, StyleSheet, Platform} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {scale, vs} from '../utils/responsive';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  height?: number;
}

const HeaderContainer: React.FC<Props> = ({
  children,
  style,
  backgroundColor = '#fff',
  height,
}) => {
  const insets = useSafeAreaInsets();

  const containerHeight = height ?? (Platform.OS === 'ios' ? vs(115) : vs(70));

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          height: containerHeight,
          paddingTop: Platform.OS === 'ios' ? insets.top : vs(15),
        },
        style,
      ]}>
      {children}
    </View>
  );
};

export default HeaderContainer;
const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    padding: scale(15),
    paddingHorizontal: scale(15),
    marginBottom: vs(15),
  },
});
