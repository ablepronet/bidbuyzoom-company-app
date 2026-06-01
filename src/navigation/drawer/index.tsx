import React, { Suspense } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { CustomDrawerContent } from './CustomDrawerContent';
import { StatusBar, StyleSheet, View } from 'react-native';
import { colors } from '../../constants';
import { drawerParamsList } from '../navigationTypes';
import Company from '../../screen/app/compnay';
import BidBuyers from '../../screen/app/bidBuyers';
import Marketing from '../../screen/app/marketing';
import Sales from '../../screen/app/sales';
import Setting from '../../screen/app/setting';
import ConsignmentRequests from '../../screen/app/consignmentRequests';
import CompanyReport from '../../screen/app/companyReport';
import CommonWebView from '../../screen/app/commonWebView';
import SalesHub from '../../screen/app/sales/SaleHub';
import CatalogScreen from '../../screen/app/sales/CatalogScreen';
import AddNewLotScreen from '../../screen/app/sales/AddNewLotScreen';
import LotImagesScreen from '../../screen/app/sales/LotImagesScreen';
import LotDetailsScreen from '../../screen/app/sales/LotDetailsScreen';
import { routes } from '../route';
import BottomTabNavigator from '../bottomTab';
import Loader from '../../components/loader';

const Drawer = createDrawerNavigator<drawerParamsList>();

const LazyScreenLoader = () => (
  <View style={styles.lazyLoader}>
    <Loader isLoading />
  </View>
);

const AddNewSaleScreen = React.lazy(
  () => import('../../screen/app/sales/AddNewSaleScreen'),
);
const AddSaleSettingsScreen = React.lazy(
  () => import('../../screen/app/sales/AddSaleSettingsScreen'),
);
const AddSaleTemplateScreen = React.lazy(
  () => import('../../screen/app/sales/AddSaleTemplateScreen'),
);
const NotificationScreen = React.lazy(
  () => import('../../screen/app/notifications'),
);
const MessagesScreen = React.lazy(
  () => import('../../screen/app/messages'),
);

const AddNewSaleRoute = (props: any) => (
  <Suspense fallback={<LazyScreenLoader />}>
    <AddNewSaleScreen {...props} />
  </Suspense>
);

const AddSaleSettingsRoute = (props: any) => (
  <Suspense fallback={<LazyScreenLoader />}>
    <AddSaleSettingsScreen {...props} />
  </Suspense>
);

const AddSaleTemplateRoute = (props: any) => (
  <Suspense fallback={<LazyScreenLoader />}>
    <AddSaleTemplateScreen {...props} />
  </Suspense>
);

const NotificationRoute = (props: any) => (
  <Suspense fallback={<LazyScreenLoader />}>
    <NotificationScreen {...props} />
  </Suspense>
);

const MessageRoute = (props: any) => (
  <Suspense fallback={<LazyScreenLoader />}>
    <MessagesScreen {...props} />
  </Suspense>
);

const renderDrawerContent = (props: any) => <CustomDrawerContent {...props} />;

const styles = StyleSheet.create({
  lazyLoader: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

const AppDrawer = () => {
  return (
    <>
      <StatusBar
        backgroundColor={colors.primary}
        barStyle="dark-content"
        translucent={true}
      />
      <Drawer.Navigator
        backBehavior="history"
        screenOptions={{
          headerShown: false,
          drawerType: 'slide',

        }}
        drawerContent={renderDrawerContent}
      >
        <Drawer.Screen name="DashboardTabs" component={BottomTabNavigator} />
        <Drawer.Screen name={routes.company} component={Company} />
        <Drawer.Screen name={routes.sale} component={Sales} />
        <Drawer.Screen name={routes.bidBuyser} component={BidBuyers} />
        <Drawer.Screen name={routes.marketing} component={Marketing} />
        <Drawer.Screen name={routes.setting} component={Setting} />
        <Drawer.Screen name={routes.consignmentRequests} component={ConsignmentRequests} />
        <Drawer.Screen name={routes.companyReport} component={CompanyReport} />
        <Drawer.Screen name={routes.commonWebView} component={CommonWebView} />
        <Drawer.Screen name={routes.saleHubScreen} component={SalesHub} />
        <Drawer.Screen name={routes.addNewSaleScreen} component={AddNewSaleRoute} />
        <Drawer.Screen name={routes.addSaleSettingsScreen} component={AddSaleSettingsRoute} />
        <Drawer.Screen name={routes.addSaleTemplateScreen} component={AddSaleTemplateRoute} />
        <Drawer.Screen name={routes.catalogScreen} component={CatalogScreen} />
        <Drawer.Screen name={routes.addNewLotScreen} component={AddNewLotScreen} />
        <Drawer.Screen name={routes.lotImagesScreen} component={LotImagesScreen} />
        <Drawer.Screen name={routes.lotDetailsScreen} component={LotDetailsScreen} />
        <Drawer.Screen name={routes.notificationScreen} component={NotificationRoute} />
        <Drawer.Screen name={routes.messageScreen} component={MessageRoute} />
      </Drawer.Navigator>
    </>
  );
};

export default AppDrawer;
