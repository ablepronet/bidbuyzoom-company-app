import React, {Component} from 'react';
import {View, Animated, Dimensions, StyleSheet, Platform} from 'react-native';
import ReactNativeModal from 'react-native-modal';
import {
  AppToastProps,
  AppToastState,
  defaultProps,
} from '../helper/toastMessage';
import {paddingHorizontal} from '../utils/metrics';
import {colors} from '../constants';
import {vs} from '../utils/responsive';
import { AppText } from './AppText';

const {height} = Dimensions.get('window');

class AppToast extends Component<AppToastProps, AppToastState> {
  //@ts-ignore
  private timer: NodeJS.Timeout;
  private slideAnim = new Animated.Value(-100); // NEW → Slide animation
  static defaultProps = defaultProps;
  static __singletonRef: AppToast | null;

  constructor(props: AppToastProps) {
    super(props);
    AppToast.__singletonRef = this;

    this.timer = setTimeout(() => {}, 0);

    this.state = {
      isShow: false,
      text: '',
      barWidth: new Animated.Value(32),
      icon: 'checkmark-circle',
      duration: 3000,
      position: 'top',
      oldDuration: 0,
      opacityValue: new Animated.Value(1),
      animationStyle: {},
    };
  }

  static success = (text: string, duration?: number) => {
    AppToast.__singletonRef?.show(text, 'success', 'top', duration);
  };

  static error = (text: string, duration?: number) => {
    AppToast.__singletonRef?.show(text, 'error', 'top', duration);
  };

  show = (
    text: string = '',
    icon: string,
    position?: string,
    duration: number = 3000,
  ) => {
    this.state.barWidth.setValue(32);
    this.slideAnim.setValue(-120);

    this.setState({
      isShow: true,
      text,
      icon,
      duration,
      position: position ?? this.state.position,
    });

    // Slide in
    Animated.timing(this.slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();

    this.close(duration);
  };

  close = (duration: number) => {
    clearTimeout(this.timer);

    this.timer = setTimeout(() => {
      this.hideToast();
    }, duration);
  };

  hideToast = () => {
    Animated.timing(this.slideAnim, {
      toValue: -120,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      this.setState({isShow: false});
    });
  };

  position = () => {
    return this.state.position === 'top'
      ? this.props.positionValue
      : height - this.props.positionValue - 10;
  };

  render() {
    const {isShow, icon, text} = this.state;

    return (
      <ReactNativeModal
        isVisible={isShow}
        coverScreen={false}
        useNativeDriverForBackdrop={true}
        hasBackdrop={false}
        animationIn="fadeIn"
        animationOut="fadeOut"
        style={styles.modalContainer}>
        <Animated.View
          style={[
            styles.mainContainer,
            {
              top: Platform.OS == 'ios' ? vs(30) : vs(30),
              transform: [{translateY: this.slideAnim}],
              backgroundColor:
                icon === 'success'
                  ? colors.successToastText
                  : colors.dangerToastText,
              borderColor:
                icon === 'success'
                  ? colors.successToastText
                  : colors.dangerToastText,
            },
          ]}>
          <View style={styles.content}>
            <AppText title={text} fontySize="px18" color="textLight" fontFamily="medium"/>
          </View>
        </Animated.View>
      </ReactNativeModal>
    );
  }
}

export default AppToast;

AppToast.defaultProps = defaultProps;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    zIndex: 200,
  },

  mainContainer: {
    position: 'absolute',
    alignSelf: 'center',
    width: Platform.OS === 'ios' ? '105%' : '105%',
    borderLeftWidth: 5,
    borderRadius: 5,

    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },

  content: {
    width: '100%',
    paddingHorizontal,
    paddingVertical: vs(15),
  },
});
