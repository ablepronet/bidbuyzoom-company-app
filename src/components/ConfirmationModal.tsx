import React from 'react';
import {View, StyleSheet} from 'react-native';
import AppModal, { ModalPosition } from './AppModal';
import { AppText } from './AppText';
import { ms, vs } from '../utils/responsive';
import AppButton from './appButton';

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  cancelText?: string;
  confirmText?: string;
  position?: ModalPosition;
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title = 'Confirmation',
  message = 'Are you sure?',
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  position = 'center',
  isLoading = false,
}) => {
  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      position={position}
      containerStyle={styles.modalContainer}>
      <AppText
        title={title}
        fontySize="px18"
        fontFamily="bold"
        color="primary"
        textAlign="center"
      />
      <AppText
        title={message}
        fontySize="px14"
        color="textSecondary"
        textAlign="center"
        fontFamily="medium"
        marginTop={vs(10)}
        marginBottom={vs(20)}
      />
      <View style={styles.modalActions}>
        <AppButton
          title={cancelText}
          transparent
          borderColor="primary"
          textColor="primary"
          onPress={onClose}
          style={styles.modalBtn}
          disabled={isLoading}
        />
        <AppButton
          title={confirmText}
          bgColor="primary"
          textColor="white"
          onPress={onConfirm}
          style={styles.modalBtn}
          loading={isLoading}
        />
      </View>
    </AppModal>
  );
};

export default ConfirmationModal;

const styles = StyleSheet.create({
  modalContainer: {
    marginHorizontal: ms(15),
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vs(20),
    gap: ms(10),
  },
  modalBtn: {
    flex: 1,
  },
});
