import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import WebViewScreen from '../webview';
import {useAppSelector} from '../../../redux/hooks';
import {useGetUserProfile} from '../../../services/queries/app/Profile';

const Consignors = () => {
  const {data, isLoading} = useGetUserProfile();
  const {token, userId} = useAppSelector(state => state.auth);
  const userData = data?.datas || null;
  const injectedJavaScript = `
    (function() {
      try {
        localStorage.setItem("token", JSON.stringify("${token}"));
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
    <View style={styles.innerContainer}>
      <WebViewScreen
        url={`https://staging.bidbuyzoom.com/${userData?.companySlug || ''}/client?mobile=true`}
        injectedJavaScript={injectedJavaScript}
        enableWebBack={true}
      />
    </View>
  );
};

export default Consignors;

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
  },
});
