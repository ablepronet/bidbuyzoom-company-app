import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import {DrawerContentScrollView} from '@react-navigation/drawer';
import {useNavigation, useNavigationState} from '@react-navigation/native';
import {colors} from '../../constants';
import {AppText} from '../../components/AppText';
import {ImageComponent} from '../../components/AppImage';
import appImages from '../../constants/appImages';
import {ms, vs} from '../../utils/responsive';
import AppButton from '../../components/appButton';
import {useAppDispatch, useAppSelector} from '../../redux/hooks';
import {setUserLogout} from '../../redux/slices/auth';
import {persister} from '../../redux/store';
import Icon from 'react-native-vector-icons/Ionicons';

import {routes} from '../route';
import {useGetUserProfile} from '../../services/queries/app/Profile';

// Types
type MenuItemType = {
  id: string;
  title: string;
  icon: string;
  route?: string;
  tabScreen?: string; // Optional: target screen within DashboardTabs
  badge?: number;
};

// Static menu data matching the screenshot
const menuItems: MenuItemType[] = [
  {
    id: '1',
    title: 'Dashboard',
    icon: 'home-outline',
    route: 'DashboardTabs',
    tabScreen: routes.dashboardTab,
  },
  {
    id: '2',
    title: 'Sales',
    icon: 'hammer-outline',
    route: 'DashboardTabs',
    tabScreen: routes.salesTab,
  },
  {
    id: '3',
    title: 'Consignors',
    icon: 'person-outline',
    route: 'DashboardTabs',
    tabScreen: routes.consignorsTab,
  },
  {
    id: '4',
    title: 'Bidders',
    icon: 'people-outline',
    route: 'DashboardTabs',
    tabScreen: routes.biddersTab,
  },
  // {
  //   id: '5',
  //   title: 'Invoices',
  //   icon: 'document-text-outline',
  //   route: routes.sale, // Map to existing drawer route if not in tabs
  // },
  {
    id: '6',
    title: 'Consignment Requests',
    icon: 'mail-outline',
    route: routes.consignmentRequests,
  },
  {
    id: '7',
    title: 'Company Report',
    icon: 'bar-chart-outline',
    route: routes.companyReport,
  },
  {
    id: '10',
    title: 'Marketing',
    icon: 'megaphone-outline',
    route: routes.marketing,
  },
  // {
  //   id: '8',
  //   title: 'Notifications',
  //   icon: 'notifications-outline',
  //   route: routes.setting, // Placeholder
  //   badge: 3,
  // },
  {
    id: '9',
    title: 'Settings',
    icon: 'settings-outline',
    route: 'DashboardTabs',
    tabScreen: routes.moreTab,
  },
];

export const CustomDrawerContent = (props: any) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const {user} = useAppSelector(state => state.auth);
  const {data, isLoading} = useGetUserProfile();

  const userData = user || null;

  const activeRouteName = useNavigationState(state => {
    const getActiveRouteName = (state: any): string | undefined => {
      if (!state || !state.routes || state.index === undefined)
        return undefined;
      const route = state.routes[state.index];
      if (route.state) {
        return getActiveRouteName(route.state);
      }
      return route.name;
    };
    return getActiveRouteName(state);
  });

  const handleNavigate = (item: MenuItemType) => {
    if (item.tabScreen) {
      // @ts-ignore
      navigation.navigate(item.route, {screen: item.tabScreen});
    } else if (item.route) {
      // @ts-ignore
      navigation.navigate(item.route);
    }
  };

  const renderMenuItem = (item: MenuItemType, index: number) => {
    const isSelected = item.tabScreen
      ? activeRouteName === item.tabScreen
      : activeRouteName === item.route;

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.menuItem, isSelected && styles.menuItemSelected]}
        onPress={() => handleNavigate(item)}>
        {isSelected && <View style={styles.activeIndicator} />}
        <View style={styles.menuItemLeft}>
          <Icon
            name={item.icon}
            size={ms(20)}
            color={isSelected ? colors.primary : colors.textPrimary}
            style={styles.menuIcon}
          />
          <AppText
            title={item.title}
            color={isSelected ? 'primary' : 'textPrimary'}
            fontySize="px14"
            fontFamily={isSelected ? 'bold' : 'medium'}
            style={styles.menuTitle}
          />
        </View>
        {item.badge && (
          <View style={styles.badge}>
            <AppText
              title={item.badge.toString()}
              color="white"
              fontySize="px10"
              fontFamily="bold"
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const handleLogout = async () => {
    await persister.purge();
    dispatch(setUserLogout());
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <ImageComponent
          source={appImages.splashLogo}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <ImageComponent
              uri={data?.datas.logo}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <AppText
            title={userData?.companyName || 'company test'}
            color="white"
            fontySize="px16"
            fontFamily="bold"
            marginTop={vs(10)}
          />
          <AppText
            title={userData?.email || 'test@company.com'}
            color="white"
            fontySize="px12"
            style={{opacity: 0.8}}
          />
        </View>
      </View>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {menuItems.map((item, index) => renderMenuItem(item, index))}

        <View style={styles.footerSection}>
          <TouchableOpacity style={styles.footerItem}>
            <Icon
              name="megaphone"
              size={ms(20)}
              color={colors.primary}
              style={styles.menuIcon}
            />
            <AppText
              title="Help & Support"
              color="primary"
              fontySize="px14"
              fontFamily="bold"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.footerItem} onPress={handleLogout}>
            <Icon
              name="log-out-outline"
              size={ms(20)}
              color={colors.primary}
              style={styles.menuIcon}
            />
            <AppText
              title="Logout"
              color="primary"
              fontySize="px14"
              fontFamily="bold"
            />
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>
    </View>
  );
};

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerSection: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'android' ? vs(40) : vs(50),
    paddingBottom: vs(20),
    paddingHorizontal: ms(20),
    alignItems: 'center',
  },
  logo: {
    width: ms(100),
    height: vs(40),
    marginVertical: vs(15),
  },
  profileContainer: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: ms(70),
    height: ms(70),
    borderRadius: ms(35),
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingTop: vs(10),
    paddingBottom: vs(20),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vs(12),
    paddingHorizontal: ms(20),
    position: 'relative',
  },
  menuItemSelected: {
    backgroundColor: colors.lightBackground,
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: vs(10),
    bottom: vs(10),
    width: 4,
    backgroundColor: colors.primary,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    marginRight: ms(15),
  },
  menuTitle: {
    flex: 1,
  },
  badge: {
    backgroundColor: colors.primary,
    width: ms(18),
    height: ms(18),
    borderRadius: ms(9),
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerSection: {
    marginTop: vs(20),
    paddingHorizontal: ms(20),
    borderTopWidth: 1,
    borderTopColor: colors.softGray,
    paddingTop: vs(20),
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(20),
  },
});

export default CustomDrawerContent;
