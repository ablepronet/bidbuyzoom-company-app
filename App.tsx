import React, {useEffect} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {Provider} from 'react-redux';
import {persister, store} from './src/redux/store';
import {PersistGate} from 'redux-persist/integration/react';

import {SafeAreaProvider} from 'react-native-safe-area-context';
// import { KeyboardProvider } from 'react-native-keyboard-controller';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import RootStack from './src/navigation/rootStack/index';
import AppToast from './src/components/toaster';
import {
  requestNotificationPermission,
  setupNotificationListeners,
  getFCMToken,
  setupTokenRefreshListener,
  registerDeviceToken,
} from './src/services/notificationService';
import {openFromNotification} from './src/services/notificationNavigation';
import notifee from '@notifee/react-native';
import {
  getMessaging,
  getInitialNotification,
  onNotificationOpenedApp,
} from '@react-native-firebase/messaging';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
const App = () => {
  useEffect(() => {
    const initNotifications = async () => {
      await requestNotificationPermission();
      const token = await getFCMToken();
      if (token) {
        console.log('🔥 [FCM Registration Token]:', token);
      }
    };
    initNotifications();

    // Tapping a notification opens the screen it is about.
    const unsubscribeListeners = setupNotificationListeners(openFromNotification);
    const messagingInstance = getMessaging();
    const unsubscribeOpened = onNotificationOpenedApp(messagingInstance, remoteMessage =>
      openFromNotification(remoteMessage?.data),
    );
    getInitialNotification(messagingInstance)
      .then(remoteMessage => remoteMessage && openFromNotification(remoteMessage.data))
      .catch(() => {});
    notifee
      .getInitialNotification()
      .then(initial => initial && openFromNotification(initial.notification?.data))
      .catch(() => {});
    const unsubscribeTokenRefresh = setupTokenRefreshListener((newToken: string) => {
      console.log('🔄 [FCM Token Refreshed]:', newToken);
      registerDeviceToken(newToken);
    });

    return () => {
      unsubscribeListeners();
      unsubscribeOpened();
      unsubscribeTokenRefresh();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Provider store={store}>
        <PersistGate persistor={persister} loading={null}>
          <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
              {/* <KeyboardProvider> */}
              <BottomSheetModalProvider>
                <RootStack />
                <AppToast />
              </BottomSheetModalProvider>
              {/* </KeyboardProvider> */}
            </SafeAreaProvider>
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;
