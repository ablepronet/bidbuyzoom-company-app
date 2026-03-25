import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {DrawerActions, useNavigation} from '@react-navigation/native';
import {useGetUserProfile} from '../../../services/queries/app/Profile';
import Loader from '../../../components/loader';
import {AppText} from '../../../components/AppText';
import {ImageComponent} from '../../../components/AppImage';
import {colors} from '../../../constants';
import {ms, vs} from '../../../utils/responsive';
import Icon from 'react-native-vector-icons/Ionicons';
import AppHeader from '../../../components/appHeader';
import Modal from 'react-native-modal';
import {useAppDispatch} from '../../../redux/hooks';
import {setUserLogout} from '../../../redux/slices/auth';
import PerformanceAnalytics from '../../../components/PerformanceAnalytics';
import AccountSetup from '../../../components/AccountSetup';
import {useGetDashBoardData} from '../../../services/queries/app/dashboard';
import {formatDate} from '../../../helper/getTodayDate';

import {routes} from '../../../navigation/route';

const {width} = Dimensions.get('window');

const HomeDashBoard = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const {data, isLoading} = useGetUserProfile();
  const [selectedYear, setSelectedYear] = useState('2026');
  const {data: dashboardData, isLoading: isDashboardLoading} =
    useGetDashBoardData(selectedYear);
  const [isProfileModalVisible, setProfileModalVisible] = useState(false);

  const userData = data?.datas || null;
  const dashboard = dashboardData?.data || null;
  const stats = dashboard?.statistics || null;
  const setup = dashboard?.accountSetup || null;

  const accountSteps = [
    {
      key: 'registration',
      title: 'Registration',
      isCompleted: setup?.registration ?? true,
    },
    {
      key: 'profile',
      title: 'Profile',
      isCompleted: setup?.profile ?? false,
    },
    {
      key: 'settings',
      title: 'Settings',
      isCompleted: setup?.settings ?? false,
    },
    {
      key: 'processor',
      title: 'Processor',
      isCompleted: setup?.processor ?? false,
    },
    {
      key: 'payment',
      title: 'Payment',
      isCompleted: setup?.payment ?? false,
    },
    {
      key: 'plan',
      title: 'Select Plan',
      isCompleted: setup?.selectPlan ?? false,
    },
  ];

  const completedStepsCount = setup?.completedCount ?? 0;
  const totalSteps = setup?.totalSteps ?? 6;
  const progressPercentage = (completedStepsCount / totalSteps) * 100;

  const handleOpenDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleLogout = () => {
    setProfileModalVisible(false);
    dispatch(setUserLogout());
  };

  const toggleProfileModal = () => {
    setProfileModalVisible(!isProfileModalVisible);
  };

  if (isLoading || isDashboardLoading) {
    return <Loader isLoading={true} />;
  }

  const performanceData = {
    lots: stats?.totalLots ?? 0,
    bidders: stats?.totalBidders ?? 0,
    sales: stats?.totalRevenue ?? 0,
    commission: stats?.totalCommission ?? 0,
    premium: stats?.totalBuyerPremium ?? 0,
  };

  const currentSales = dashboard?.currentSales || [];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollInner}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statsCard, {backgroundColor: colors.primary}]}>
            <View style={styles.statsCardContent}>
              <AppText title="Yearly Revenue" color="white" fontySize="px14" />
              <AppText
                title={`$${stats?.totalRevenue ?? 0}`}
                color="white"
                fontySize="px22"
                fontFamily="bold"
                marginTop={vs(5)}
              />
            </View>
            <View style={styles.statsCardIconOverlay}>
              <View style={styles.circleOverlay} />
            </View>
          </View>
          <View style={[styles.statsCard, {backgroundColor: '#282a42'}]}>
            <View style={styles.statsCardContent}>
              <AppText title="Items Sold" color="white" fontySize="px14" />
              <AppText
                title={`${stats?.totalLots ?? 0}`}
                color="white"
                fontySize="px22"
                fontFamily="bold"
                marginTop={vs(5)}
              />
            </View>
            <View style={styles.statsCardIconOverlay}>
              <View
                style={[
                  styles.circleOverlay,
                  {backgroundColor: 'rgba(255,255,255,0.08)'},
                ]}
              />
            </View>
          </View>
        </View>

        {/* Account Setup Section */}
        <View style={styles.sectionCard}>
          <View style={styles.redTopBorder} />
          <AccountSetup
            steps={accountSteps}
            completedCount={completedStepsCount}
            totalCount={totalSteps}
            progress={progressPercentage}
          />
        </View>

        {/* Current Sales Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <AppText
              title="Current Sales"
              fontySize="px16"
              fontFamily="bold"
              color="primary"
            />
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => navigation.navigate(routes.salesTab)}>
              <AppText title="View all" fontySize="px12" color="primary" />
              <Icon
                name="arrow-forward-outline"
                size={ms(14)}
                color={colors.primary}
                style={{marginLeft: ms(4)}}
              />
            </TouchableOpacity>
          </View>
          {currentSales.length > 0 ? (
            currentSales.map((sale: any) => {
              const startDate = formatDate(sale.multiStartDate[0]?.startDate);
              const endDate = formatDate(sale.multiStartDate[1]?.startDate);
              return (
                <View key={sale._id} style={styles.saleItem}>
                  <View style={styles.saleHeader}>
                    <AppText
                      title={sale.title}
                      fontySize="px14"
                      fontFamily="bold"
                    />
                    <View style={styles.saleTypeBadge}>
                      <AppText
                        title={sale.saleType}
                        color="white"
                        fontySize="px10"
                        fontFamily="bold"
                      />
                    </View>
                  </View>

                  <View style={styles.saleDateRow}>
                    <Icon
                      name="calendar-outline"
                      size={ms(14)}
                      color={colors.textSecondary}
                    />
                    <AppText
                      title={`Start: ${startDate}`}
                      fontySize="px12"
                      color="textSecondary"
                      marginLeft={ms(8)}
                    />
                  </View>
                  <View style={styles.saleDateRow}>
                    <Icon
                      name="calendar-outline"
                      size={ms(14)}
                      color={colors.textSecondary}
                    />
                    <AppText
                      title={`Ends: ${endDate}`}
                      fontySize="px12"
                      color="textSecondary"
                      marginLeft={ms(8)}
                    />
                  </View>

                  <View style={styles.saleActionRow}>
                    <TouchableOpacity
                      style={styles.saleActionBtn}
                      onPress={() => navigation.navigate(routes.salesTab)}>
                      <AppText
                        title="View"
                        fontySize="px12"
                        color="textSecondary"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.saleActionBtn, styles.manageBtn]}
                      onPress={() => navigation.navigate(routes.salesTab)}>
                      <AppText
                        title="Manage"
                        fontySize="px12"
                        color="primary"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.saleActionBtn}
                      onPress={() => navigation.navigate(routes.salesTab)}>
                      <AppText
                        title="Monitor"
                        fontySize="px12"
                        color="textSecondary"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyPlaceholder}>
              <Icon name="hammer-outline" size={ms(45)} color="#D1D5DB" />
              <AppText
                title="No active sales found"
                fontySize="px14"
                color="textSecondary"
                style={styles.emptyText}
                marginTop={vs(15)}
              />
              <AppText
                title="Create a new sale to see it here."
                fontySize="px12"
                color="textSecondary"
                marginTop={vs(5)}
              />
            </View>
          )}
        </View>

        {/* Performance Analytics Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <AppText
              title="Performance Analytics"
              fontySize="px14"
              fontFamily="bold"
            />
            <View style={styles.yearTabs}>
              <TouchableOpacity
                style={[
                  styles.yearTab,
                  selectedYear === '2026' && styles.yearTabActive,
                ]}
                onPress={() => setSelectedYear('2026')}>
                <AppText
                  title="2026"
                  fontySize="px12"
                  color={selectedYear === '2026' ? 'white' : 'textPrimary'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.yearTab,
                  selectedYear === '2025' && styles.yearTabActive,
                ]}
                onPress={() => setSelectedYear('2025')}>
                <AppText
                  title="2025"
                  fontySize="px12"
                  color={selectedYear === '2025' ? 'white' : 'textPrimary'}
                />
              </TouchableOpacity>
            </View>
          </View>

          <PerformanceAnalytics data={performanceData} year={selectedYear} />
        </View>
        <View style={{height: vs(30)}} />
      </ScrollView>

      {/* Profile Dropdown Modal */}
      <Modal
        isVisible={isProfileModalVisible}
        onBackdropPress={toggleProfileModal}
        onBackButtonPress={toggleProfileModal}
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropOpacity={0.3}
        style={styles.modalContainer}>
        <View style={styles.profileModal}>
          <View style={styles.modalHeader}>
            <View style={styles.modalAvatar}>
              <AppText
                title={(userData?.companyName || 'C').charAt(0).toUpperCase()}
                color="white"
                fontFamily="bold"
                fontySize="px16"
              />
            </View>
            <View style={styles.modalUserInfo}>
              <AppText
                title={userData?.companyName || 'company test'}
                fontySize="px14"
                fontFamily="bold"
              />
              <TouchableOpacity>
                <AppText
                  title="Manage your account"
                  fontySize="px10"
                  color="textSecondary"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.modalDivider} />

          <TouchableOpacity style={styles.modalItem}>
            <Icon
              name="calendar-outline"
              size={ms(18)}
              color={colors.textSecondary}
            />
            <AppText
              title="Plan: Active"
              fontySize="px12"
              style={styles.modalItemText}
            />
            <Icon
              name="checkmark-circle"
              size={ms(16)}
              color={colors.success}
              style={styles.modalCheck}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.modalItem}>
            <Icon
              name="card-outline"
              size={ms(18)}
              color={colors.textSecondary}
            />
            <AppText
              title="Payment Information"
              fontySize="px12"
              style={styles.modalItemText}
            />
            <Icon
              name="checkmark-circle"
              size={ms(16)}
              color={colors.success}
              style={styles.modalCheck}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.modalItem}>
            <Icon
              name="person-outline"
              size={ms(18)}
              color={colors.textSecondary}
            />
            <AppText
              title="Profile"
              fontySize="px12"
              style={styles.modalItemText}
            />
          </TouchableOpacity>

          <View style={styles.modalDivider} />

          <TouchableOpacity style={styles.modalItem} onPress={handleLogout}>
            <Icon name="log-out-outline" size={ms(18)} color={colors.primary} />
            <AppText
              title="Logout"
              fontySize="px12"
              color="primary"
              style={styles.modalItemText}
            />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Floating Action Button */}
      {/* <TouchableOpacity style={styles.fab}>
        <Icon name="add" size={ms(30)} color={colors.white} />
      </TouchableOpacity> */}
    </View>
  );
};

export default HomeDashBoard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    padding: ms(15),
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vs(15),
  },
  statsCard: {
    width: (width - ms(45)) / 2,
    borderRadius: 12,
    padding: ms(15),
    height: vs(95),
    justifyContent: 'center',
    overflow: 'hidden',
  },
  statsCardContent: {
    zIndex: 1,
  },
  statsCardIconOverlay: {
    position: 'absolute',
    right: -ms(20),
    top: -vs(10),
  },
  circleOverlay: {
    width: ms(90),
    height: ms(90),
    borderRadius: ms(45),
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: ms(15),
    marginBottom: vs(15),
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  redTopBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: vs(3),
    backgroundColor: colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(15),
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    marginLeft: ms(8),
  },
  statsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(5),
  },
  statsIconWrapper: {
    width: ms(24),
    height: ms(24),
    borderRadius: ms(12),
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ms(8),
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vs(5),
  },
  saleItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: vs(15),
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(10),
  },
  saleTypeBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: ms(10),
    paddingVertical: vs(2),
    borderRadius: 4,
  },
  saleDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(5),
  },
  saleActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vs(15),
  },
  saleActionBtn: {
    flex: 1,
    height: vs(35),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: ms(5),
  },
  manageBtn: {
    borderColor: colors.primary,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyPlaceholder: {
    alignItems: 'center',
    paddingVertical: vs(35),
  },
  emptyText: {
    fontWeight: '500',
  },
  yearTabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    padding: ms(3),
  },
  yearTab: {
    paddingHorizontal: ms(12),
    paddingVertical: vs(5),
    borderRadius: 4,
  },
  yearTabActive: {
    backgroundColor: colors.primary,
  },
  modalContainer: {
    margin: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: vs(60),
    paddingRight: ms(15),
  },
  profileModal: {
    backgroundColor: colors.white,
    borderRadius: 12,
    width: width * 0.65,
    padding: ms(15),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(10),
  },
  modalAvatar: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ms(10),
  },
  modalUserInfo: {
    flex: 1,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#F1F3F5',
    marginVertical: vs(10),
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(8),
  },
  modalItemText: {
    marginLeft: ms(10),
    flex: 1,
  },
  modalCheck: {
    marginLeft: ms(5),
  },
  fab: {
    position: 'absolute',
    right: ms(20),
    bottom: vs(20),
    backgroundColor: colors.primary,
    width: ms(56),
    height: ms(56),
    borderRadius: ms(28),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
});
