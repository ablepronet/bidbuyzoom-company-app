import React, { memo, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  GestureResponderEvent,
  ViewStyle,
  Insets,
  StyleProp,
} from 'react-native';
import FastImage, { FastImageProps, Source } from 'react-native-fast-image';
import LottieView from 'lottie-react-native';
import { IMAGE_BASE_URL } from '../constants/apiConstant';
import { vs } from '../utils/responsive';

export interface ImageComponentProps extends Partial<FastImageProps> {
  onPress?: ((event: GestureResponderEvent) => void) | undefined;
  wrapperStyle?: StyleProp<ViewStyle> | undefined;
  hitSlop?: null | Insets | number | undefined;
  activeOpacity?: number | undefined;
  uri?: string | undefined; // relative path
  showLoader?: boolean;
}

export const ImageComponent = memo((props: ImageComponentProps) => {
  const {
    source,
    style,
    wrapperStyle,
    hitSlop,
    resizeMode = FastImage.resizeMode.contain,
    activeOpacity = 0.5,
    onPress,
    uri,
    showLoader = false,
    ...restProps
  } = props;

  const [loading, setLoading] = useState(false);

  const memoizedSource = useMemo<Source | number | undefined>(() => {
    if (source) return source as Source | number;

    if (uri) {
      const isAbsolute = uri.startsWith('http');
      return {
        uri: isAbsolute ? uri : IMAGE_BASE_URL + uri,
        priority: FastImage.priority.high,
        cache: FastImage.cacheControl.immutable,
      };
    }

    return undefined;
  }, [source, uri]);

  const ImageWithLoader = (
    <View style={[styles.imageWrapper, style]}>
      {loading && showLoader && (
        <LottieView
          source={require('../assets/lottie/whiteLoader.json')}
          autoPlay
          loop
          style={styles.lottieStyle}
        />
      )}
      <FastImage
        source={memoizedSource}
        style={StyleSheet.absoluteFill}
        resizeMode={resizeMode}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => setLoading(false)}
        {...restProps}
      />
    </View>
  );

  // if (onPress) {
  //   return (
  //     <AppPressable
  //       activeOpacity={activeOpacity}
  //       hitSlop={hitSlop}
  //       style={wrapperStyle}
  //       onPress={onPress}>
  //       {ImageWithLoader}
  //     </AppPressable>
  //   );
  // }

  return <View style={wrapperStyle}>{ImageWithLoader}</View>;
});

const styles = StyleSheet.create({
  imageWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  lottieStyle: {
    width: vs(100),
    height: vs(100),
    zIndex: 10000,
  },
});
