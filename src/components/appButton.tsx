import React from 'react';
import {TouchableOpacity, StyleSheet, ViewStyle, View} from 'react-native';
import LottieView from 'lottie-react-native';
import {colors} from '../constants';
import {Source} from 'react-native-fast-image';
import { ImageComponent } from './AppImage';
import { AppText } from './AppText';
import { ms, vs } from '../utils/responsive';

interface Props {
  title?: string;
  textColor?: keyof typeof colors;
  borderColor?: keyof typeof colors;
  bgColor?: keyof typeof colors;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: any;
  transparent?: boolean;
  imageSource?: Source | number;
}

const AppButton: React.FC<Props> = ({
  title = 'Title',
  textColor = 'textLight',
  borderColor = 'border',
  bgColor = 'primary',
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  transparent = false,
  imageSource,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={loading || disabled}
      onPress={onPress}
      style={[
        styles.button,
        transparent
          ? {
              backgroundColor: 'transparent',
              borderWidth: 2,
              borderColor: colors[borderColor],
            }
          : {
              backgroundColor: colors[bgColor],
            },
        disabled && {opacity: 0.6},
        style,
      ]}>
      {loading ? (
        <LottieView
          source={require('../assets/lottie/whiteLoader.json')}
          autoPlay
          loop
          style={styles.loader}
        />
      ) : (
        <View style={styles.row}>
          {imageSource && (
            <ImageComponent
              source={imageSource}
              style={styles.icon}
              resizeMode="cover"
            />
          )}

          <AppText
            title={title}
            fontFamily="medium"
            fontySize="px16"
            textAlign="center"
            color={textColor}
            style={textStyle}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default AppButton;

const styles = StyleSheet.create({
  button: {
    height: vs(45),
    borderRadius: ms(5),
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  loader: {
    width: ms(50),
    height: ms(50),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vs(5),
  },

  icon: {
    width: vs(25),
    height: vs(25),
  },
});
