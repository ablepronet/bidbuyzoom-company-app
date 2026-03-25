import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AppHeader from '../../../components/appHeader'
import { DrawerActions, useNavigation } from '@react-navigation/native'

const Marketing = () => {
  const navigation = useNavigation()

  const handleOpenDrawer = () => {
    navigation.goBack()
  }

  return (
    <View style={styles.container}>
      <AppHeader
         leftIcon="chevron-back"
        onLeftPress={handleOpenDrawer}
        title="Marketing"
      />
      <View style={styles.content}>
        <Text>Marketing Screen</Text>
      </View>
    </View>
  )
}

export default Marketing

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
