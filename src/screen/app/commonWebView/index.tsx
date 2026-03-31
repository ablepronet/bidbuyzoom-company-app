import {StyleSheet, View} from 'react-native';
import React from 'react';
import WebViewScreen from '../webview';
import {useAppSelector} from '../../../redux/hooks';
import {useGetUserProfile} from '../../../services/queries/app/Profile';
import AppHeader from '../../../components/appHeader';
import {useNavigation, useRoute} from '@react-navigation/native';

const CommonWebView = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const {url, title} = route.params;

  const {data} = useGetUserProfile();
  const {token} = useAppSelector(state => state.auth);
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
      <AppHeader
        leftIcon="chevron-back"
        onLeftPress={() => navigation.goBack()}
        title={title}
        showBorder={false}
      />
      <WebViewScreen
        key={url}
        url={url}
        injectedJavaScript={injectedJavaScript}
        enableWebBack={true}
      />
    </View>
  );
};

export default CommonWebView;

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
  },
});
