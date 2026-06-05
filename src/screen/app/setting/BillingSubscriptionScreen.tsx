import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Clipboard, Dimensions } from 'react-native';
import AppHeader from '../../../components/appHeader';
import { AppText } from '../../../components/AppText';
import Card from '../../../components/Card';
import AppButton from '../../../components/appButton';
import { colors } from '../../../constants';
import { ms, vs } from '../../../utils/responsive';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AppToast from '../../../components/toaster';
import { useGetBillingSummary, useGetPaymentCards } from '../../../services/queries/app/plans/plans';
import { useGetUserProfile } from '../../../services/queries/app/Profile';
import Loader from '../../../components/loader';
import { routes } from '../../../navigation/route';
import moment from 'moment';

const { width } = Dimensions.get('window');

const BillingSubscriptionScreen = () => {
  const navigation = useNavigation<any>();

  // Fetch API Queries
  const { data: profileData, isLoading: isProfileLoading } = useGetUserProfile();
  const { data: billingData, isLoading: isBillingLoading } = useGetBillingSummary();
  const { data: cardsData, isLoading: isCardsLoading } = useGetPaymentCards();

  const userData = profileData?.datas || null;
  const companySlug = userData?.companySlug || 'company-te';

  // Find default or first card to display card branding
  const activeCard = useMemo(() => {
    if (!cardsData?.data || cardsData.data.length === 0) return null;
    return cardsData.data.find(c => c.isDefault) || cardsData.data[0];
  }, [cardsData]);

  // Navigate to native plans screen to change plan
  const handleChangePlan = useCallback(() => {
    navigation.navigate(routes.plansScreen);
  }, [navigation]);

  // Navigate to edit company card
  const handleManageCard = useCallback(() => {
    navigation.navigate(routes.manageCardsScreen);
  }, [navigation]);

  // Copy helper
  const handleCopy = useCallback((text: string, label: string) => {
    if (!text) return;
    try {
      Clipboard.setString(text);
      AppToast.success(`${label} copied successfully!`);
    } catch {
      AppToast.success(`Copied: ${text}`);
    }
  }, []);

  const isLoading = isProfileLoading || isBillingLoading || isCardsLoading;

  if (isLoading) {
    return <Loader isLoading={isLoading} />;
  }

  const subscription = billingData || null;
  const currentPlan = subscription?.currentPlan || null;

  return (
    <View style={styles.container}>
      <AppHeader
        leftIcon="chevron-back"
        onLeftPress={() => navigation.goBack()}
        title="Billing & Subscription"
        showBorder={false}
        showNotification={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Current Plan Section */}
        <View style={styles.sectionHeaderRow}>
          <AppText title="Current Plan" fontySize="px16" fontFamily="bold" color="textPrimary" />
          <TouchableOpacity style={styles.changePlanBtn} onPress={handleChangePlan}>
            <Icon name="swap-horizontal-outline" size={ms(14)} color={colors.primary} />
            <AppText title="Change Plan" fontySize="px12" fontFamily="bold" color="primary" marginLeft={4} />
          </TouchableOpacity>
        </View>

        <AppText
          title="This is the platform subscription charged by BidBuyZoom."
          fontySize="px12"
          fontFamily="regular"
          color="textSecondary"
          marginBottom={vs(10)}
          marginTop={vs(5)}
        />

        <View style={styles.cardColumn}>
          <Card style={styles.planCardFull}>
            <View style={styles.cardHeaderIcon}>
              <Icon name="pricetag-outline" size={ms(20)} color={colors.primary} />
            </View>
            <View style={styles.cardHeaderContent}>
              <AppText title="PLAN" fontySize="px10" fontFamily="bold" color="textSecondary" />
              <AppText title={currentPlan?.name || 'No plan selected'} fontySize="px16" fontFamily="bold" color="textPrimary" marginTop={vs(6)} />
              <AppText title={`$${currentPlan?.amount || '0.00'} ${currentPlan?.period?.toLowerCase() || ''}`} fontySize="px14" color="primary" fontFamily="bold" marginTop={vs(4)} />
            </View>
          </Card>

          <Card style={styles.planCardFull}>
            <View style={styles.cardHeaderIcon}>
              <Icon name="card-outline" size={ms(20)} color={colors.primary} />
            </View>
            <View style={styles.cardHeaderContent}>
              <AppText title="PAYMENT METHOD" fontySize="px10" fontFamily="bold" color="textSecondary" />
              <AppText
                title={activeCard ? 'Card connected' : 'No card connected'}
                fontySize="px16"
                fontFamily="bold"
                color="textPrimary"
                marginTop={vs(6)}
              />
              <AppText title="Used for plan renewals." fontySize="px12" color="textSecondary" marginTop={vs(4)} />
            </View>
          </Card>
        </View>

        {/* Billing Timeline Section */}
        <AppText title="Billing Timeline" fontySize="px16" fontFamily="bold" color="textPrimary" marginTop={vs(20)} />
        <AppText
          title="Key dates for your subscription lifecycle."
          fontySize="px12"
          fontFamily="regular"
          color="textSecondary"
          marginBottom={vs(15)}
          marginTop={vs(6)}
        />

        <Card style={styles.timelineCard}>
          {/* Visual Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarLine} />
            <View style={styles.progressBarActiveLine} />
            <View style={[styles.progressBarDot, styles.dotActive]} />
            <View style={[styles.progressBarDot, styles.dotActive, { left: '50%' }]} />
            <View style={[styles.progressBarDot, { right: 0 }]} />
          </View>

          <View style={styles.timelineRow}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineIconBg}>
                <Icon name="time-outline" size={ms(16)} color={colors.primary} />
              </View>
              <AppText title="LAST CHARGE" fontySize="px10" fontFamily="bold" color="textSecondary" marginTop={6} />
              <AppText
                title={subscription?.lastBillingDate ? moment(subscription.lastBillingDate).format('MMM D, YYYY') : '-'}
                fontySize="px12"
                fontFamily="bold"
                color="textPrimary"
                marginTop={4}
              />
            </View>

            <View style={styles.timelineItem}>
              <View style={styles.timelineIconBg}>
                <Icon name="sync-outline" size={ms(16)} color={colors.primary} />
              </View>
              <AppText title="NEXT RENEWAL" fontySize="px10" fontFamily="bold" color="textSecondary" marginTop={6} />
              <AppText
                title={subscription?.nextBillingDate ? moment(subscription.nextBillingDate).format('MMM D, YYYY') : '-'}
                fontySize="px12"
                fontFamily="bold"
                color="textPrimary"
                marginTop={4}
              />
            </View>

            <View style={styles.timelineItem}>
              <View style={styles.timelineIconBg}>
                <Icon name="hourglass-outline" size={ms(16)} color={colors.primary} />
              </View>
              <AppText title="TRIAL ENDS" fontySize="px10" fontFamily="bold" color="textSecondary" marginTop={6} />
              <AppText
                title={subscription?.isOnTrial && subscription?.trialEndDate ? moment(subscription.trialEndDate).format('MMM D, YYYY') : '-'}
                fontySize="px12"
                fontFamily="bold"
                color="textPrimary"
                marginTop={4}
              />
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <AppText title="Quick Actions" fontySize="px16" fontFamily="bold" color="textPrimary" marginTop={vs(20)} />
        <AppText
          title="Manage your billing settings."
          fontySize="px12"
          fontFamily="regular"
          color="textSecondary"
          marginBottom={vs(10)}
          marginTop={vs(6)}
        />

        <Card style={styles.actionCard}>
          <TouchableOpacity style={styles.actionItem} onPress={handleManageCard}>
            <View style={styles.actionLeft}>
              <View style={styles.actionIconBg}>
                <Icon name="card-outline" size={ms(16)} color={colors.textPrimary} />
              </View>
              <AppText title="Manage Company Card" fontySize="px14" fontFamily="medium" color="textPrimary" />
            </View>
            <Icon name="chevron-forward" size={ms(18)} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionItem} onPress={handleChangePlan}>
            <View style={styles.actionLeft}>
              <View style={styles.actionIconBg}>
                <Icon name="list-outline" size={ms(16)} color={colors.textPrimary} />
              </View>
              <AppText title="View Plans" fontySize="px14" fontFamily="medium" color="textPrimary" />
            </View>
            <Icon name="chevron-forward" size={ms(18)} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* Payment References Section */}
        <AppText title="Payment References" fontySize="px16" fontFamily="bold" color="textPrimary" marginTop={vs(20)} />
        <AppText
          title="For support and Stripe reconciliation."
          fontySize="px12"
          fontFamily="regular"
          color="textSecondary"
          marginBottom={vs(10)}
          marginTop={vs(6)}
        />

        <Card style={styles.referencesCard}>
          {/* Customer ID */}
          <View style={styles.referenceItem}>
            <View style={styles.refLeft}>
              <Icon name="person-outline" size={ms(16)} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <AppText title="Customer" fontySize="px12" color="textSecondary" />
            </View>
            <TouchableOpacity
              style={styles.refRight}
              onPress={() => handleCopy(subscription?.stripeCustomerId || '', 'Customer ID')}
              disabled={!subscription?.stripeCustomerId}
            >
              <AppText
                title={subscription?.stripeCustomerId || '-'}
                fontySize="px12"
                fontFamily="medium"
                color={subscription?.stripeCustomerId ? "textPrimary" : "textSecondary"}
                numberOfLines={1}
                style={styles.refValueText}
              />
              {subscription?.stripeCustomerId ? (
                <Icon name="copy-outline" size={ms(14)} color={colors.primary} style={{ marginLeft: 6 }} />
              ) : null}
            </TouchableOpacity>
          </View>

          <View style={styles.refDivider} />

          {/* Payment Method */}
          <View style={styles.referenceItem}>
            <View style={styles.refLeft}>
              <Icon name="card-outline" size={ms(16)} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <AppText title="Payment Method" fontySize="px12" color="textSecondary" />
            </View>
            <TouchableOpacity
              style={styles.refRight}
              onPress={() => handleCopy(subscription?.stripePaymentMethodId || '', 'Payment Method ID')}
              disabled={!subscription?.stripePaymentMethodId}
            >
              <AppText
                title={subscription?.stripePaymentMethodId || '-'}
                fontySize="px12"
                fontFamily="medium"
                color={subscription?.stripePaymentMethodId ? "textPrimary" : "textSecondary"}
                numberOfLines={1}
                style={styles.refValueText}
              />
              {subscription?.stripePaymentMethodId ? (
                <Icon name="copy-outline" size={ms(14)} color={colors.primary} style={{ marginLeft: 6 }} />
              ) : null}
            </TouchableOpacity>
          </View>

          <View style={styles.refDivider} />

          {/* Subscription ID */}
          <View style={styles.referenceItem}>
            <View style={styles.refLeft}>
              <Icon name="git-commit-outline" size={ms(16)} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <AppText title="Subscription" fontySize="px12" color="textSecondary" />
            </View>
            <TouchableOpacity
              style={styles.refRight}
              onPress={() => handleCopy(subscription?.stripeSubscriptionId || '', 'Subscription ID')}
              disabled={!subscription?.stripeSubscriptionId}
            >
              <AppText
                title={subscription?.stripeSubscriptionId || '-'}
                fontySize="px12"
                fontFamily="medium"
                color={subscription?.stripeSubscriptionId ? "textPrimary" : "textSecondary"}
                numberOfLines={1}
                style={styles.refValueText}
              />
              {subscription?.stripeSubscriptionId ? (
                <Icon name="copy-outline" size={ms(14)} color={colors.primary} style={{ marginLeft: 6 }} />
              ) : null}
            </TouchableOpacity>
          </View>

          <View style={styles.refDivider} />

          {/* Last Payment Intent */}
          <View style={styles.referenceItem}>
            <View style={styles.refLeft}>
              <Icon name="receipt-outline" size={ms(16)} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <AppText title="Last Payment" fontySize="px12" color="textSecondary" />
            </View>
            <TouchableOpacity
              style={styles.refRight}
              onPress={() => handleCopy(subscription?.lastPlanPaymentIntentId || '', 'Payment ID')}
              disabled={!subscription?.lastPlanPaymentIntentId}
            >
              <AppText
                title={subscription?.lastPlanPaymentIntentId || '-'}
                fontySize="px12"
                fontFamily="medium"
                color={subscription?.lastPlanPaymentIntentId ? "textPrimary" : "textSecondary"}
                numberOfLines={1}
                style={styles.refValueText}
              />
              {subscription?.lastPlanPaymentIntentId ? (
                <Icon name="copy-outline" size={ms(14)} color={colors.primary} style={{ marginLeft: 6 }} />
              ) : null}
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

export default BillingSubscriptionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  scrollContent: {
    paddingHorizontal: ms(16),
    paddingBottom: vs(40),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: vs(15),
  },
  changePlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: ms(8),
    paddingVertical: vs(4),
    backgroundColor: colors.white,
  },
  cardColumn: {
    gap: vs(12),
  },
  planCardFull: {
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingVertical: vs(16),
    paddingHorizontal: ms(16),
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeaderIcon: {
    width: ms(40),
    height: ms(40),
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ms(16),
    marginTop: vs(2),
  },
  cardHeaderContent: {
    flex: 1,
  },
  timelineCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: ms(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  progressBarContainer: {
    height: vs(4),
    width: '100%',
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    position: 'relative',
    marginBottom: vs(16),
  },
  progressBarLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#E5E7EB',
  },
  progressBarActiveLine: {
    position: 'absolute',
    left: 0,
    width: '50%',
    top: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  progressBarDot: {
    width: ms(10),
    height: ms(10),
    borderRadius: 5,
    backgroundColor: '#D1D5DB',
    position: 'absolute',
    top: -vs(3),
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineItem: {
    alignItems: 'center',
    flex: 1,
  },
  timelineIconBg: {
    width: ms(28),
    height: ms(28),
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vs(12),
    paddingHorizontal: ms(16),
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconBg: {
    width: ms(28),
    height: ms(28),
    borderRadius: 6,
    backgroundColor: colors.lightBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ms(12),
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: ms(16),
  },
  referencesCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: ms(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  referenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vs(8),
  },
  refLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    marginLeft: ms(16),
  },
  refValueText: {
    flexShrink: 1,
    textAlign: 'right',
  },
  refDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
});
