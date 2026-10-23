/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import 'react-native-gesture-handler';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { openFromNotification } from './src/services/notificationNavigation';

// Background handler for FCM
const messagingInstance = getMessaging();
setBackgroundMessageHandler(messagingInstance, async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

// Background handler for Notifee events
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    openFromNotification(detail.notification?.data);
  }
});

AppRegistry.registerComponent(appName, () => App);

