// import React from 'react';
// import {View, StyleSheet} from 'react-native';
// import {useSafeAreaInsets} from 'react-native-safe-area-context';
// import {colors} from '../../../constants';
// import {useGetUserProfile} from '../../../services/queries/app/Profile';
// import {useAppSelector} from '../../../redux/hooks';
// import AppHeader from '../../../components/appHeader';
// import WebViewScreen from '../webview';

// const WebViewDashboard = () => {
//   const insets = useSafeAreaInsets();
//   const {data, isLoading: isUserProfileLoading} = useGetUserProfile();
//   const {token} = useAppSelector(state => state.auth);
//   const userData = data?.datas || null;
//   const webBaseUrl = 'https://staging.bidbuyzoom.com';
//   const url = `${webBaseUrl}/${
//     userData?.companySlug || ''
//   }/dashboard?mobile=true`;

//   // const injectedJavaScript = `
//   //   (function() {
//   //     try {
//   //       localStorage.setItem("token", JSON.stringify("${token}"));
//   //       localStorage.setItem("user", JSON.stringify(${JSON.stringify(
//   //         userData,
//   //       )}));
//   //       localStorage.setItem("companyName", "${userData?.companySlug || ''}");
//   //       const originalClear = localStorage.clear;
//   //       localStorage.clear = function() {
//   //         window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'logout' }));
//   //         originalClear.apply(this, arguments);
//   //       };
//   //       console.log('Auth data injected');
//   //       return true;
//   //     } catch (error) {
//   //       console.log('Error:', error);
//   //       return false;
//   //     }
//   //   })();
//   //   true;
//   // `;

//   const injectedJavaScript = `
//   (function() {
//     try {
//       localStorage.setItem("token", JSON.stringify("${token}"));
//       localStorage.setItem("user", JSON.stringify(${JSON.stringify(userData)}));
//       localStorage.setItem("companyName", "${userData?.companySlug || ''}");

//       // ✅ SEND DATA BACK TO RN
//       const data = {
//         token: localStorage.getItem("token"),
//         user: localStorage.getItem("user"),
//         companyName: localStorage.getItem("companyName")
//       };

//       window.ReactNativeWebView.postMessage(JSON.stringify({
//         type: "LOCAL_STORAGE_DATA",
//         payload: data
//       }));

//       return true;
//     } catch (error) {
//       window.ReactNativeWebView.postMessage(JSON.stringify({
//         type: "ERROR",
//         message: error.message
//       }));
//       return false;
//     }
//   })();
//   true;
// `;

//   return (
//     <View style={styles.container}>
//       <AppHeader
//         // leftIcon="chevron-back"
//         onLeftPress={() => {}}
//         title="Plans"
//         showBorder={false}
//       />
//       <WebViewScreen
//         key={url}
//         url={url}
//         injectedJavaScript={injectedJavaScript}
//         enableWebBack={false}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.white,
//   },
// });

// export default WebViewDashboard;

import React from 'react';
import {View, StyleSheet} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../../../constants';
import {useGetUserProfile} from '../../../services/queries/app/Profile';
import {useAppSelector} from '../../../redux/hooks';
import AppHeader from '../../../components/appHeader';
import WebViewScreen from '../webview';

const WebViewDashboard = () => {
  const insets = useSafeAreaInsets();
  const {data, isLoading: isUserProfileLoading, refetch} = useGetUserProfile();
  const {token} = useAppSelector(state => state.auth);
  const userData = data?.datas || null;
  const webBaseUrl = 'https://staging.bidbuyzoom.com';
  const url = `${webBaseUrl}/${
    userData?.companySlug || ''
  }/dashboard?mobile=true`;

  const injectedJavaScript = `
  (function() {
    try {
      localStorage.setItem("token", JSON.stringify("${token}"));
      localStorage.setItem("user", JSON.stringify(${JSON.stringify(userData)}));
      localStorage.setItem("companyName", "${userData?.companySlug || ''}");
      
      console.log('✅ Auth data injected successfully');
      
      // Listen for console logs from website
      const originalConsoleLog = console.log;
      console.log = function(...args) {
        originalConsoleLog.apply(console, args);
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'CONSOLE_LOG',
            message: args.join(' ')
          }));
        }
      };
      
      return true;
    } catch (error) {
      console.log('Error injecting data:', error);
      return false;
    }
  })();
  true;
`;

  // Handle messages from WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('📱 Message from WebView:', data);

      // Check if card was added successfully
      if (data.type === 'CARD_ADDED_SUCCESS') {
        console.log('💳 Card added successfully! Refetching user profile...');
        refetch(); // This will refresh the user profile data
      }

      // Log any other messages from website
      if (data.type === 'CONSOLE_LOG') {
        console.log('🌐 Website console:', data.message);
      }
    } catch (error) {
      console.log('Error parsing WebView message:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <AppHeader
        onLeftPress={() => {}}
        title="Plans"
        showBorder={false}
      /> */}
      <WebViewScreen
        key={url}
        url={url}
        injectedJavaScript={injectedJavaScript}
        onMessage={handleWebViewMessage}
        enableWebBack={false}
        showLoader={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
});

export default WebViewDashboard;
