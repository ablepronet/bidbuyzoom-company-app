import React from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import moment from 'moment';

import AppHeader from '../../../components/appHeader';
import { AppText } from '../../../components/AppText';
import { colors } from '../../../constants';
import { ms, scale, vs } from '../../../utils/responsive';
import { BidderItem } from '../../../services/queries/app/bidders';

const { width: screenWidth } = Dimensions.get('window');

type DetailRow = {
  label: string;
  value?: string | number | boolean | null;
  accent?: 'primary' | 'success';
};

const BidderProfileScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const bidder: BidderItem | undefined = route.params?.bidder;
  const isWide = screenWidth >= 700;

  const getValue = (primaryKey: keyof BidderItem, ...fallbackKeys: string[]) => {
    if (!bidder) return undefined;
    const source = bidder as Record<string, any>;
    const cleanValue = (val: any) => {
      if (val === undefined || val === null || val === 'undefined' || val === 'null' || val === '') {
        return undefined;
      }
      return val;
    };
    const primaryValue = cleanValue(source[primaryKey as string]);
    if (primaryValue !== undefined) return primaryValue;
    for (const key of fallbackKeys) {
      const value = cleanValue(source[key]);
      if (value !== undefined) return value;
    }
    return undefined;
  };

  const displayValue = (value: DetailRow['value']) => {
    if (value === undefined || value === null || value === '') return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };

  const displayDate = (value: any) => {
    if (value === undefined || value === null || value === '' || value === 'undefined' || value === 'null') {
      return undefined;
    }
    const parsed = moment(value);
    return parsed.isValid() ? parsed.format('MMM DD, YYYY') : String(value);
  };

  const displayList = (value: any) => {
    if (Array.isArray(value)) return value.filter(Boolean).join(', ');
    return value;
  };

  const accountStatus = displayValue(
    bidder?.isActive === undefined
      ? getValue('status')
      : bidder.isActive
        ? 'Active'
        : 'Inactive',
  );

  const renderRow = ({ label, value, accent }: DetailRow) => (
    <View style={styles.detailRow} key={label}>
      <AppText
        title={`${label}:`}
        style={styles.detailLabel}
        fontySize="px12"
        fontFamily="bold"
        color="textSecondary"
      />
      <AppText
        title={displayValue(value)}
        style={StyleSheet.flatten([
          styles.detailValue,
          accent === 'primary' && styles.primaryValue,
          accent === 'success' && styles.successValue,
        ])}
        fontySize="px12"
        color="textPrimary"
      />
    </View>
  );

  const renderCard = (title: string, rows: DetailRow[]) => (
    <View style={[styles.card, isWide && styles.wideCard]} key={title}>
      <View style={styles.sectionTitleWrap}>
        <AppText
          title={title}
          fontySize="px14"
          fontFamily="bold"
          color="primary"
          style={styles.sectionTitle}
        />
      </View>
      <View style={styles.rowsWrap}>{rows.map(renderRow)}</View>
    </View>
  );

  if (!bidder) {
    return (
      <View style={styles.container}>
        <AppHeader
          leftIcon="chevron-back"
          onLeftPress={() => navigation.goBack()}
          title="Bidder Profile"
          showNotification={false}
        />
        <View style={styles.emptyState}>
          <AppText title="Bidder details are not available." fontySize="px16" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        leftIcon="chevron-back"
        onLeftPress={() => navigation.goBack()}
        title="Bidder Profile"
        showNotification={false}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.grid, isWide && styles.wideGrid]}>
          {renderCard('Personal Details', [
            { label: 'First Name', value: getValue('firstName') },
            { label: 'Last Name', value: getValue('lastName') },
            { label: 'Company Name', value: getValue('biddersCompanyName') },
            { label: 'Email Address', value: getValue('email'), accent: 'primary' },
            { label: 'Phone Number', value: getValue('phone') },
            { label: 'Cell Phone', value: getValue('cellPhone') },
          ])}

          {renderCard('Address & Preferences', [
            { label: 'Address', value: getValue('address') },
            { label: 'City', value: getValue('city') },
            { label: 'State', value: getValue('state') },
            { label: 'Zip Code', value: getValue('zipCode') },
            { label: 'Areas of Interest', value: getValue('areasOfInterest') },
            { label: 'Notification Options', value: displayList(getValue('notificationOption')) },
          ])}

          {renderCard('Account Settings', [
            { label: 'Registration Date', value: displayDate(getValue('date', 'createdAt')) },
            { label: 'Account Status', value: accountStatus, accent: accountStatus === 'Active' ? 'success' : undefined },
            { label: 'ID Code Status', value: getValue('approval', 'idCodeStatus', 'idCode') },
            { label: 'Reason', value: getValue('reason', 'approvalReason', 'blockReason') },
            { label: 'Sales Tax Exempt', value: getValue('salesTaxExempt') },
            { label: 'Also a Consignor', value: getValue('alsoClientAdd', 'alsoConsignor') },
          ])}
        </View>
      </ScrollView>
    </View>
  );
};

export default BidderProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: ms(16),
    paddingBottom: vs(30),
  },
  grid: {
    gap: vs(14),
  },
  wideGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: ms(16),
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: scale(8),
    paddingHorizontal: ms(14),
    paddingTop: vs(14),
    paddingBottom: vs(12),
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  wideCard: {
    width: '48%',
    minHeight: vs(170),
  },
  sectionTitleWrap: {
    alignSelf: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingBottom: vs(6),
    marginBottom: vs(12),
  },
  sectionTitle: {
    lineHeight: vs(18),
  },
  rowsWrap: {
    gap: vs(2),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    paddingVertical: vs(8),
    gap: ms(12),
  },
  detailLabel: {
    flex: 0.45,
    lineHeight: vs(17),
  },
  detailValue: {
    flex: 0.55,
    lineHeight: vs(17),
    textAlign: 'right',
  },
  primaryValue: {
    color: colors.primary,
  },
  successValue: {
    color: colors.green,
    fontFamily: 'Aeonik-Bold',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: ms(20),
  },
});
