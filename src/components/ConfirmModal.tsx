import {memo} from 'react';
import AppModal from './AppModal';
import {StyleSheet, View} from 'react-native';
import {scale, vs} from '../utils/responsive';
import AppButton from './appButton';
import {colors} from '../constants';
import { AppText } from './AppText';
import { ImageComponent } from './AppImage';

type Props = {
  visible: boolean;
  title: string;
  description?: string;
  icon: any;

  onCancel: () => void;
  onConfirm: () => void;

  confirmText?: string;
  cancelText?: string;
};

const ConfirmModal = memo(
  ({
    visible,
    title,
    description,
    icon,
    onCancel,
    onConfirm,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
  }: Props) => {
    return (
      <AppModal
        visible={visible}
        onClose={onCancel}
        position="bottom"
        disableBackdropClose>
        <View style={deleteStyles.container}>
          <View style={deleteStyles.iconWrapper}>
            <ImageComponent source={icon} style={deleteStyles.image} />
          </View>

          <AppText
            title={title}
            fontySize="px28"
            fontFamily="medium"
            textAlign="center"
            marginTop={vs(10)}
            marginBottom={vs(10)}
          />
          {!!description && (
            <AppText
              title={description}
              fontySize="px18"
              fontFamily="medium"
              textAlign="center"
              marginBottom={vs(10)}
              color="textSecondary"
            />
          )}

          <View style={deleteStyles.buttonRow}>
            <View style={{flex: 1}}>
              <AppButton title={cancelText} bgColor="dark" onPress={onCancel} />
            </View>

            <View style={{flex: 1}}>
              <AppButton title={confirmText} onPress={onConfirm} />
            </View>
          </View>
        </View>
      </AppModal>
    );
  },
);

export default ConfirmModal;

const deleteStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: vs(10),
  },
  iconWrapper: {
    backgroundColor: colors.light100,
    padding: vs(10),
    borderRadius: vs(50),
  },
  image: {
    width: scale(60),
    height: scale(60),
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: vs(20),
    gap: scale(15),
    paddingBottom: vs(30),
  },
});
