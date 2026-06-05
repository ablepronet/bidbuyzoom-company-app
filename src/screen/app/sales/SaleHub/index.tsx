import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { AppText } from '../../../../components/AppText';
import { colors } from '../../../../constants';
import { ms, vs } from '../../../../utils/responsive';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import globalStyles from '../../../../styles/globalStyles';
import AppHeader from '../../../../components/appHeader';
import { getSaleDates } from '../../../../helper/getTodayDate';
import { useGetUserProfile } from '../../../../services/queries/app/Profile';
import { routes } from '../../../../navigation/route';
import Loader from '../../../../components/loader';
import {
  SalesListingItem,
  useGetSalesListing,
} from '../../../../services/queries/app/sales/useGetSalesListing';

type RouteParams = {
  saleId?: string;
  selectedSale?: any; // replace with proper type if you have one
  fromAddSaleFlow?: boolean;
};

const webBaseUrl = 'https://staging.bidbuyzoom.com';

const SalesHub = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const { saleId, selectedSale, fromAddSaleFlow } = route.params || {};
  const [isNavigating, setIsNavigating] = useState(false);
  const {
    data: salesListingData,
    refetch: refetchSalesListing,
    isFetching: isSalesListingFetching,
  } = useGetSalesListing();
  const { data } = useGetUserProfile();
  const userData = data?.datas || null;

  useFocusEffect(
    useCallback(() => {
      setIsNavigating(false);
    }, []),
  );

  const menuItems = [
    {
      id: '1',
      title: 'Sale Info',
      subtitle: 'Edit sale details',
      icon: 'clipboard-text-outline',
      color: '#AD2429',
      navigateUrl: `${webBaseUrl}/${userData?.companySlug || ''
        }/sales-information?id=${saleId}?mobile=true`,
    },

    {
      id: '2',
      title: 'Settings',
      subtitle: 'Sale configuration',
      icon: 'cog-outline',
      color: '#3B82F6',
      navigateUrl: `${webBaseUrl}/${userData?.companySlug || ''
        }/settings?id=${saleId}?mobile=true`,
    },
    {
      id: '3',
      title: 'Catalog',
      subtitle: 'Manage lots',
      icon: 'view-grid-outline',
      color: '#10B981',
      highlighted: false,
      navigateUrl: '',
    },
    {
      id: '4',
      title: 'Monitor',
      subtitle: 'Live bid tracking',
      icon: 'chart-line',
      color: '#F59E0B',
      navigateUrl: `${webBaseUrl}/${userData?.companySlug || ''
        }/monitor/summary?id=${saleId}?mobile=true`,
    },
    {
      id: '5',
      title: 'Invoice',
      subtitle: 'Billing & payments',
      icon: 'file-document-outline',
      color: '#8B5CF6',
      navigateUrl: `${webBaseUrl}/${userData?.companySlug || ''
        }/invoice?id=${saleId}?mobile=true`,
    },
    {
      id: '6',
      title: 'Settlement',
      subtitle: 'Consignor payouts',
      icon: 'handshake-outline',
      color: '#0D9488',
      navigateUrl: `${webBaseUrl}/${userData?.companySlug || ''
        }/settlement?id=${saleId}?mobile=true`,
    },
    {
      id: '7',
      title: 'Reports',
      subtitle: 'Sale analytics',
      icon: 'chart-bar',
      color: '#6366F1',
      navigateUrl: `${webBaseUrl}/${userData?.companySlug || ''
        }/reports/summary?id=${saleId}?mobile=true`,
    },
    // {
    //   id: '8',
    //   title: 'Bidder Site',
    //   subtitle: 'Preview live site',
    //   icon: 'earth',
    //   color: '#6B7280',
    //   navigateUrl: '',
    // },
  ];

  const handleGoback = () => {
    if (fromAddSaleFlow) {
      navigation.navigate('DashboardTabs', {
        screen: routes.salesTab,
        params: { refreshAt: Date.now() },
      });
      return;
    }

    navigation.goBack();
  };

  const isSaleActive = selectedSale?.isPastSale;
  const saleTitle = selectedSale?.saleName || selectedSale?.title || '';
  const startEndDate = useMemo(() => {
    try {
      const dates = getSaleDates(selectedSale);

      if (!dates) return '';

      if (dates.start && dates.end) {
        return `${dates.start} - ${dates.end}`;
      }

      return dates.start || dates.end || '';
    } catch (error) {
      console.log(error, 'error');
      return '';
    }
  }, [selectedSale]);

  const handleNavigation = async (item: any) => {
    const hubSaleId = saleId || selectedSale?._id || selectedSale?.saleId;
    const hubSale = {
      ...(selectedSale || {}),
      saleId: hubSaleId,
    };

    if (item.title === 'Sale Info') {
      setIsNavigating(true);
      let selectedSales = hubSale;
      console.log('selectedSalehubhub', hubSale);
      try {
        const latestSalesResponse = await refetchSalesListing();
        const sales =
          latestSalesResponse.data?.data || salesListingData?.data || [];
        selectedSales =
          sales.find((saleItem: SalesListingItem) => saleItem?._id === hubSaleId) ||
          hubSale;
      } catch { }

      navigation.navigate(routes.addNewSaleScreen, {
        saleId: hubSaleId,
        selectedSale: selectedSales,
        mode: 'edit',
      });
      return;
    }

    if (item.title === 'Settings') {
      navigation.navigate(routes.addSaleSettingsScreen, {
        saleId: hubSaleId,
        selectedSale: hubSale,
      });
      return;
    }

    if (item.title === 'Catalog') {
      setIsNavigating(true);
      let selectedSales = hubSale;

      try {
        const latestSalesResponse = await refetchSalesListing();
        const sales =
          latestSalesResponse.data?.data || salesListingData?.data || [];
        selectedSales =
          sales.find(
            (saleItem: SalesListingItem) =>
              saleItem?._id === hubSaleId || saleItem?.saleId === hubSaleId,
          ) || hubSale;
      } catch { }

      const catalogSaleId =
        selectedSales?._id || selectedSales?.saleId || hubSaleId;
      const catalogSale = {
        ...selectedSales,
        saleId: catalogSaleId,
      };

      if (catalogSale?.templateId) {
        navigation.navigate(routes.catalogScreen, {
          sale: catalogSale,
        });
        return;
      }

      navigation.navigate(routes.addSaleTemplateScreen, {
        saleId: catalogSaleId,
        selectedSale: catalogSale,
      });
    } else {
      navigation.navigate(routes.commonWebView, {
        title: item?.title,
        url: item.navigateUrl,
      });
    }
  };

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <AppHeader
        title="Sales Hub"
        leftIcon="chevron-back"
        onLeftPress={() => handleGoback()}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Sale Info Card */}
        <View style={styles.saleCard}>
          <View style={styles.saleCardHeader}>
            <AppText title={saleTitle} fontFamily="bold" fontySize="px20" />
            {isSaleActive && (
              <View style={styles.activeBadge}>
                <AppText title={'Live'} color="green" fontySize="px12" />
              </View>
            )}
          </View>

          <AppText
            title={startEndDate || ''}
            color="textSecondary"
            fontySize="px14"
            marginTop={vs(4)}
          />
          {/* <AppText title="668 lots" color="textSecondary" fontySize="px14" /> */}

          {/* Progress Bar Container */}
          {/* <View style={styles.progressSection}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: '60%' }]} />
            </View>
          </View> */}

          {/* <AppText
            title="Sale in Progress"
            fontySize="px14"
            fontFamily="medium"
          /> */}
        </View>

        {/* Grid */}
        <View style={styles.grid}>
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              disabled={isNavigating || isSalesListingFetching}
              style={[
                styles.gridItem,
                item.highlighted && styles.highlightedItem,
              ]}
              onPress={() => handleNavigation(item)}
            >
              <View
                style={[
                  styles.iconBackground,
                  { backgroundColor: item.color + '10' }, // 10% opacity
                ]}>
                <Icon name={item.icon} size={ms(26)} color={item.color} />
              </View>
              <AppText
                title={item.title}
                fontFamily="bold"
                fontySize="px16"
                textAlign="center"
                marginTop={vs(8)}
              />
              <AppText
                title={item.subtitle}
                color="textSecondary"
                fontySize="px12"
                textAlign="center"
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <Loader isLoading={isNavigating || isSalesListingFetching} transparent />

      {/* Footer */}
      {/* <View style={styles.footer}>
        <AppText
          title="Last updated: 2 min ago"
          color="textSecondary"
          fontySize="px14"
        />
        <TouchableOpacity style={styles.refreshButton}>
          <Ionicons
            name="refresh-outline"
            size={ms(18)}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      </View> */}
    </View>
  );
};

export default SalesHub;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ms(16),
    height: vs(60),
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: ms(60),
  },
  logo: {
    width: ms(32),
    height: vs(32),
  },
  scrollContent: {
    padding: ms(16),
    paddingBottom: vs(20),
  },
  saleCard: {
    backgroundColor: colors.white,
    borderRadius: ms(20),
    padding: ms(20),
    marginBottom: vs(16),
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  saleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(4),
  },
  activeBadge: {
    backgroundColor: '#DCFCE7', // Light green
    paddingHorizontal: ms(12),
    paddingVertical: vs(4),
    borderRadius: ms(20),
  },
  progressSection: {
    marginVertical: vs(16),
  },
  progressTrack: {
    height: vs(8),
    backgroundColor: '#F3F4F6',
    borderRadius: ms(4),
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: ms(20),
    padding: ms(20),
    marginBottom: vs(16),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  highlightedItem: {
    borderColor: colors.primary,
    backgroundColor: '#FEF2F2', // Very light primary/red
  },
  iconBackground: {
    width: ms(52),
    height: ms(52),
    borderRadius: ms(26),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(4),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(20),
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    marginBottom: vs(20),
  },
  refreshButton: {
    marginLeft: ms(8),
  },
});
