import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../../../constants';
import {useGetUserProfile} from '../../../services/queries/app/Profile';
import AppHeader from '../../../components/appHeader';
import WebViewScreen from '../webview';

const WebViewDashboard = () => {
  const insets = useSafeAreaInsets();
  const {data, isLoading: isUserProfileLoading} = useGetUserProfile();

  const userData = data?.datas || null;
  const webBaseUrl = 'https://staging.bidbuyzoom.com';
  const url = `${webBaseUrl}/${
    userData?.companySlug || ''
  }/dashboard?mobile=true`;

  const injectedJavaScript = `
    (function() {
      try {
        localStorage.setItem("token", JSON.stringify("${
          userData?.token || ''
        }"));
        localStorage.setItem("user", JSON.stringify(${JSON.stringify(
          userData,
        )}));
        localStorage.setItem("companyName", "${userData?.companySlug || ''}");
        const originalClear = localStorage.clear;
        localStorage.clear = function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'logout' }));
          originalClear.apply(this, arguments);
        };
        console.log('Auth data injected');
        return true;
      } catch (error) {
        console.log('Error:', error);
        return false;
      }
    })();
    true;
  `;

  return (
    <View style={styles.container}>
      <AppHeader
        // leftIcon="chevron-back"
        onLeftPress={() => {}}
        title="Plans"
        showBorder={false}
      />
      <WebViewScreen
        key={url}
        url={url}
        injectedJavaScript={injectedJavaScript}
        enableWebBack={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
});

export default WebViewDashboard;
