import {Alert, Linking} from 'react-native';

type CallOptions = {
  phone?: string | number;
  countryCode?: string | number;
  name?: string;
};

export const CallPhoneNumber = async ({
  phone,
  countryCode,
  name = 'Driver',
}: CallOptions) => {
  if (!phone) {
    Alert.alert('Error', 'Phone number not available');
    return;
  }

  const number = `+${countryCode ?? ''}${phone}`;
  const url = `tel:${number}`;

  try {
    const supported = await Linking.canOpenURL(url);

    if (!supported) {
      Alert.alert('Error', 'Phone dialer not available on this device');
      return;
    }

    Alert.alert(
      `Call ${name}`,
      `Do you want to call ${number}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Call',
          onPress: () => Linking.openURL(url),
        },
      ],
      {cancelable: true},
    );
  } catch (error) {
    Alert.alert('Error', 'Unable to make a call');
  }
};