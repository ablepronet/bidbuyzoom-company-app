import {RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {routes} from './route';

export type authStackParamsList = {
  [routes.WelcomeScreen]: undefined;
  [routes.LoginScreen]: undefined;
  [routes.SignUp]: undefined;
  [routes.OtpVerification]: {
    from: 'login' | 'signUp' | 'forgot';
    type: 'phone' | 'email';
    userDetails?: null | any;
    email?: string;
    password?: string;
    rememberMe?: boolean;
  };
  [routes.ForgotPass]: undefined;
  [routes.ResetPassword]: {
    token: string;
  };
};

export type drawerParamsList = {
  [routes.homeTab]: undefined;
  [routes.bidBuyser]: undefined;
  [routes.company]: undefined;
  [routes.sale]: undefined;
  [routes.marketing]: undefined;
  [routes.setting]: undefined;
  [routes.consignmentRequests]: undefined;
  [routes.companyReport]: undefined;
  [routes.commonWebView]: {
    url: string;
    title: string;
  };
  DashboardTabs: undefined; // New tab navigator entry
};

export type bottomTabParamsList = {
  [routes.dashboardTab]: undefined;
  [routes.salesTab]: undefined;
  [routes.consignorsTab]: undefined;
  [routes.biddersTab]: undefined;
  [routes.moreTab]: undefined;
};

export type authNavigationType<RouteName extends keyof authStackParamsList> =
  NativeStackNavigationProp<authStackParamsList, RouteName>;

export type authRouteType<RouteName extends keyof authStackParamsList> =
  RouteProp<authStackParamsList, RouteName>;
