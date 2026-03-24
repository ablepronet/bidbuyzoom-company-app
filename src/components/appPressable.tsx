import {
  Animated,
  GestureResponderEvent,
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import React, {useRef} from 'react';

export interface appPressableProps extends TouchableOpacityProps {
  animatedScale?: number;
  style?: StyleProp<ViewStyle> | undefined;
  animateOnPress?: boolean;
}

const AppPressable: React.FC<appPressableProps> = props => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = (event: GestureResponderEvent) => {
    if (props?.onLongPress || props.animateOnPress) {
      Animated.spring(scale, {
        toValue: props.animatedScale ?? 0.9,
        useNativeDriver: true,
      }).start();
      props.onLongPress && props?.onLongPress(event);
      return;
    }
  };

  const handlePressOut = (event: any) => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const STYLE = [
    {
      transform: [{scale}],
    },
    props.style,
  ];

  return (
    <TouchableOpacity
      activeOpacity={props.activeOpacity || 0.6}
      onPressOut={props.onPressOut || handlePressOut}
      onPressIn={handlePressIn}
      {...props}
      onLongPress={handlePressIn}
      style={STYLE}>
      {props.children}
    </TouchableOpacity>
  );
};

export default AppPressable;
