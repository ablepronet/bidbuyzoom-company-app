import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {colors} from '../../constants';
import {routes} from '../route';
import {bottomTabParamsList} from '../navigationTypes';
import HomeDashBoard from '../../screen/app/home';
import Sales from '../../screen/app/sales';
import BidBuyers from '../../screen/app/bidBuyers';
import Setting from '../../screen/app/setting';
import Icon from 'react-native-vector-icons/Ionicons';
import {ms, vs, scale} from '../../utils/responsive';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  View,
  StyleSheet,
  Platform,
  Dimensions,
  TouchableOpacity,
  Pressable,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';
import AppHeader from '../../components/appHeader';
import {DrawerActions, useNavigation} from '@react-navigation/native';
import {AppText} from '../../components/AppText';
import {ImageComponent} from '../../components/AppImage';
import appImages from '../../constants/appImages';
import Consignors from '../../screen/app/Consignors';

const Tab = createBottomTabNavigator<bottomTabParamsList>();
const {width: SCREEN_WIDTH} = Dimensions.get('window');
const TAB_COUNT = 5;
const TAB_WIDTH = SCREEN_WIDTH / TAB_COUNT;

// ── No-ripple tab button (from Doc 2) ─────────────────────────────────────────
interface NoFeedbackTabButtonProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
}

const NoFeedbackTabButton: React.FC<NoFeedbackTabButtonProps> = ({
  children,
  onPress,
  style,
}) => (
  <Pressable onPress={onPress} android_ripple={null} style={style}>
    {children}
  </Pressable>
);

// ── Icon renderer ─────────────────────────────────────────────────────────────
const renderIcon =
  (iconName: string, focusedIconName: string) =>
  ({focused, color}: {focused: boolean; color: string; size: number}) => {
    return (
      <View style={styles.iconContainer}>
        {/* Active top border — only rendered when focused (Doc 2 pattern) */}
        {focused && <View style={styles.activeTopBorder} />}

        <Icon
          name={focused ? focusedIconName : iconName}
          size={scale(22)}
          color={color}
        />
      </View>
    );
  };

// ── Navigator ─────────────────────────────────────────────────────────────────
const BottomTabNavigator = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleOpenDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const renderHeaderRight = () => (
    <View style={styles.headerRight}>
      <TouchableOpacity style={styles.headerIcon}>
        <View>
          <Icon
            name="notifications-outline"
            size={scale(22)}
            color={colors.textPrimary}
          />
          <View style={styles.badge}>
            <AppText
              title="2"
              color="white"
              fontySize="px10"
              fontFamily="bold"
            />
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.headerIcon}>
        <Icon
          name="chatbubble-outline"
          size={scale(22)}
          color={colors.textPrimary}
        />
      </TouchableOpacity>
    </View>
  );

  const renderHeaderCenter = () => (
    <ImageComponent
      source={appImages.splashLogo}
      style={styles.headerLogo}
      resizeMode="contain"
    />
  );

  const dynamicTabBarStyle = {
    height: vs(50) + insets.bottom,
    paddingBottom: insets.bottom > 0 ? insets.bottom : vs(5),
  };

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: true,
        header: () => (
          <AppHeader
            leftIcon="menu-outline"
            onLeftPress={handleOpenDrawer}
            centerContent={renderHeaderCenter()}
            // rightContent={
            //   route.name === routes.dashboardTab ? renderHeaderRight() : null
            // }
            showBorder={false}
          />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: [styles.tabBar, dynamicTabBarStyle],
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: {width: TAB_WIDTH},
        tabBarButton: props => <NoFeedbackTabButton {...props} />,
      })}>
      <Tab.Screen
        name={routes.dashboardTab}
        component={HomeDashBoard}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: renderIcon('home-outline', 'home'),
        }}
      />
      <Tab.Screen
        name={routes.salesTab}
        component={Sales}
        options={{
          tabBarLabel: 'Sales',
          tabBarIcon: renderIcon('hammer-outline', 'hammer'),
        }}
      />
      <Tab.Screen
        name={routes.consignorsTab}
        component={Consignors}
        options={{
          tabBarLabel: 'Consignors',
          tabBarIcon: renderIcon('person-outline', 'person'),
        }}
      />
      <Tab.Screen
        name={routes.biddersTab}
        component={BidBuyers}
        options={{
          tabBarLabel: 'Bidders',
          tabBarIcon: renderIcon('people-outline', 'people'),
        }}
      />
      <Tab.Screen
        name={routes.moreTab}
        component={Setting}
        options={{
          tabBarLabel: 'More',
          tabBarIcon: renderIcon(
            'ellipsis-horizontal-outline',
            'ellipsis-horizontal',
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  iconContainer: {
    flex: 1,
    width: '100%', // fills full tab cell (Doc 2)
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: vs(5), // pushes icon down so border sits at very top
    marginTop: -6,
  },

  // Always vs(3) tall, conditionally rendered (Doc 2 pattern)
  activeTopBorder: {
    position: 'absolute',
    top: 0,
    width: TAB_WIDTH,
    height: vs(3),
    backgroundColor: colors.primary,
    alignSelf: 'center',
  },

  label: {
    fontSize: scale(10), // scale instead of ms (Doc 2)
    fontFamily: 'Aeonik-Medium',
    fontWeight: '600',
    paddingTop: vs(3), // Doc 2 pattern, replaces marginTop + paddingBottom
    textAlign: 'center',
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: scale(12),
  },
  badge: {
    position: 'absolute',
    right: -scale(4),
    top: -vs(4),
    backgroundColor: colors.red,
    borderRadius: 10,
    width: scale(16),
    height: scale(16),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  headerLogo: {
    width: scale(80),
    height: vs(30),
  },
});

export default BottomTabNavigator;
