import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Platform } from 'react-native';
import AppHeader from '../../../components/appHeader';
import { AppText } from '../../../components/AppText';
import Card from '../../../components/Card';
import AppButton from '../../../components/appButton';
import { colors } from '../../../constants';
import { ms, vs } from '../../../utils/responsive';
import Icon from 'react-native-vector-icons/Ionicons';
import { useGetUserProfile } from '../../../services/queries/app/Profile';
import { useGetPricing, useGetBillingSummary, useSubscribePlan, PricingPlan } from '../../../services/queries/app/plans/plans';
import AppToast from '../../../components/toaster';
import { useAppDispatch } from '../../../redux/hooks';
import { setUserLogout } from '../../../redux/slices/auth';
import { persister } from '../../../redux/store';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { routes } from '../../../navigation/route';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddCardScreen from './AddCardScreen';
import moment from 'moment';

const Stack = createNativeStackNavigator();
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isCompactAndroid = Platform.OS === 'android' && SCREEN_WIDTH < 390;

const PlansScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { data: profileData, isLoading: isProfileLoading } = useGetUserProfile();
  const { data: pricingData, isLoading: isPricingLoading } = useGetPricing();
  const { data: billingData, isLoading: isBillingLoading } = useGetBillingSummary();
  const subscribeMutation = useSubscribePlan();

  const [selectedPeriod, setSelectedPeriod] = useState<'Monthly' | 'Yearly' | 'Lifetime'>('Monthly');
  const [monthlySalesCount, setMonthlySalesCount] = useState<number>(5);

  const userData = profileData?.datas || null;

  const currentPlanName = useMemo(() => {
    return billingData?.currentPlan?.name || billingData?.currentPlan?.planName || '';
  }, [billingData]);

  // Filter plans based on selected period
  const filteredPlans = useMemo(() => {
    if (!pricingData) return [];
    const filtered = pricingData.filter((plan: PricingPlan) => plan.period === selectedPeriod);
    return filtered;
  }, [pricingData, selectedPeriod]);

  // Estimate cost based on selected plan (we take the first plan or standard estimate)
  const costEstimate = useMemo(() => {
    const activePlanPrice = filteredPlans[0]?.amount ? parseFloat(filteredPlans[0].amount) : 100;
    const transactionFeePerSale = 50; // standard fee
    const subscriptionCost = activePlanPrice;
    const transactionFees = monthlySalesCount * transactionFeePerSale;
    const estimatedTotal = subscriptionCost + transactionFees;

    return {
      subscriptionCost,
      transactionFees,
      estimatedTotal,
    };
  }, [filteredPlans, monthlySalesCount]);

  const handleSelectPeriod = useCallback((period: 'Monthly' | 'Yearly' | 'Lifetime') => {
    setSelectedPeriod(period);
  }, []);

  const handleAddPaymentMethod = useCallback(() => {
    navigation.navigate(routes.addCardScreen);
  }, [navigation]);

  const handleSelectPlan = useCallback((plan: PricingPlan) => {
    if (!userData?.stripePaymentMethodId) {
      AppToast.error('Please add a payment card first!');
      return;
    }
    subscribeMutation.mutate({
      companyId: userData?._id || '',
      planId: plan._id,
      startTrial: !!plan.isTrialAvailable,
      trialDays: plan.trialDays || 0,
    }, {
      onSuccess: async () => {
        await Promise.all([
          queryClient.refetchQueries({ queryKey: ['billingSummary'] }),
          queryClient.refetchQueries({ queryKey: ['userProfile'] }),
        ]);
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      }
    });
  }, [userData, subscribeMutation, navigation, queryClient]);

  const incrementSales = useCallback(() => {
    setMonthlySalesCount((prev) => prev + 1);
  }, []);

  const decrementSales = useCallback(() => {
    setMonthlySalesCount((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  const handleLogout = useCallback(async () => {
    await persister.purge();
    queryClient.clear();
    dispatch(setUserLogout());
  }, [dispatch, queryClient]);

  const isLoading = isProfileLoading || isPricingLoading || isBillingLoading;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="Plans"
        showBorder={false}
        showNotification={false}
        leftIcon={userData?.planSelected ? "chevron-back" : undefined}
        onLeftPress={userData?.planSelected ? () => navigation.goBack() : undefined}
        rightContent={
          !userData?.planSelected ? (
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Icon name="log-out-outline" size={ms(24)} color={colors.primary} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Step Banner - Onboarding only */}
        {!userData?.planSelected && (
          <Card style={styles.setupCard}>
            <View style={styles.setupHeader}>
              <View style={styles.setupIconContainer}>
                <Icon name="card-outline" size={ms(22)} color={colors.primary} />
              </View>
              <View style={styles.setupTextContainer}>
                <AppText
                  title="Account Set Up: Step 1 of 2 — Add a Payment Card"
                  fontySize="px14"
                  fontFamily="bold"
                  color="textPrimary"
                />
                <AppText
                  title="You need to add a company card first. Once your card is saved, you can select a plan to activate your account."
                  fontySize="px12"
                  fontFamily="regular"
                  color="textSecondary"
                  marginTop={vs(4)}
                />
              </View>
            </View>
            <AppButton
              title="Add Payment Method"
              onPress={handleAddPaymentMethod}
              style={styles.addButton}
            />
          </Card>
        )}

        {/* Subscription Status Card */}
        <Card style={styles.statusCard}>
          {/* Header row matching screenshot 2 */}
          <View style={styles.statusHeaderRow}>
            <View style={styles.statusTitleGroup}>
              <View style={styles.statusIconBg}>
                <Icon name="card" size={ms(20)} color={colors.primary} />
              </View>
              <AppText title="Your Subscription" fontySize="px16" fontFamily="bold" color="textPrimary" />
            </View>
            <View style={styles.statusActionGroup}>
              <TouchableOpacity
                style={styles.manageBillingBtn}
                onPress={() => {
                  navigation.navigate(routes.billingSubscriptionScreen);
                }}
              >
                <Icon name="card-outline" size={ms(14)} color={colors.textPrimary} style={styles.headerActionIcon} />
                <AppText title="Manage Billing" fontySize="px12" fontFamily="bold" color="textPrimary" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.changePlanHeaderBtn}
                onPress={() => {
                  AppToast.success("Please select a plan below to change.");
                }}
              >
                <AppText title="Change Plan" fontySize="px12" fontFamily="bold" color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.statusDivider} />

          {/* Details Row */}
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <AppText title="Current Plan" fontySize="px10" fontFamily="medium" color="textSecondary" />
              <AppText
                title={currentPlanName || "No plan selected"}
                fontySize="px12"
                fontFamily="bold"
                color="primary"
                marginTop={vs(4)}
              />
            </View>

            <View style={styles.statusItem}>
              <AppText title="Renewal Date" fontySize="px10" fontFamily="medium" color="textSecondary" />
              <AppText
                title={billingData?.nextBillingDate ? moment(billingData.nextBillingDate).format('MMM D, YYYY') : 'Not available'}
                fontySize="px12"
                fontFamily="bold"
                color="textPrimary"
                marginTop={vs(4)}
              />
            </View>

            <View style={styles.statusItem}>
              <AppText title="Status" fontySize="px10" fontFamily="medium" color="textSecondary" />
              <View style={billingData?.subscriptionStatus === 'active' ? styles.badgeActive : styles.badgePending}>
                <AppText
                  title={billingData?.subscriptionStatus || "Pending"}
                  fontySize="px10"
                  fontFamily="bold"
                  color={billingData?.subscriptionStatus === 'active' ? "green" : "warning"}
                />
              </View>
            </View>

            <View style={styles.statusItem}>
              <AppText title="Payment Method" fontySize="px10" fontFamily="medium" color="textSecondary" />
              <AppText
                title={userData?.stripePaymentMethodId ? "Card connected" : "No card on file"}
                fontySize="px12"
                fontFamily="bold"
                color="textPrimary"
                marginTop={vs(4)}
              />
            </View>
          </View>
        </Card>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <AppText title="Auction Software Plans" fontySize="px18" fontFamily="bold" color="textPrimary" />
          <AppText
            title="Choose the plan that matches your business size and sales volume."
            fontySize="px12"
            fontFamily="regular"
            color="textSecondary"
            marginTop={vs(4)}
          />
        </View>

        {/* Toggles */}
        <View style={styles.toggleContainer}>
          {(['Monthly', 'Yearly', 'Lifetime'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.toggleButton,
                period === 'Yearly' && styles.toggleButtonWide,
                isCompactAndroid && styles.toggleButtonCompact,
                selectedPeriod === period && styles.toggleButtonActive
              ]}
              onPress={() => handleSelectPeriod(period)}
            >
              <AppText
                title={period === 'Yearly' ? 'Yearly (Save 20%)' : period}
                fontySize="px12"
                fontFamily="bold"
                color={selectedPeriod === period ? 'white' : 'textSecondary'}
                numberOfLines={1}
                style={[styles.toggleText, isCompactAndroid && styles.toggleTextCompact]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Estimate Monthly Cost */}
        <Card style={styles.estimatorCard}>
          <View style={styles.estimatorHeader}>
            <Icon name="calculator-outline" size={ms(18)} color={colors.primary} />
            <AppText title="Estimate Your Monthly Cost" fontySize="px12" fontFamily="bold" color="textPrimary" marginLeft={ms(6)} />
          </View>

          <View style={styles.estimatorRow}>
            <AppText title="Monthly Sales" fontySize="px12" fontFamily="medium" color="textSecondary" />
            <View style={styles.counterContainer}>
              <TouchableOpacity onPress={decrementSales} style={styles.counterBtn}>
                <Icon name="remove-circle-outline" size={ms(20)} color={colors.textPrimary} />
              </TouchableOpacity>
              <AppText title={monthlySalesCount.toString()} fontySize="px14" fontFamily="bold" color="textPrimary" style={styles.counterVal} />
              <TouchableOpacity onPress={incrementSales} style={styles.counterBtn}>
                <Icon name="add-circle-outline" size={ms(20)} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.estimatorRow}>
            <AppText title="Subscription" fontySize="px12" fontFamily="regular" color="textSecondary" />
            <AppText title={`$${costEstimate.subscriptionCost.toFixed(2)}`} fontySize="px12" fontFamily="bold" color="textPrimary" />
          </View>

          <View style={styles.estimatorRow}>
            <AppText title="Transaction Fees" fontySize="px12" fontFamily="regular" color="textSecondary" />
            <AppText title={`$${costEstimate.transactionFees.toFixed(2)}`} fontySize="px12" fontFamily="bold" color="textPrimary" />
          </View>

          <View style={styles.estimatorDivider} />

          <View style={styles.estimatorRow}>
            <AppText title="Estimated Monthly Total" fontySize="px14" fontFamily="bold" color="textPrimary" />
            <AppText title={`$${costEstimate.estimatedTotal.toFixed(2)}`} fontySize="px14" fontFamily="bold" color="primary" />
          </View>
        </Card>

        {/* Pricing Cards */}
        {filteredPlans.map((plan: PricingPlan) => {
          const isCurrentPlan = billingData?.currentPlan?._id === plan._id ||
            billingData?.currentPlan?.planId === plan._id ||
            currentPlanName.toLowerCase() === plan.planName?.toLowerCase();

          return (
            <Card
              key={plan._id}
              style={[
                styles.planCard,
                plan.isPopular && styles.popularPlanCard,
                isCurrentPlan && styles.currentPlanCard
              ]}
            >
              {isCurrentPlan && (
                <View style={styles.currentPlanBadge}>
                  <AppText title="Current Plan" fontySize="px10" fontFamily="bold" color="white" />
                </View>
              )}
              {plan.isPopular && !isCurrentPlan && (
                <View style={styles.popularBadge}>
                  <AppText title="MOST POPULAR" fontySize="px10" fontFamily="bold" color="white" />
                </View>
              )}
              <AppText title={plan.planName} fontySize="px16" fontFamily="bold" color="textPrimary" style={styles.planName} />
              <AppText title={plan.description} fontySize="px12" fontFamily="regular" color="textSecondary" style={styles.planDesc} />

              <View style={styles.priceContainer}>
                <AppText title={`$${plan.amount}`} fontySize="px24" fontFamily="bold" color="textPrimary" />
                <AppText title={plan.period === 'Lifetime' ? ' / Lifetime' : ' / mo'} fontySize="px12" fontFamily="medium" color="textSecondary" style={styles.periodText} />
              </View>
              <AppText title="+$50.00 per sale" fontySize="px10" fontFamily="medium" color="textSecondary" style={styles.additionalFee} />

              {plan.isTrialAvailable && (
                <View style={styles.trialBadge}>
                  <Icon name="gift-outline" size={ms(12)} color={colors.blue} style={{ marginRight: ms(4) }} />
                  <AppText title={`Includes ${plan.trialDays}-Day Free Trial`} fontySize="px10" fontFamily="bold" color="blue" />
                </View>
              )}

              <View style={styles.planFeatures}>
                {plan.featuresIds?.map((feat, index) => (
                  <View key={`${plan._id}_${feat._id}_${index}`} style={styles.featureRow}>
                    <Icon name="checkmark-circle" size={ms(14)} color={colors.green} style={styles.featureIcon} />
                    <AppText title={feat.name} fontySize="px12" fontFamily="regular" color="textPrimary" />
                  </View>
                ))}
              </View>

              <AppButton
                title={isCurrentPlan ? "✓ Current Plan" : (userData?.stripePaymentMethodId ? (plan.isTrialAvailable ? "Start Free Trial" : "Subscribe Now") : "Add Card First")}
                onPress={() => !isCurrentPlan && handleSelectPlan(plan)}
                disabled={isCurrentPlan || (!userData?.stripePaymentMethodId && !plan.isTrialAvailable)}
                loading={subscribeMutation.isPending && subscribeMutation.variables?.planId === plan._id}
                transparent={isCurrentPlan}
                borderColor={isCurrentPlan ? "green" : undefined}
                textColor={isCurrentPlan ? "green" : "textLight"}
                bgColor={userData?.stripePaymentMethodId ? "primary" : "lightPrimary"}
                style={styles.planBtn}
              />
            </Card>
          );
        })}

        {/* Feature Highlights Footer */}
        <View style={styles.footerFeatures}>
          <View style={styles.footerItem}>
            <Icon name="sync-circle-outline" size={ms(20)} color={colors.primary} />
            <AppText title="Cancel Anytime" fontySize="px12" fontFamily="bold" color="textPrimary" marginTop={vs(4)} />
            <AppText title="No long-term contracts." fontySize="px10" fontFamily="regular" color="textSecondary" marginTop={vs(2)} />
          </View>
          <View style={styles.footerItem}>
            <Icon name="shield-checkmark-outline" size={ms(20)} color={colors.primary} />
            <AppText title="Secure Payments" fontySize="px12" fontFamily="bold" color="textPrimary" marginTop={vs(4)} />
            <AppText title="Your payment details are safe." fontySize="px10" fontFamily="regular" color="textSecondary" marginTop={vs(2)} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const WebViewDashboard = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PlansMain" component={PlansScreen} />
      <Stack.Screen name={routes.addCardScreen} component={AddCardScreen} />
    </Stack.Navigator>
  );
};

export default WebViewDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightBackground,
  },
  scrollContent: {
    paddingHorizontal: ms(16),
    paddingBottom: vs(40),
  },
  setupCard: {
    backgroundColor: colors.white,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    borderRadius: 8,
    padding: ms(16),
    marginTop: vs(12),
    marginBottom: vs(12),
  },
  setupHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  setupIconContainer: {
    marginRight: ms(10),
    marginTop: vs(2),
  },
  setupTextContainer: {
    flex: 1,
  },
  addButton: {
    marginTop: vs(12),
    backgroundColor: colors.primary,
    height: vs(36),
    borderRadius: 6,
  },
  statusCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: ms(16),
    marginBottom: vs(16),
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: vs(8),
    marginBottom: vs(12),
  },
  statusTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconBg: {
    width: ms(32),
    height: ms(32),
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ms(10),
  },
  statusActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
    flexWrap: 'wrap',
  },
  manageBillingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: ms(8),
    paddingVertical: vs(5),
    backgroundColor: colors.white,
  },
  changePlanHeaderBtn: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: ms(10),
    paddingVertical: vs(5),
  },
  headerActionIcon: {
    marginRight: ms(4),
  },
  statusDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: vs(12),
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusItem: {
    flex: 1,
    alignItems: 'flex-start',
  },
  badgePending: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: ms(8),
    paddingVertical: vs(2),
    borderRadius: 4,
    marginTop: vs(4),
  },
  badgeActive: {
    backgroundColor: '#DEF7EC',
    paddingHorizontal: ms(8),
    paddingVertical: vs(2),
    borderRadius: 4,
    marginTop: vs(4),
  },
  sectionHeader: {
    marginBottom: vs(16),
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: ms(4),
    marginBottom: vs(16),
  },
  toggleButton: {
    flex: 1,
    paddingVertical: vs(8),
    paddingHorizontal: ms(4),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    minHeight: vs(36),
  },
  toggleButtonWide: {
    flex: 1.3,
  },
  toggleButtonCompact: {
    paddingHorizontal: ms(2),
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    textAlign: 'center',
  },
  toggleTextCompact: {
    fontSize: ms(11),
  },
  estimatorCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: ms(12),
    marginBottom: vs(16),
  },
  estimatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  estimatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: vs(4),
  },
  estimatorDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: vs(8),
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterBtn: {
    padding: ms(2),
  },
  counterVal: {
    marginHorizontal: ms(8),
  },
  planCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: ms(16),
    marginBottom: vs(20),
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.border,
  },
  popularPlanCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  currentPlanCard: {
    borderColor: colors.green,
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -vs(10),
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: ms(10),
    paddingVertical: vs(2),
    borderRadius: 12,
  },
  currentPlanBadge: {
    position: 'absolute',
    top: -vs(10),
    alignSelf: 'center',
    backgroundColor: colors.green,
    paddingHorizontal: ms(10),
    paddingVertical: vs(2),
    borderRadius: 12,
  },
  planName: {
    alignSelf: 'center',
    marginTop: vs(6),
  },
  planDesc: {
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: vs(4),
    marginBottom: vs(12),
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  periodText: {
    marginLeft: ms(2),
  },
  additionalFee: {
    alignSelf: 'center',
    marginTop: vs(2),
    marginBottom: vs(12),
  },
  trialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ligthBlue,
    alignSelf: 'center',
    paddingHorizontal: ms(12),
    paddingVertical: vs(4),
    borderRadius: 4,
    marginBottom: vs(12),
  },
  planFeatures: {
    marginVertical: vs(12),
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: vs(4),
  },
  featureIcon: {
    marginRight: ms(8),
  },
  planBtn: {
    height: vs(40),
    borderRadius: 6,
  },
  footerFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vs(10),
  },
  footerItem: {
    flex: 1,
    alignItems: 'center',
    padding: ms(10),
  },
  logoutBtn: {
    padding: ms(4),
  },
});
