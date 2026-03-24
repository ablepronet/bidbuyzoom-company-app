import {createNavigationContainerRef} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export const resetToHome = () => {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [
        {
          name: 'MainTabs',
          state: {
            routes: [{name: 'HomeScreen'}],
          },
        },
      ],
    });
  }
};