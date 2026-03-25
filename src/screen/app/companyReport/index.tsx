import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AppHeader from '../../../components/appHeader'
import { DrawerActions, useNavigation } from '@react-navigation/native'
import { ImageComponent } from '../../../components/AppImage'
import appImages from '../../../constants/appImages'
import { scale, vs } from '../../../utils/responsive'

const CompanyReport = () => {
  const navigation = useNavigation()

  const handleOpenDrawer = () => {
    navigation.goBack()
  }
  const renderHeaderCenter = () => (
    <ImageComponent
      source={appImages.splashLogo}
      style={styles.headerLogo}
      resizeMode="contain"
    />
  );
  return (
    <View style={styles.container}>
      <AppHeader
       leftIcon="chevron-back"
        onLeftPress={handleOpenDrawer}
        showBorder={false}
        title="Company Report"
      />
      <View style={styles.content}>
        <Text>Company Report Screen</Text>
      </View>
    </View>
  )
}

export default CompanyReport

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
   headerLogo: {
      width: scale(80),
      height: vs(30),
    },
})
