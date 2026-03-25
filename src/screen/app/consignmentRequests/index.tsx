import {StyleSheet, View} from 'react-native';
import React from 'react';
import WebViewScreen from '../webview';
import {useAppSelector} from '../../../redux/hooks';
import {useGetUserProfile} from '../../../services/queries/app/Profile';
import AppHeader from '../../../components/appHeader';
import {ImageComponent} from '../../../components/AppImage';
import {scale, vs} from '../../../utils/responsive';
import {DrawerActions, useNavigation} from '@react-navigation/native';
import appImages from '../../../constants/appImages';

const ConsignmentRequests = () => {
  const {data} = useGetUserProfile();
  const {token} = useAppSelector(state => state.auth);
  const userData = data?.datas || null;
  const navigation = useNavigation();
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

  const handleOpenDrawer = () => {
    navigation.goBack();
  };

  const renderHeaderCenter = () => (
    <ImageComponent
      source={appImages.splashLogo}
      style={styles.headerLogo}
      resizeMode="contain"
    />
  );

  return (
    <View style={styles.innerContainer}>
      <AppHeader
        leftIcon="chevron-back"
        onLeftPress={handleOpenDrawer}
        centerContent={renderHeaderCenter()}
        showBorder={false}
      />
      <WebViewScreen
        url={`https://staging.bidbuyzoom.com/${userData?.companySlug || ''}/consignment-requests?mobile=true`}
        injectedJavaScript={injectedJavaScript}
      />
    </View>
  );
};

export default ConsignmentRequests;

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
  },
  headerLogo: {
    width: scale(80),
    height: vs(30),
  },
});
