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
      </Drawer.Navigator>
    </>
  );
};

export default AppDrawer;
