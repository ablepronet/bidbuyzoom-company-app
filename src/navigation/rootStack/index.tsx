import React, { useEffect, useMemo, useState } from 'react';
import { StatusBar, View } from 'react-native';
import SplashScreen from '../../screen/splash';

import { NavigationContainer } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ToastManager from '../../components/toaster';
// import AppStack from '../appStack';
import { navigationRef } from '../navigationService';
import AuthStack from '../authStack';
import { useAppSelector } from '../../redux/hooks';
import AppDrawer from '../drawer';

const RootStack = () => {
  const insets = useSafeAreaInsets();
  const { isLogin } = useAppSelector(state => state.auth);
  const [showSplash, setShowSplash] = useState(true);
  const toastPosition = useMemo(() => insets.top, [insets.top]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }
  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
        translucent={false}
      />
      {showSplash ? <SplashScreen /> : isLogin ? <AppDrawer /> : <AuthStack />}

      <ToastManager positionValue={toastPosition} />
    </NavigationContainer>
  );
};

export default RootStack;
