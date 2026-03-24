import React, {memo} from 'react';
import {View, StyleSheet} from 'react-native';
import {vs} from '../utils/responsive';
import {ImageComponent} from './AppImage';
import {AppText} from './AppText';

interface EmptyStateProps {
  lightIcon?: any;
  heading?: string;
  subHeading?: string;
}

const EmptyState = ({
  lightIcon,
  heading,
  subHeading,
}: EmptyStateProps) => {
  return (
    <View style={styles.centreView}>
      {!!lightIcon && (
        <ImageComponent
          source={lightIcon}
          style={styles.image}
          resizeMode='cover'
        />
      )}

      {!!heading && (
        <AppText
          title={heading}
          fontFamily="medium"
          fontySize="px18"
          marginTop={10}
        />
      )}

      {!!subHeading && (
        <AppText
          title={subHeading}
          fontFamily="medium"
          fontySize="px14"
          marginTop={6}
          color="textSecondary"
          textAlign='center'
        />
      )}
    </View>
  );
};

export default memo(EmptyState);

const styles = StyleSheet.create({
  centreView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: vs(30),
    paddingBottom: vs(60),
    marginTop:vs(150)
  },
  image: {
    width: vs(80),
    height: vs(80),
  },
});