import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {Provider} from 'react-redux';
import {persister, store} from './src/redux/store';
import {PersistGate} from 'redux-persist/integration/react';

import {SafeAreaProvider} from 'react-native-safe-area-context';
// import { KeyboardProvider } from 'react-native-keyboard-controller';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import RootStack from './src/navigation/rootStack';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
const App = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Provider store={store}>
        <PersistGate persistor={persister} loading={null}>
          <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
              {/* <KeyboardProvider> */}
              <BottomSheetModalProvider>
                <RootStack />
              </BottomSheetModalProvider>
              {/* </KeyboardProvider> */}
            </SafeAreaProvider>
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;

const styles = StyleSheet.create({});
