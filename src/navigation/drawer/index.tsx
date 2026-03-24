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
import Profile from '../../screen/app/profile';
import CreateScreen from '../../screen/app/create';
import { routes } from '../route';
import BottomTabNavigator from '../bottomTab';

const Drawer = createDrawerNavigator<drawerParamsList>();

const AppDrawer = () => {
  return (
    <>
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
        <Drawer.Screen name={routes.create} component={CreateScreen} />
        <Drawer.Screen name={routes.setting} component={Setting} />
        <Drawer.Screen name={routes.profile} component={Profile} />
      </Drawer.Navigator>
    </>
  );
};

export default AppDrawer;
