import React from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import AppHeader from '../../../components/appHeader';
import {AppText} from '../../../components/AppText';
import {colors} from '../../../constants';
import {ms, scale, vs} from '../../../utils/responsive';
import {ClientItem} from '../../../services/queries/app/client';

const {width: screenWidth} = Dimensions.get('window');

type DetailRow = {
  label: string;
  value?: string | number | boolean | null;
  accent?: 'primary' | 'success';
};

const ClientProfileScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const client: ClientItem | undefined = route.params?.client;
  const isWide = screenWidth >= 700;

  const getValue = (primaryKey: keyof ClientItem, ...fallbackKeys: string[]) => {
    if (!client) return undefined;
    const source = client as Record<string, any>;
    const primaryValue = source[primaryKey as string];
    if (primaryValue !== undefined && primaryValue !== null && primaryValue !== '') {
      return primaryValue;
    }
    for (const key of fallbackKeys) {
      const value = source[key];
      if (value !== undefined && value !== null && value !== '') return value;
    }
    return undefined;
  };

  const displayValue = (value: DetailRow['value']) => {
    if (value === undefined || value === null || value === '') return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };

  const yesNo = (value: any) =>
    value === true || String(value).toLowerCase().startsWith('yes') || String(value) === 'true'
      ? 'Yes'
      : 'No';

  const status = displayValue(
    getValue('status') ||
      (client?.isActive === undefined ? undefined : client.isActive ? 'Active' : 'Inactive'),
  );

  const renderRow = ({label, value, accent}: DetailRow) => (
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

  if (!client) {
    return (
      <View style={styles.container}>
        <AppHeader
          leftIcon="chevron-back"
          onLeftPress={() => navigation.goBack()}
          title="Consignor Profile"
          showNotification={false}
        />
        <View style={styles.emptyState}>
          <AppText title="Client details are not available." fontySize="px16" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        leftIcon="chevron-back"
        onLeftPress={() => navigation.goBack()}
        title="Consignor Profile"
        showNotification={false}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.grid, isWide && styles.wideGrid]}>
          {renderCard('Personal Details', [
            {label: 'First Name', value: getValue('firstName')},
            {label: 'Last Name', value: getValue('lastName')},
            {label: 'Email Address', value: getValue('email'), accent: 'primary'},
            {label: 'Phone Number', value: getValue('phone')},
            {label: 'Cell Phone', value: getValue('cellPhone')},
            {label: 'Alternate Email', value: getValue('alternateEmail')},
            {label: 'Company', value: getValue('companyLink', 'company')},
          ])}

          {renderCard('Home Address', [
            {label: 'Address', value: getValue('homeAddress')},
            {label: 'City', value: getValue('homeCity')},
            {label: 'State', value: getValue('homeState')},
            {label: 'Zip Code', value: getValue('homeZipCode')},
          ])}

          {renderCard('Property Address', [
            {label: 'Address', value: getValue('propertyAddress')},
            {label: 'City', value: getValue('propertyCity')},
            {label: 'State', value: getValue('propertyState')},
            {label: 'Zip Code', value: getValue('propertyZipCode')},
            {label: 'Property Type', value: getValue('propertyType')},
          ])}

          {renderCard('Account Settings', [
            {label: 'Account Status', value: status, accent: status === 'Active' ? 'success' : undefined},
            {label: 'Bidder Registration', value: yesNo(getValue('alsoBiddersAdd'))},
            {label: 'Online Access', value: getValue('onlineAccess')},
            {label: 'Access Link', value: getValue('accessLink')},
          ])}

          {/* {renderCard('Fees & Notes', [
            {label: 'Commission', value: getValue('commissionCheckValue', 'commission')},
            {label: 'Pickup Fees', value: getValue('pickupFessValue', 'pickupFees')},
            {label: 'Other Fees', value: getValue('otherFeesValue', 'otherFees')},
            {label: 'Alternate Contacts', value: getValue('alternateContacts')},
            {label: 'Payment Notes', value: getValue('paymentNotes')},
          ])} */}
        </View>
      </ScrollView>
    </View>
  );
};

export default ClientProfileScreen;

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
    shadowOffset: {width: 0, height: 2},
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: scale(6),
    paddingHorizontal: ms(10),
    paddingVertical: vs(7),
    backgroundColor: colors.white,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: ms(20),
  },
});
