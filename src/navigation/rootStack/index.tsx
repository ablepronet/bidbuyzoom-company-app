import React, {useEffect, useMemo, useState} from 'react';
import {StatusBar} from 'react-native';
import SplashScreen from '../../screen/splash';

import {NavigationContainer} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ToastManager from '../../components/toaster';
// import AppStack from '../appStack';
import {navigationRef} from '../navigationService';
import AuthStack from '../authStack';
import {useAppSelector} from '../../redux/hooks';
import AppDrawer from '../drawer';
import WebViewDashboard from '../../screen/app/webviewDashboard';
import {useGetUserProfile} from '../../services/queries/app/Profile';
import {registerDeviceToken} from '../../services/notificationService';
import {flushPendingNotification} from '../../services/notificationNavigation';

const RootStack = () => {
  const insets = useSafeAreaInsets();
  const {isLogin, token} = useAppSelector(state => state.auth);
  const [showSplash, setShowSplash] = useState(true);
  const toastPosition = useMemo(() => insets.top, [insets.top]);
  const {data} = useGetUserProfile();
  const userData = data?.datas || null;

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLogin && token) {
      registerDeviceToken();
    }
  }, [isLogin, token]);

  if (showSplash) {
    return <SplashScreen />;
  }

  // Show WebView dashboard if planSelected is false
  if (isLogin && userData && !userData?.planSelected) {
    return (
      <NavigationContainer ref={navigationRef} onReady={flushPendingNotification}>
        <StatusBar
          backgroundColor="#FFFFFF"
          barStyle="dark-content"
          translucent={false}
        />
        <WebViewDashboard />
        <ToastManager positionValue={toastPosition} />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} onReady={flushPendingNotification}>
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
        translucent={false}
      />
      {isLogin ? <AppDrawer /> : <AuthStack />}

      <ToastManager positionValue={toastPosition} />
    </NavigationContainer>
  );
};

export default RootStack;
