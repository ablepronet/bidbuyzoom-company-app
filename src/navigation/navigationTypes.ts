import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { routes } from './route';

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
  [routes.plansScreen]: undefined;
  [routes.addCardScreen]: undefined;
  [routes.manageCardsScreen]: undefined;
  [routes.billingSubscriptionScreen]: undefined;
  [routes.consignmentRequests]: undefined;
  [routes.companyReport]: undefined;
  [routes.commonWebView]: {
    url: string;
    title: string;
  };
  [routes.smsSecurityScreen]: undefined;
  [routes.profileScreen]: undefined;
  [routes.saleHubScreen]: {
    saleId: string;
    selectedSale: any | null;
    fromAddSaleFlow?: boolean;
  };
  [routes.addNewSaleScreen]:
  | {
    saleId?: string;
    selectedSale?: any | null;
    mode?: 'add' | 'edit';
  }
  | undefined;
  [routes.addSaleSettingsScreen]: {
    saleId?: string;
    selectedSale?: any | null;
  };
  [routes.addSaleTemplateScreen]: {
    saleId?: string;
    selectedSale?: any | null;
  };
  DashboardTabs: undefined; // New tab navigator entry
  [routes.catalogScreen]: undefined;
  [routes.addNewLotScreen]: undefined;
  [routes.lotImagesScreen]: undefined;
  [routes.lotDetailsScreen]: {
    lot?: any;
  };
  [routes.addEditClientScreen]:
    | {
        client?: any;
        mode?: 'add' | 'edit';
      }
    | undefined;
  [routes.clientProfileScreen]: {
    client: any;
  };
  [routes.addEditBidderScreen]:
    | {
        bidder?: any;
        mode?: 'add' | 'edit';
      }
    | undefined;
  [routes.bidderProfileScreen]: {
    bidder: any;
  };
  [routes.notificationScreen]: undefined;
  [routes.messageScreen]: undefined;
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
