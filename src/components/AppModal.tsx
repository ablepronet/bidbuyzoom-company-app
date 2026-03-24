import React, {memo} from 'react';
import {StyleSheet, View, StyleProp, ViewStyle, Platform} from 'react-native';
import {vs} from '../utils/responsive';
import ReactNativeModal from 'react-native-modal';

export type ModalPosition = 'center' | 'bottom' | 'top';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;

  position?: ModalPosition;
  containerStyle?: StyleProp<ViewStyle>;

  backdropOpacity?: number;

  disableBackdropClose?: boolean;
};

const AppModal = memo(
  ({
    visible,
    onClose,
    children,
    position = 'center',
    containerStyle,
    backdropOpacity = 0.5,

    disableBackdropClose = false,
  }: Props) => {
    return (
      <View>
        <ReactNativeModal
          isVisible={visible}
          onBackdropPress={disableBackdropClose ? undefined : onClose}
          onBackButtonPress={disableBackdropClose ? undefined : onClose}
          backdropOpacity={backdropOpacity}
          style={styles[position]}
          useNativeDriver
          hideModalContentWhileAnimating
          avoidKeyboard
          propagateSwipe={position === 'bottom'}
          statusBarTranslucent={Platform.OS === 'android'}
          coverScreen={true}>
          <View style={[styles.container, containerStyle]}>{children}</View>
        </ReactNativeModal>
      </View>
    );
  },
);

export default AppModal;
const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    margin: 0,
  },

  bottom: {
    justifyContent: 'flex-end',
    margin: 0,
  },

  top: {
    justifyContent: 'flex-start',
    margin: 0,
    paddingTop: vs(40),
  },

  container: {
    borderRadius: vs(15),
    padding: vs(16),
    backgroundColor: '#fff',
    // borderTopLeftRadius: vs(15),
    // borderTopRightRadius: vs(15),
  },
});
