import {PERMISSIONS, check, request} from 'react-native-permissions';
import {Alert, Linking, Platform} from 'react-native';
import {logs} from './metrics';

export const checkCameraPermission = async () => {
  try {
    const permissionsAvailable = await check(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA,
    );

    if (permissionsAvailable === 'granted') {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    logs('CameraPermission Error =>', error);
    return false;
  }
};

export const askCameraPermission = async (t: any) => {
  try {
    const cameraPermissionAvailable = await checkCameraPermission();
    if (cameraPermissionAvailable) {
      return true;
    }
    const result = await request(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA,
    );
    if (result !== 'granted') {
      Alert.alert('Camera Permission Denied', 'Please provide access', [
        {
          text: 'Cancel',
          onPress: () => logs('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: () => Linking.openSettings(),
        },
      ]);
    } else {
      return true;
    }
  } catch (error) {
    logs('askCameraPermission Error =>', error);
    return;
  }
};

export const checkGalleryPermissions = async () => {
  try {
    const permissionAvailable = await check(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : +Platform.Version >= 33
        ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    );
    if (permissionAvailable === 'granted') {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    logs(error);
    return false;
  }
};

export const askGalleryPermissions = async (t: any) => {
  try {
    const permissionAvailable = await checkGalleryPermissions();
    if (permissionAvailable) {
      return true;
    }
    const result = await request(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : +Platform.Version >= 33
        ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    );
    if (result !== 'granted') {
      return Alert.alert('Gallery Permission Denied', 'Please provide access', [
        {
          text: 'Cancel',
          onPress: () => logs('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: () => Linking.openSettings(),
        },
      ]);
    } else {
      // we have permission
      return true;
    }
  } catch (error) {
    logs(error);
    return false;
  }
};
