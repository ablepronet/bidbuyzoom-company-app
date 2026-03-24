import { StyleSheet, View } from 'react-native';
import React, { useState, useRef } from 'react';
import WebView from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import Loader from '../../../components/loader';
import { colors } from '../../../constants';
import { vs } from '../../../utils/responsive';
import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import { setUserLogout } from '../../../redux/slices/auth';

// companytest@yopmail.com
// System@123
const WebViewScreen = ({ profileData }: { profileData: any }) => {
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef(null);
  const dispatch = useAppDispatch();

  const { token, userId } = useAppSelector(state => state.auth);

  const userData = profileData?.datas || null;
  console.log(userData);

  const headers = {
    'User-Agent':
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  };

  const injectedJavaScript = `
  (function() {
    try {
      localStorage.setItem("token", JSON.stringify("${token}"));
      localStorage.setItem("user", JSON.stringify(${JSON.stringify(userData)}));
      localStorage.setItem("companyName", "${
        userData?.companySlug || ''
      }");
      
      // Override logout function if possible, or listen for logout events
      // This depends on how your website handles logout
      const originalClear = localStorage.clear;
      localStorage.clear = function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'logout' }));
        originalClear.apply(this, arguments);
      };

      console.log('Auth data injected and logout listener set');
      return true;
    } catch (error) {
      console.log('Error:', error);
      return false;
    }
  })();
  true;
`;

  const handleLogoutAction = () => {
    console.log('Logging out user from app...');
    dispatch(setUserLogout());
  };

  const onNavigationStateChange = (navState: any) => {
    const currentUrl = navState.url;
    console.log('Navigation URL:', currentUrl);

    // Check if user navigated to the main landing page or login page (logged out)
    const isLandingPage =
      currentUrl === 'https://staging.bidbuyzoom.com' ||
      currentUrl === 'https://staging.bidbuyzoom.com/' ||
      currentUrl.includes('/login');

    if (isLandingPage && !isLoading) {
      handleLogoutAction();
    }
  };

  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'logout') {
        handleLogoutAction();
      }
    } catch (e) {
      console.log('Error parsing WebView message:', e);
    }
  };

  const onLoadEnd = () => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const onHttpError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.log('HTTP Error:', nativeEvent.statusCode);
  };

  const onError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.log('WebView Error:', nativeEvent);
    setIsLoading(false);
  };

  if (!token) {
    return <Loader isLoading={true} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <WebView
          ref={webViewRef}
          source={{
            uri: 'https://staging.bidbuyzoom.com',
            headers: headers,
          }}
          style={styles.webview}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={onLoadEnd}
          onNavigationStateChange={onNavigationStateChange}
          onMessage={onMessage}
          onHttpError={onHttpError}
          onError={onError}
          injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          sharedCookiesEnabled={true}
          thirdPartyCookiesEnabled={true}
          startInLoadingState={true}
          renderLoading={() => <Loader isLoading={true} />}
        />
      </View>
      <Loader isLoading={isLoading} />
    </SafeAreaView>
  );
};

export default WebViewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: vs(10),
  },
  webview: {
    flex: 1,
  },
});
