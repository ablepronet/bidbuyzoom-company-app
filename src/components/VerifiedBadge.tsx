import React from 'react';
import {View, Image, StyleSheet} from 'react-native';
import {ImageComponent} from './AppImage';
import {appIcons} from '../constants';

const VerifiedBadge = () => {
  return (
    <View style={styles.container}>
      <ImageComponent
        source={appIcons.white.check}
        style={styles.icon}
        resizeMode="contain"
      />
    </View>
  );
};

export default VerifiedBadge;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#28A745',
    padding: 4,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 12,
    height: 12,
  },
});
