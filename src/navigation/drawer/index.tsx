import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { CustomDrawerContent } from './CustomDrawerContent';
import { StatusBar } from 'react-native';
import { colors } from '../../constants';
import { createStackNavigator } from '@react-navigation/stack';
import { drawerParamsList } from '../navigationTypes';
import HomeDashBoard from '../../screen/app/home';
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

const Drawer = createDrawerNavigator<drawerParamsList>();

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
        drawerContent={props => <CustomDrawerContent {...props}  />}
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
        <Drawer.Screen name={routes.catalogScreen} component={CatalogScreen} />
        <Drawer.Screen name={routes.addNewLotScreen} component={AddNewLotScreen} />
        <Drawer.Screen name={routes.lotImagesScreen} component={LotImagesScreen} />
        <Drawer.Screen name={routes.lotDetailsScreen} component={LotDetailsScreen} />
      </Drawer.Navigator>
    </>
  );
};

export default AppDrawer;
