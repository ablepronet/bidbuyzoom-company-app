import { StyleSheet, Text, View } from 'react-native';
import React, { useMemo } from 'react';
import WebViewScreen from '../webview';
import { vs } from '../../../utils/responsive';
import { useAppSelector } from '../../../redux/hooks';
import { useGetUserProfile } from '../../../services/queries/app/Profile';

import { routes } from '../../../navigation/route';
import { useNavigation } from '@react-navigation/native';

const Sales = ({ route }: { route: any }) => {
  const navigation = useNavigation<any>();
  const { from, saleId } = route.params || {};
  const { data, isLoading } = useGetUserProfile();
  const { token, userId } = useAppSelector(state => state.auth);
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

  const handleOnMessage = (event: any) => {
    if (!event?.nativeEvent?.data) return;

    try {
      const message = JSON.parse(event.nativeEvent.data);

      switch (message.type) {
        case 'OPEN_SALE_HUB':
          navigation.navigate(routes.saleHubScreen, {
            saleId: message.data.saleId,
            selectedSale: message.data,
          });
          console.log('navigation SaleHubScreen', message);
          break;

        default:
          break;
      }
    } catch (error) {
      console.log('WebView message parse error', error);
    }
  };

  const url = useMemo(() => {
    if (from === 'manage' && saleId) {
      return `https://staging.bidbuyzoom.com/${userData?.companySlug}/sales-information?id=${saleId}?mobile=true`;
    }
    return `https://staging.bidbuyzoom.com/${userData?.companySlug}/sales?mobile=true`;
  }, [saleId, userData?.companySlug, from]);
  return (
    <View style={styles.innerContainer}>
      <WebViewScreen
        url={url}
        injectedJavaScript={injectedJavaScript}
        enableWebBack={true}
        onMessage={event => handleOnMessage(event)}
      />
    </View>
  );
};

export default Sales;

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
  },
});
