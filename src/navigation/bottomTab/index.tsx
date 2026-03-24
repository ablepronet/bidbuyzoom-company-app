import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { colors } from "../../constants";
import { routes } from "../route";
import { bottomTabParamsList } from "../navigationTypes";
import HomeDashBoard from "../../screen/app/home";
import Sales from "../../screen/app/sales";
import BidBuyers from "../../screen/app/bidBuyers";
import Setting from "../../screen/app/setting";
import Catalog from "../../screen/app/catalog";
import Icon from "react-native-vector-icons/Ionicons";
import { ms, vs } from "../../utils/responsive";
import {
  View,
  StyleSheet,
  Platform,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import AppHeader from "../../components/appHeader";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { AppText } from "../../components/AppText";
import { ImageComponent } from "../../components/AppImage";

const Tab = createBottomTabNavigator<bottomTabParamsList>();
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TAB_COUNT = 5;
const TAB_WIDTH = SCREEN_WIDTH / TAB_COUNT;

const renderIcon =
  (iconName: string, focusedIconName: string) =>
  ({ focused, color }: { focused: boolean; color: string; size: number }) => {
    return (
      <View style={styles.iconContainer}>
        <View
          style={[
            styles.topBorder,
            {
              backgroundColor: focused ? colors.primary : colors.border,
              height: focused ? vs(3) : vs(1),
            },
          ]}
        />
        <Icon
          name={focused ? focusedIconName : iconName}
          size={ms(22)}
          color={color}
        />
      </View>
    );
  };

const BottomTabNavigator = () => {
  const navigation = useNavigation();

  const handleOpenDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const renderHeaderRight = () => (
    <View style={styles.headerRight}>
      <TouchableOpacity style={styles.headerIcon}>
        <View>
          <Icon
            name="notifications-outline"
            size={ms(22)}
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
          size={ms(22)}
          color={colors.textPrimary}
        />
      </TouchableOpacity>
    </View>
  );

  const renderHeaderCenter = () => (
    <ImageComponent
      source={require("../../assets/images/appLogo.png")}
      style={styles.headerLogo}
      resizeMode="contain"
    />
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        header: () => (
          <AppHeader
            leftIcon="menu-outline"
            onLeftPress={handleOpenDrawer}
            centerContent={renderHeaderCenter()}
            rightContent={
              route.name === routes.dashboardTab ? renderHeaderRight() : null
            }
            showBorder={false}
          />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: { width: TAB_WIDTH },
      })}
    >
      <Tab.Screen
        name={routes.dashboardTab}
        component={HomeDashBoard}
        options={{
          tabBarLabel: "Dashboard",
          tabBarIcon: renderIcon("home-outline", "home"),
        }}
      />
      <Tab.Screen
        name={routes.salesTab}
        component={Sales}
        options={{
          tabBarLabel: "Sales",
          tabBarIcon: renderIcon("hammer-outline", "hammer"),
        }}
      />
      <Tab.Screen
        name={routes.catalogTab}
        component={Catalog}
        options={{
          tabBarLabel: "Catalog",
          tabBarIcon: renderIcon("grid-outline", "grid"),
        }}
      />
      <Tab.Screen
        name={routes.biddersTab}
        component={BidBuyers}
        options={{
          tabBarLabel: "Bidders",
          tabBarIcon: renderIcon("people-outline", "people"),
        }}
      />
      <Tab.Screen
        name={routes.moreTab}
        component={Setting}
        options={{
          tabBarLabel: "More",
          tabBarIcon: renderIcon(
            "ellipsis-horizontal-outline",
            "ellipsis-horizontal",
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === "ios" ? vs(85) : vs(70),
    backgroundColor: colors.white,
    borderTopWidth: 0,
  },
  iconContainer: {
    flex: 1,
    width: TAB_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: vs(5),
  },
  topBorder: {
    position: "absolute",
    top: 0,
    width: TAB_WIDTH,
    alignSelf: "center",
    zIndex: 1,
  },
  label: {
    fontSize: ms(12),
    fontFamily: "Aeonik-Medium",
    marginTop: vs(4),
    paddingBottom: Platform.OS === "ios" ? vs(5) : vs(10),
    textAlign: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    marginLeft: ms(12),
  },
  badge: {
    position: "absolute",
    right: -ms(4),
    top: -vs(4),
    backgroundColor: colors.red,
    borderRadius: 10,
    width: ms(16),
    height: ms(16),
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  headerLogo: {
    width: ms(80),
    height: vs(30),
  },
});

export default BottomTabNavigator;
