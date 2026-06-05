import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Switch, ActivityIndicator } from 'react-native';
import AppHeader from '../../../components/appHeader';
import { AppText } from '../../../components/AppText';
import AppButton from '../../../components/appButton';
import Card from '../../../components/Card';
import { colors } from '../../../constants';
import { ms, vs } from '../../../utils/responsive';
import Icon from 'react-native-vector-icons/Ionicons';
import { useGetUserProfile } from '../../../services/queries/app/Profile';
import { useToggle2FA, useToggleSmsSettings } from '../../../services/queries/app/Profile/smsSecurity';
import { useNavigation } from '@react-navigation/native';

const SmsSecurityScreen = () => {
  const navigation = useNavigation();
  const { data: profileData, isLoading: isProfileLoading } = useGetUserProfile();
  const toggle2FAMutation = useToggle2FA();
  const toggleSmsSettingsMutation = useToggleSmsSettings();

  // Local States
  const [isSmsEnabled, setIsSmsEnabled] = useState(false);
  const [outbid, setOutbid] = useState(false);
  const [wonLot, setWonLot] = useState(false);
  const [invoiceReady, setInvoiceReady] = useState(false);
  const [paymentConfirmation, setPaymentConfirmation] = useState(false);
  const [auctionReminder, setAuctionReminder] = useState(false);

  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [is2FAForBidders, setIs2FAForBidders] = useState(false);

  // Sync with initial profile data
  useEffect(() => {
    if (profileData?.datas) {
      const datas = profileData.datas;
      setIsSmsEnabled(!!datas.isSmsEnabled);
      setOutbid(!!datas.smsNotificationTypes?.outbid);
      setWonLot(!!datas.smsNotificationTypes?.wonLot);
      setInvoiceReady(!!datas.smsNotificationTypes?.invoiceReady);
      setPaymentConfirmation(!!datas.smsNotificationTypes?.paymentConfirmation);
      setAuctionReminder(!!datas.smsNotificationTypes?.auctionReminder);

      setIs2FAEnabled(!!datas.is2FAEnabled);
      setIs2FAForBidders(!!datas.is2FAForBidders);
    }
  }, [profileData]);

  const handleSaveSmsSettings = () => {
    toggleSmsSettingsMutation.mutate({
      isSmsEnabled,
      smsNotificationTypes: {
        outbid,
        wonLot,
        invoiceReady,
        paymentConfirmation,
        auctionReminder,
      },
    });
  };

  const handleSaveSecuritySettings = () => {
    toggle2FAMutation.mutate({
      is2FAEnabled,
      is2FAForBidders,
    });
  };

  if (isProfileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        leftIcon="chevron-back"
        onLeftPress={() => navigation.goBack()}
        title="SMS & Security"
        showBorder={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AppText
          title="SMS & Security"
          fontySize="px18"
          fontFamily="bold"
          color="textPrimary"
          style={styles.screenTitle}
        />
        <AppText
          title="Manage SMS notifications and two-factor authentication for your company."
          fontySize="px14"
          fontFamily="regular"
          color="textSecondary"
          style={styles.screenSubtitle}
        />

        {/* SMS Notifications Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="chatbubble-ellipses-outline" size={ms(20)} color={colors.textPrimary} style={styles.cardIcon} />
            <AppText
              title="SMS Notifications"
              fontySize="px14"
              fontFamily="bold"
              color="textPrimary"
            />
          </View>

          {/* Enable SMS Row */}
          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <AppText
                title="Enable SMS Notifications"
                fontySize="px14"
                fontFamily="medium"
                color="textPrimary"
              />
              <AppText
                title="Allow SMS/text notifications to be sent to your bidders via Twilio."
                fontySize="px12"
                fontFamily="regular"
                color="textSecondary"
                marginTop={vs(2)}
              />
            </View>
            <Switch
              value={isSmsEnabled}
              onValueChange={setIsSmsEnabled}
              trackColor={{ false: colors.softGray, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Choose SMS notification types section */}
          <AppText
            title="Choose which notification types to send via SMS:"
            fontySize="px12"
            fontFamily="medium"
            color="textSecondary"
            style={styles.chooseTitle}
          />

          <View style={styles.notificationGrid}>
            {/* Column 1 */}
            <View style={styles.gridColumn}>
              {/* Outbid Alerts */}
              <View style={styles.gridItem}>
                <Switch
                  value={outbid}
                  onValueChange={setOutbid}
                  disabled={!isSmsEnabled}
                  trackColor={{ false: colors.softGray, true: colors.primary }}
                  thumbColor={colors.white}
                  style={styles.gridSwitch}
                />
                <View style={styles.gridTextContainer}>
                  <AppText
                    title="Outbid Alerts"
                    fontySize="px12"
                    fontFamily="medium"
                    color="textPrimary"
                  />
                  <AppText
                    title="Notify bidders when outbid"
                    fontySize="px10"
                    fontFamily="regular"
                    color="textSecondary"
                    marginTop={vs(1)}
                  />
                </View>
              </View>

              {/* Invoice Ready */}
              <View style={styles.gridItem}>
                <Switch
                  value={invoiceReady}
                  onValueChange={setInvoiceReady}
                  disabled={!isSmsEnabled}
                  trackColor={{ false: colors.softGray, true: colors.primary }}
                  thumbColor={colors.white}
                  style={styles.gridSwitch}
                />
                <View style={styles.gridTextContainer}>
                  <AppText
                    title="Invoice Ready"
                    fontySize="px12"
                    fontFamily="medium"
                    color="textPrimary"
                  />
                  <AppText
                    title="Notify bidders when invoice is available"
                    fontySize="px10"
                    fontFamily="regular"
                    color="textSecondary"
                    marginTop={vs(1)}
                  />
                </View>
              </View>

              {/* Auction Reminders */}
              <View style={styles.gridItem}>
                <Switch
                  value={auctionReminder}
                  onValueChange={setAuctionReminder}
                  disabled={!isSmsEnabled}
                  trackColor={{ false: colors.softGray, true: colors.primary }}
                  thumbColor={colors.white}
                  style={styles.gridSwitch}
                />
                <View style={styles.gridTextContainer}>
                  <AppText
                    title="Auction Reminders"
                    fontySize="px12"
                    fontFamily="medium"
                    color="textPrimary"
                  />
                  <AppText
                    title="Send bidders reminders before auctions"
                    fontySize="px10"
                    fontFamily="regular"
                    color="textSecondary"
                    marginTop={vs(1)}
                  />
                </View>
              </View>
            </View>

            {/* Column 2 */}
            <View style={styles.gridColumn}>
              {/* Won Lot */}
              <View style={styles.gridItem}>
                <Switch
                  value={wonLot}
                  onValueChange={setWonLot}
                  disabled={!isSmsEnabled}
                  trackColor={{ false: colors.softGray, true: colors.primary }}
                  thumbColor={colors.white}
                  style={styles.gridSwitch}
                />
                <View style={styles.gridTextContainer}>
                  <AppText
                    title="Won Lot"
                    fontySize="px12"
                    fontFamily="medium"
                    color="textPrimary"
                  />
                  <AppText
                    title="Notify bidders when they win a lot"
                    fontySize="px10"
                    fontFamily="regular"
                    color="textSecondary"
                    marginTop={vs(1)}
                  />
                </View>
              </View>

              {/* Payment Confirmation */}
              <View style={styles.gridItem}>
                <Switch
                  value={paymentConfirmation}
                  onValueChange={setPaymentConfirmation}
                  disabled={!isSmsEnabled}
                  trackColor={{ false: colors.softGray, true: colors.primary }}
                  thumbColor={colors.white}
                  style={styles.gridSwitch}
                />
                <View style={styles.gridTextContainer}>
                  <AppText
                    title="Payment Confirmation"
                    fontySize="px12"
                    fontFamily="medium"
                    color="textPrimary"
                  />
                  <AppText
                    title="Notify bidders when payment is processed"
                    fontySize="px10"
                    fontFamily="regular"
                    color="textSecondary"
                    marginTop={vs(1)}
                  />
                </View>
              </View>
            </View>
          </View>

          <AppButton
            title="Save SMS Settings"
            onPress={handleSaveSmsSettings}
            loading={toggleSmsSettingsMutation.isPending}
            bgColor="primary"
            style={styles.saveButton}
          />
        </Card>

        {/* Two-Factor Authentication Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="shield-checkmark-outline" size={ms(20)} color={colors.textPrimary} style={styles.cardIcon} />
            <AppText
              title="Two-Factor Authentication"
              fontySize="px14"
              fontFamily="bold"
              color="textPrimary"
            />
          </View>

          {/* Enable 2FA for Admin */}
          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <AppText
                title="Enable 2FA for Admin Login"
                fontySize="px14"
                fontFamily="medium"
                color="textPrimary"
              />
              <AppText
                title="Require a verification code sent to your phone when logging in as admin."
                fontySize="px12"
                fontFamily="regular"
                color="textSecondary"
                marginTop={vs(2)}
              />
            </View>
            <Switch
              value={is2FAEnabled}
              onValueChange={setIs2FAEnabled}
              trackColor={{ false: colors.softGray, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.divider} />

          {/* Require 2FA for Bidders */}
          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <AppText
                title="Require 2FA for Bidders"
                fontySize="px14"
                fontFamily="medium"
                color="textPrimary"
              />
              <AppText
                title="Require bidders to verify via SMS when logging in to your auctions."
                fontySize="px12"
                fontFamily="regular"
                color="textSecondary"
                marginTop={vs(2)}
              />
            </View>
            <Switch
              value={is2FAForBidders}
              onValueChange={setIs2FAForBidders}
              trackColor={{ false: colors.softGray, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <AppButton
            title="Save Security Settings"
            onPress={handleSaveSecuritySettings}
            loading={toggle2FAMutation.isPending}
            bgColor="primary"
            style={styles.saveButton}
          />
        </Card>
      </ScrollView>
    </View>
  );
};

export default SmsSecurityScreen;

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
  screenTitle: {
    marginTop: vs(15),
  },
  screenSubtitle: {
    marginTop: vs(4),
    marginBottom: vs(15),
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: ms(16),
    marginBottom: vs(16),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(16),
  },
  cardIcon: {
    marginRight: ms(8),
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vs(8),
  },
  switchTextContainer: {
    flex: 1,
    marginRight: ms(16),
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: vs(12),
  },
  chooseTitle: {
    marginBottom: vs(12),
  },
  notificationGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vs(12),
  },
  gridColumn: {
    flex: 1,
    marginRight: ms(8),
  },
  gridItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: vs(16),
  },
  gridSwitch: {
    marginRight: ms(8),
    marginTop: vs(2),
    transform: [{ scale: 0.85 }],
  },
  gridTextContainer: {
    flex: 1,
  },
  saveButton: {
    marginTop: vs(10),
    borderRadius: 6,
    height: vs(40),
    backgroundColor: colors.primary,
  },
});
