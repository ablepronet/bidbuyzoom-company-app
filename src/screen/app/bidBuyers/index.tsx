import {StyleSheet, View} from 'react-native';
import React from 'react';
import WebViewScreen from '../webview';
import {useAppSelector} from '../../../redux/hooks';
import {useGetUserProfile} from '../../../services/queries/app/Profile';
import {buildTableExportJavaScript} from '../../../utils/webViewTableExport';

const BidBuyers = () => {
  const {data} = useGetUserProfile();
  const {token} = useAppSelector(state => state.auth);
  const userData = data?.datas || null;
  const tableExportJavaScript = buildTableExportJavaScript('bidders_data.csv');
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
    ${tableExportJavaScript}
    true;
  `;
  return (
    <View style={styles.innerContainer}>
      <WebViewScreen
        url={`https://staging.bidbuyzoom.com/${
          userData?.companySlug || ''
        }/bidders?mobile=true`}
        injectedJavaScript={injectedJavaScript}
        enableWebBack={true}
      />
    </View>
  );
};

export default BidBuyers;

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
  },
});
