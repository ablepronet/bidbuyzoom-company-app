import {StyleSheet, View} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import WebViewScreen from '../webview';
import {useAppSelector} from '../../../redux/hooks';
import {useGetUserProfile} from '../../../services/queries/app/Profile';

import {routes} from '../../../navigation/route';
import {useNavigation} from '@react-navigation/native';

const Sales = ({route}: {route: any}) => {
  const navigation = useNavigation<any>();
  const {from, saleId, refreshAt} = route.params || {};
  const [refreshKey, setRefreshKey] = useState(0);
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

        if (!window.__addNewSaleListenerAdded) {
          window.__addNewSaleListenerAdded = true;
          document.addEventListener(
            'click',
            function(event) {
              const clickedElement =
                event.target && event.target.nodeType === 1
                  ? event.target
                  : event.target?.parentElement;
              if (!clickedElement) return;
              const target = clickedElement.closest(
                'button, a, [role="button"]',
              );
              if (!target) return;

              const buttonText = (target.innerText || target.textContent || '')
                .replace(/\\s+/g, ' ')
                .trim()
                .toLowerCase();

              if (
                buttonText.includes('add new sale') ||
                buttonText.includes('add new sales')
              ) {
                event.preventDefault();
                event.stopPropagation();
                if (event.stopImmediatePropagation) {
                  event.stopImmediatePropagation();
                }

                window.ReactNativeWebView.postMessage(
                  JSON.stringify({type: 'ADD_NEW_SALE_PRESSED'}),
                );
              }
            },
            true,
          );
        }

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

        case 'ADD_NEW_SALE_PRESSED':
          navigation.navigate(routes.addNewSaleScreen, {
            mode: 'add',
            saleId: undefined,
            selectedSale: null,
          });
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

  useEffect(() => {
    if (refreshAt) {
      setRefreshKey(prev => prev + 1);
    }
  }, [refreshAt]);

  return (
    <View style={styles.innerContainer}>
      <WebViewScreen
        key={`${url}-${refreshKey}`}
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
