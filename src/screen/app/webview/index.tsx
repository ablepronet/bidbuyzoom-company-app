// import { StyleSheet, View } from 'react-native';
// import React, { useState, useRef } from 'react';
// import WebView from 'react-native-webview';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import Loader from '../../../components/loader';
// import { colors } from '../../../constants';
// import { vs } from '../../../utils/responsive';
// import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
// import { setUserLogout } from '../../../redux/slices/auth';

// // companytest@yopmail.com
// // System@123
// const WebViewScreen = ({ profileData }: { profileData: any }) => {
//   const [isLoading, setIsLoading] = useState(true);
//   const webViewRef = useRef(null);
//   const dispatch = useAppDispatch();

//   const { token, userId } = useAppSelector(state => state.auth);

//   const userData = profileData?.datas || null;
//   console.log(userData);

//   const headers = {
//     'User-Agent':
//       'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
//     Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
//     'Accept-Language': 'en-US,en;q=0.9',
//     'Accept-Encoding': 'gzip, deflate, br',
//     'Cache-Control': 'no-cache',
//     Pragma: 'no-cache',
//   };

//   const injectedJavaScript = `
//   (function() {
//     try {
//       localStorage.setItem("token", JSON.stringify("${token}"));
//       localStorage.setItem("user", JSON.stringify(${JSON.stringify(userData)}));
//       localStorage.setItem("companyName", "${
//         userData?.companySlug || ''
//       }");

//       // Override logout function if possible, or listen for logout events
//       // This depends on how your website handles logout
//       const originalClear = localStorage.clear;
//       localStorage.clear = function() {
//         window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'logout' }));
//         originalClear.apply(this, arguments);
//       };

//       console.log('Auth data injected and logout listener set');
//       return true;
//     } catch (error) {
//       console.log('Error:', error);
//       return false;
//     }
//   })();
//   true;
// `;

//   const handleLogoutAction = () => {
//     console.log('Logging out user from app...');
//     dispatch(setUserLogout());
//   };

//   const onNavigationStateChange = (navState: any) => {
//     const currentUrl = navState.url;
//     console.log('Navigation URL:', currentUrl);

//     // Check if user navigated to the main landing page or login page (logged out)
//     const isLandingPage =
//       currentUrl === 'https://staging.bidbuyzoom.com' ||
//       currentUrl === 'https://staging.bidbuyzoom.com/' ||
//       currentUrl.includes('/login');

//     if (isLandingPage && !isLoading) {
//       handleLogoutAction();
//     }
//   };

//   const onMessage = (event: any) => {
//     try {
//       const data = JSON.parse(event.nativeEvent.data);
//       if (data.type === 'logout') {
//         handleLogoutAction();
//       }
//     } catch (e) {
//       console.log('Error parsing WebView message:', e);
//     }
//   };

//   const onLoadEnd = () => {
//     setTimeout(() => {
//       setIsLoading(false);
//     }, 1000);
//   };

//   const onHttpError = (syntheticEvent: any) => {
//     const { nativeEvent } = syntheticEvent;
//     console.log('HTTP Error:', nativeEvent.statusCode);
//   };

//   const onError = (syntheticEvent: any) => {
//     const { nativeEvent } = syntheticEvent;
//     console.log('WebView Error:', nativeEvent);
//     setIsLoading(false);
//   };

//   if (!token) {
//     return <Loader isLoading={true} />;
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.innerContainer}>
//         <WebView
//           ref={webViewRef}
//           source={{
//             uri: 'https://staging.bidbuyzoom.com',
//             headers: headers,
//           }}
//           style={styles.webview}
//           onLoadStart={() => setIsLoading(true)}
//           onLoadEnd={onLoadEnd}
//           onNavigationStateChange={onNavigationStateChange}
//           onMessage={onMessage}
//           onHttpError={onHttpError}
//           onError={onError}
//           injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
//           javaScriptEnabled={true}
//           domStorageEnabled={true}
//           sharedCookiesEnabled={true}
//           thirdPartyCookiesEnabled={true}
//           startInLoadingState={true}
//           renderLoading={() => <Loader isLoading={true} />}
//         />
//       </View>
//       <Loader isLoading={isLoading} />
//     </SafeAreaView>
//   );
// };

// export default WebViewScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   innerContainer: {
//     flex: 1,
//     paddingHorizontal: vs(10),
//   },
//   webview: {
//     flex: 1,
//   },
// });

import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useState, useRef, useEffect} from 'react';
import WebView from 'react-native-webview';
import Loader from '../../../components/loader';
import {colors} from '../../../constants';
import {scale, vs} from '../../../utils/responsive';
import Icon from 'react-native-vector-icons/Ionicons';
import RNPrint from 'react-native-print';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

interface WebViewScreenProps {
  url: string;
  injectedJavaScript?: string;
  onMessage?: (event: any) => void;
  onNavigationStateChange?: (navState: any) => void;
  headers?: Record<string, string>;
  showLoader?: boolean;
  enableWebBack?: boolean;
  javaScriptEnabled?: boolean;
  domStorageEnabled?: boolean;
  sharedCookiesEnabled?: boolean;
  thirdPartyCookiesEnabled?: boolean;
  onLoadEnd?: () => void;
  onError?: (error: any) => void;
  headerTitle?: string;
}

const WebViewScreen: React.FC<WebViewScreenProps> = ({
  url,
  injectedJavaScript,
  onMessage,
  onNavigationStateChange,
  headers,
  showLoader = true,
  javaScriptEnabled = true,
  domStorageEnabled = true,
  sharedCookiesEnabled = true,
  thirdPartyCookiesEnabled = true,
  onLoadEnd: customOnLoadEnd,
  onError: customOnError,
  enableWebBack = false,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  const [canGoBack, setCanGoBack] = useState(false);
  //@ts-ignore
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const webViewRef = useRef<WebView>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    setIsLoading(true);
  }, [url]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const stopLoading = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }, 2000); // 2 seconds, as requested
  };

  const handleLoadEnd = () => {
    stopLoading();
    customOnLoadEnd?.();
  };

  const handleError = (syntheticEvent: any) => {
    const {nativeEvent} = syntheticEvent;
    console.log('WebView Error:', nativeEvent);
    stopLoading();
    customOnError?.(nativeEvent);
  };

  const handleHttpError = (syntheticEvent: any) => {
    const {nativeEvent} = syntheticEvent;
    console.log('HTTP Error:', nativeEvent.statusCode);
    stopLoading();
  };

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    onNavigationStateChange?.(navState);
    if (!navState.loading) {
      stopLoading();
    }
  };

  const handleExportCSV = async (filename: string, content: string) => {
    try {
      const path = `${RNFS.CachesDirectoryPath}/${filename}`;
      await RNFS.writeFile(path, content, 'utf8');

      const shareOptions = {
        title: 'Export CSV',
        url: `file://${path}`,
        type: 'text/csv',
        failOnCancel: false,
      };

      await Share.open(shareOptions);
    } catch (error) {
    }
  };

  const handleMessage = async (event: any) => {
    try {
      const messageData = JSON.parse(event.nativeEvent.data);
      console.log('📱 WebView Message Received:', messageData.type);

      if (messageData.type === 'PRINT_HTML') {
        const {html} = messageData.data;
        if (html) {
          await RNPrint.print({html});
        }
        return;
      }

      if (messageData.type === 'EXPORT_CSV') {
        const {filename, content} = messageData.data;
        if (filename && content) {
          await handleExportCSV(filename, content);
        }
        return;
      }

      // If it's not our custom events, pass it to the onMessage prop if provided
      onMessage?.(event);
    } catch (e) {
      console.log('Error parsing WebView message:', e);
      onMessage?.(event);
    }
  };

  // Handle navigation requests - prevent opening in external browser
  const onShouldStartLoadWithRequest = (event: any) => {
    // Only allow navigation within the same domain to prevent opening external browser
    const isSameDomain =
      event.url.includes('staging.bidbuyzoom.com') ||
      event.url.includes('bidbuyzoom.com') ||
      event.url.startsWith('about:blank');

    // If it's not the same domain, prevent the WebView from loading it
    // This keeps the navigation within the WebView
    return isSameDomain;
  };

  // JavaScript to hide website headers and fix styling for mobile app
  const hideHeaderJavaScript = `
    (function() {
      // Hide website headers and fix mobile styling
      try {
        // Hide header elements that might conflict with app header
        const headerSelectors = [
          'header',
          '.header',
          '#header',
          '.navbar',
          '.nav-bar',
          '.main-header',
          '.site-header',
          '[role="banner"]'
        ];
        
        headerSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.height = '0';
            el.style.padding = '0';
            el.style.margin = '0';
            el.style.opacity = '0';
            el.style.position = 'absolute';
            el.style.zIndex = '-9999';
          });
        });

        // Add mobile app specific styling
        const style = document.createElement('style');
        style.innerHTML = 'body { padding-top: 0 !important; margin-top: 0 !important; } .mobile-app-container { padding-top: env(safe-area-inset-top) !important; } html, body { overflow-x: hidden !important; width: 100% !important; }';
        document.head.appendChild(style);

        // Add mobile app class to body
        document.body.classList.add('mobile-app-container');

        return true;
      } catch (error) {
        console.log('Error hiding headers:', error);
        return false;
      }
    })();
    true;
  `;

  const exportBridgeJavaScript = `
    (function() {
      if (window.__rnExportBridgeInstalled) return true;
      window.__rnExportBridgeInstalled = true;

      const objectUrlContent = {};

      const getFilename = function(anchor, fallbackUrl) {
        const downloadName = anchor && anchor.getAttribute('download');
        if (downloadName) return downloadName;

        try {
          const cleanUrl = String(fallbackUrl || '').split('?')[0].split('#')[0];
          const lastPath = cleanUrl.split('/').pop();
          if (lastPath && lastPath.includes('.')) return lastPath;
        } catch (error) {}

        return 'export.csv';
      };

      const postCsvExport = function(filename, content) {
        if (!content || !window.ReactNativeWebView) return;

        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: 'EXPORT_CSV',
            data: {
              filename: filename || 'export.csv',
              content: content,
            },
          }),
        );
      };

      const decodeDataUrl = function(url) {
        const commaIndex = url.indexOf(',');
        if (commaIndex === -1) return '';

        const meta = url.slice(0, commaIndex);
        const data = url.slice(commaIndex + 1);

        if (meta.includes(';base64')) {
          return decodeURIComponent(
            Array.prototype.map
              .call(atob(data), function(char) {
                return '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2);
              })
              .join(''),
          );
        }

        return decodeURIComponent(data);
      };

      const originalCreateObjectURL = URL.createObjectURL;
      URL.createObjectURL = function(blob) {
        const objectUrl = originalCreateObjectURL.apply(URL, arguments);

        if (
          blob &&
          typeof blob.text === 'function' &&
          (
            !blob.type ||
            blob.type.includes('csv') ||
            blob.type.includes('text') ||
            blob.type.includes('octet-stream')
          )
        ) {
          blob.text().then(function(content) {
            objectUrlContent[objectUrl] = content;
          });
        }

        return objectUrl;
      };

      const exportAnchor = function(anchor) {
        if (!anchor) return false;

        const href = anchor.href || anchor.getAttribute('href') || '';
        const hasDownload = anchor.hasAttribute('download');
        const filename = getFilename(anchor, href);

        if (href.startsWith('data:text/csv') || href.startsWith('data:application/csv')) {
          postCsvExport(filename, decodeDataUrl(href));
          return true;
        }

        if (href.startsWith('blob:')) {
          const postBlobContent = function() {
            const content = objectUrlContent[href];
            if (content) {
              postCsvExport(filename, content);
              return;
            }
            setTimeout(postBlobContent, 120);
          };

          postBlobContent();
          return hasDownload;
        }

        if (hasDownload && href) {
          fetch(href, {credentials: 'include'})
            .then(function(response) {
              const contentType = response.headers.get('content-type') || '';
              if (
                contentType.includes('csv') ||
                contentType.includes('text') ||
                filename.toLowerCase().endsWith('.csv')
              ) {
                return response.text();
              }
              return '';
            })
            .then(function(content) {
              postCsvExport(filename, content);
            })
            .catch(function(error) {
              console.log('RN export bridge fetch failed', error);
            });

          return true;
        }

        return false;
      };

      const originalAnchorClick = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function() {
        if (exportAnchor(this)) return;
        return originalAnchorClick.apply(this, arguments);
      };

      document.addEventListener(
        'click',
        function(event) {
          const target =
            event.target && event.target.nodeType === 1
              ? event.target
              : event.target?.parentElement;
          const anchor = target && target.closest && target.closest('a[download]');

          if (anchor && exportAnchor(anchor)) {
            event.preventDefault();
            event.stopPropagation();
            if (event.stopImmediatePropagation) event.stopImmediatePropagation();
          }
        },
        true,
      );

      return true;
    })();
    true;
  `;

  // Combine injected JavaScript
  const combinedJavaScript = injectedJavaScript
    ? `${injectedJavaScript}\n${hideHeaderJavaScript}\n${exportBridgeJavaScript}`
    : `${hideHeaderJavaScript}\n${exportBridgeJavaScript}`;

  return (
    <View style={styles.innerContainer}>
      {enableWebBack && canGoBack && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => webViewRef.current?.goBack()}>
          <Icon name="chevron-back" size={22} color="#000" />
        </TouchableOpacity>
      )}
      <WebView
        source={{
          uri: url,
          headers: headers,
        }}
        ref={webViewRef}
        style={styles.webview}
        onLoadStart={() => {
          setIsLoading(true);
          // Clear any previous timeout to prevent multiple loaders
          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }
        }}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onHttpError={handleHttpError}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        injectedJavaScriptBeforeContentLoaded={combinedJavaScript}
        javaScriptEnabled={javaScriptEnabled}
        domStorageEnabled={domStorageEnabled}
        sharedCookiesEnabled={sharedCookiesEnabled}
        thirdPartyCookiesEnabled={thirdPartyCookiesEnabled}
        startInLoadingState={true}
        // Android specific props to prevent opening in external browser
        setSupportMultipleWindows={false}
        setBuiltInZoomControls={false}
        setDisplayZoomControls={false}
        scalesPageToFit={false}
        // Handle navigation requests to prevent opening external browser
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        // Additional props for better Android handling
        allowsBackForwardNavigationGestures={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        // Timeout for loading state
        // renderLoading={() => <Loader isLoading={true} />}
      />
      {showLoader && <Loader isLoading={isLoading} />}
    </View>

    // </SafeAreaView>
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
  },
  header: {
    marginBottom: 10,
  },
  webview: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: vs(5),
    left: scale(15),
    zIndex: 999,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
    elevation: 5,
  },
});
