import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import {
  getMessaging,
  getToken,
  onMessage,
  onTokenRefresh,
  requestPermission,
  registerDeviceForRemoteMessages,
  isDeviceRegisteredForRemoteMessages,
  AuthorizationStatus,
  RemoteMessage,
} from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { post, deleteApi } from './api';
import { apiEndPoints } from '../constants';
import { store } from '../redux/store';

const DEFAULT_CHANNEL_ID = 'default_eauction_channel';
const DEFAULT_CHANNEL_NAME = 'EAuction Notifications';

/**
 * Request notification permission for both Android 13+ and iOS
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } else {
      const messagingInstance = getMessaging();
      const authStatus = await requestPermission(messagingInstance);
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;
      await notifee.requestPermission();
      return enabled;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

let isChannelCreated = false;

async function ensureNotificationChannel(): Promise<string> {
  if (Platform.OS === 'android' && !isChannelCreated) {
    await notifee.createChannel({
      id: DEFAULT_CHANNEL_ID,
      name: DEFAULT_CHANNEL_NAME,
      importance: AndroidImportance.HIGH,
      vibration: true,
      sound: 'default',
    });
    isChannelCreated = true;
  }
  return DEFAULT_CHANNEL_ID;
}

/**
 * Display a local notification using Notifee
 */
export async function displayNotification(
  title?: string,
  body?: string,
  data?: Record<string, any>
) {
  try {
    const channelId = await ensureNotificationChannel();

    await notifee.displayNotification({
      title: title || 'New Notification',
      body: body || '',
      data,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
        sound: 'default',
      },
      ios: {
        sound: 'default',
      },
    });
  } catch (error) {
    console.error('Error displaying notification with Notifee:', error);
  }
}

/**
 * Initialize Firebase messaging foreground listener and setup Notifee handlers
 */
export function setupNotificationListeners(
  onNotificationPress?: (data?: Record<string, any>) => void
) {
  const messagingInstance = getMessaging();

  // Listen for FCM messages while app is in foreground
  const unsubscribeForeground = onMessage(
    messagingInstance,
    async (remoteMessage: RemoteMessage) => {
      const title =
        remoteMessage.notification?.title ||
        (remoteMessage.data?.title as string | undefined);
      const body =
        remoteMessage.notification?.body ||
        (remoteMessage.data?.body as string | undefined);
      await displayNotification(title, body, remoteMessage.data);
    }
  );

  // Handle Foreground notification press event
  const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) {
      if (onNotificationPress) {
        onNotificationPress(detail.notification?.data);
      }
    }
  });

  return () => {
    unsubscribeForeground();
    unsubscribeNotifee();
  };
}

const FCM_TOKEN_STORAGE_KEY = '@fcm_token';
let cachedFcmToken: string | null = null;

/**
 * Get device FCM Token (Optimized: In-memory -> AsyncStorage -> Network Fetch)
 * @param forceRefresh Optional boolean to force fetching a new token from Firebase
 */
export async function getFCMToken(
  forceRefresh = false
): Promise<string | null> {
  try {
    // 1. In-memory check (Fastest, 0ms)
    if (!forceRefresh && cachedFcmToken) {
      return cachedFcmToken;
    }

    // 2. Local Storage check (No unnecessary network call)
    if (!forceRefresh) {
      const storedToken = await AsyncStorage.getItem(FCM_TOKEN_STORAGE_KEY);
      if (storedToken) {
        cachedFcmToken = storedToken;
        return storedToken;
      }
    }

    // 3. Network call only if token not found or forced
    const messagingInstance = getMessaging();

    // iOS requires explicit remote message registration with APNs before fetching FCM token
    if (Platform.OS === 'ios') {
      try {
        const isRegistered =
          isDeviceRegisteredForRemoteMessages(messagingInstance);
        if (!isRegistered) {
          await registerDeviceForRemoteMessages(messagingInstance);
        }
      } catch {
        // iOS Simulators cannot obtain real APNs tokens and will always time out
        if (__DEV__) {
          console.warn(
            '⚠️ [iOS Push Notification Note]: APNs registration skipped/timed out. Push notifications require a physical iOS device.'
          );
        }
        return null;
      }
    }

    const token = await getToken(messagingInstance);

    if (token) {
      cachedFcmToken = token;
      await AsyncStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
    }

    return token;
  } catch (error) {
    console.error('Error fetching FCM token:', error);
    return null;
  }
}

/**
 * Listen for token refreshes and update cache/storage automatically
 */
export function setupTokenRefreshListener(
  onTokenRefreshCallback?: (newToken: string) => void
) {
  const messagingInstance = getMessaging();
  return onTokenRefresh(messagingInstance, async (newToken: string) => {
    cachedFcmToken = newToken;
    await AsyncStorage.setItem(FCM_TOKEN_STORAGE_KEY, newToken);
    if (onTokenRefreshCallback) {
      onTokenRefreshCallback(newToken);
    }
  });
}

/**
 * Register or refresh FCM device token with backend
 * POST /api/device-token
 * Body: { "token": "<fcm token>", "platform": "ios" | "android" }
 */
export async function registerDeviceToken(fcmToken?: string | null) {
  try {
    const authToken = store.getState().auth.token;
    if (!authToken) {
      console.log('Skipping device-token register: User is not logged in');
      return;
    }

    const token = fcmToken || (await getFCMToken());
    if (!token) {
      console.log('Skipping device-token register: No FCM token available');
      return;
    }

    const body = {
      token,
      platform: Platform.OS,
    };

    console.log('📱 [POST /api/device-token Body]:', body);
    const res = await post(apiEndPoints.deviceToken, body);
    console.log('✅ [POST /api/device-token Response]:', res);
    return res;
  } catch (error) {
    console.log('❌ Error registering device token to backend:', error);
  }
}

/**
 * Remove FCM device token from backend on logout
 * DELETE /api/device-token
 * Body: { "token": "<fcm token>" }
 */
export async function unregisterDeviceToken(fcmToken?: string | null) {
  try {
    const authToken = store.getState().auth.token;
    if (!authToken) {
      return;
    }

    const token =
      fcmToken ||
      cachedFcmToken ||
      (await AsyncStorage.getItem(FCM_TOKEN_STORAGE_KEY));
    if (!token) {
      return;
    }

    const body = {
      token,
    };

    console.log('📱 [DELETE /api/device-token Body]:', body);
    const res = await deleteApi(apiEndPoints.deviceToken, body);
    console.log('✅ [DELETE /api/device-token Response]:', res);
    return res;
  } catch (error) {
    console.log('❌ Error removing device token from backend on logout:', error);
  }
}
