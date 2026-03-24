import React from 'react';
import { StatusBar, View } from 'react-native';
import { styles } from './styles';
import appImages from '../../constants/appImages';
import { appString } from '../../constants';
import { vs } from '../../utils/responsive';
import { ImageComponent } from '../../components/AppImage';
import { AppText } from '../../components/AppText';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
        translucent={false}
        hidden={true}
      />

      <View style={styles.centerLogoWrapper}>
        <ImageComponent source={appImages.splashLogo} style={styles.logo} />
      </View>
    </View>
  );
};

export default SplashScreen;
