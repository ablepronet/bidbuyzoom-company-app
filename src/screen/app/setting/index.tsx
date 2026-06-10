import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import AppHeader from '../../../components/appHeader';
import { AppText } from '../../../components/AppText';
import { colors } from '../../../constants';
import { ms, vs } from '../../../utils/responsive';
import Icon from 'react-native-vector-icons/Ionicons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import Card from '../../../components/Card';
import { useGetUserProfile } from '../../../services/queries/app/Profile';
import { routes } from '../../../navigation/route';

const Setting = () => {
  const navigation = useNavigation<any>();
  const { data } = useGetUserProfile();
  const userData = data?.datas || null;
  const companySlug = userData?.companySlug || 'company-te';

  const handleOpenDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleNavigation = (title: string, path: string) => {
    if (path === 'profile') {
      navigation.navigate(routes.profileScreen);
      return;
    }
    if (path === 'sms-security') {
      navigation.navigate(routes.smsSecurityScreen);
      return;
    }
    if (path === 'card-payment') {
      navigation.navigate(routes.billingSubscriptionScreen);
      return;
    }
    if (path === 'staff') {
      navigation.navigate(routes.staffScreen);
      return;
    }
    // if (path === 'card-payment/details') {
    //   navigation.navigate(routes.manageCardsScreen);
    //   return;
    // }
    navigation.navigate(routes.commonWebView, {
      title: title,
      url: `https://staging.bidbuyzoom.com/${companySlug}/${path}?mobile=true`,
    });

    console.log('path:', title)
  };

  const SettingItem = ({
    icon,
    title,
    path,
    showArrow = true,
  }: {
    icon: string;
    title: string;
    path: string;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={() => handleNavigation(title, path)}>
      <View style={styles.itemLeft}>
        <View style={styles.iconWrapper}>
          <Icon name={icon} size={ms(18)} color={colors.textPrimary} />
        </View>
        <AppText
          title={title}
          fontySize="px14"
          fontFamily="medium"
          color="textPrimary"
        />
      </View>
      {showArrow && (
        <Icon
          name="chevron-forward"
          size={ms(18)}
          color={colors.textSecondary}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Company Section */}
        <AppText
          title="Company"
          fontySize="px12"
          fontFamily="bold"
          color="textSecondary"
          style={styles.sectionTitle}
        />
        <Card style={styles.sectionCard}>
          <SettingItem icon="person-outline" title="Profile" path="profile" />
          <View style={styles.divider} />
          <SettingItem
            icon="options-outline"
            title="Default Setting"
            path="default-setting"
          />
          <View style={styles.divider} />
          <SettingItem icon="people-outline" title="Staff" path="staff" />
          <View style={styles.divider} />
          <SettingItem
            icon="card-outline"
            title="Payment Setting"
            path="card-payment/details"
          />
          <View style={styles.divider} />
          {/* <SettingItem icon="pricetag-outline" title="Plan" path="plans" /> */}
          <View style={styles.divider} />
          <SettingItem
            icon="card-outline"
            title="Billing & Subscription"
            path="card-payment"
          />
          <View style={styles.divider} />
          <SettingItem
            icon="shield-checkmark-outline"
            title="SMS & Security"
            path="sms-security"
          />
        </Card>

        {/* Notifications Section */}
        <AppText
          title="Notifications"
          fontySize="px12"
          fontFamily="bold"
          color="textSecondary"
          style={styles.sectionTitle}
        />
        <Card style={styles.sectionCard}>
          <SettingItem icon="mail-outline" title="Email" path="email" />
          <View style={styles.divider} />
          <SettingItem icon="chatbubble-outline" title="SMS" path="sms" />
        </Card>
      </ScrollView>
    </View>
  );
};

export default Setting;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  scrollContent: {
    paddingHorizontal: ms(15),
    paddingBottom: vs(30),
  },
  sectionTitle: {
    textTransform: 'uppercase',
    marginBottom: vs(8),
    marginTop: vs(15),
    marginLeft: ms(5),
  },
  sectionCard: {
    padding: 0,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vs(15),
    paddingHorizontal: ms(15),
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: ms(32),
    height: ms(32),
    borderRadius: 8,
    backgroundColor: colors.lightBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ms(12),
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: ms(15),
  },
});
