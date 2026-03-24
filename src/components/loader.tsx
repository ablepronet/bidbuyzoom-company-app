import React from 'react';
import {View, StyleSheet} from 'react-native';
import {vs} from 'react-native-size-matters/extend';
import LottieView from 'lottie-react-native';
import {colors} from '../constants';

interface LoadingOverlayProps {
  isLoading?: boolean;
  transparent?: boolean;
  fullscreen?: boolean;
  size?: number;
}

const Loader = ({
  isLoading,
  transparent = false,
  fullscreen = true,
  size = vs(30),
}: LoadingOverlayProps) => {
  if (!isLoading) return null;

  if (!fullscreen) {
    return (
      <View style={styles.inlineContainer}>
        <LottieView
          source={require('../assets/lottie/loading.json')}
          autoPlay
          loop
          style={{width: size, height: size}}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.overlay,
        {
          backgroundColor: !transparent
            ? colors.background
            : 'rgba(0,0,0,0.25)',
        },
      ]}>
      <View style={styles.loaderContainer}>
        <LottieView
          source={require('../assets/lottie/loading.json')}
          autoPlay
          loop
          style={styles.lottieStyle}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: vs(-100),
    left: 0,
    right: 0,
    bottom: vs(-50),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3000,
  },
  loaderContainer: {
    width: vs(90),
    height: vs(90),
    // backgroundColor: colors.themeColor,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: vs(20),
    // elevation: 5,
    // shadowColor: colors.darkStatusSelectionView,
    // shadowOffset: {width: 0, height: 0},
    // shadowOpacity: 0.2,
    // shadowRadius: 5,
  },
  lottieStyle: {
    width: vs(80),
    height: vs(80),
  },
  inlineContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Loader;
