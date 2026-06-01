import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AppHeader from '../../../components/appHeader';
import { AppText } from '../../../components/AppText';
import Loader from '../../../components/loader';
import AppToast from '../../../components/toaster';
import { colors } from '../../../constants';
import { routes } from '../../../navigation/route';
import { ms, scale, vs } from '../../../utils/responsive';
import {
  DefaultSetting,
  useGetDefaultSetting,
} from '../../../services/queries/app/sales/useGetDefaultSetting';
import { useSaveSaleSetting } from '../../../services/queries/app/sales/useAddSaleFlow';
import {
  SalesListingItem,
  useGetSalesListing,
} from '../../../services/queries/app/sales/useGetSalesListing';

type Mode = 'Default' | 'Other';

type SettingField = {
  key: string;
  label: string;
  valueKey: string;
  payloadModeKey: string;
  payloadValueKey?: string;
  defaultValue?: string;
  suffix?: string;
  multiline?: boolean;
};

const modeOptions: Mode[] = ['Default', 'Other'];
const paymentOptions = [
  'Credit Card',
  'Debit Card',
  'Checks',
  'Wire Transfer',
  'Money Orders',
  'Pay Pal',
  'Other',
];

const topFields: SettingField[] = [
  {
    key: 'commission',
    label: 'Commission',
    valueKey: 'commission',
    payloadModeKey: 'commission',
    payloadValueKey: 'commissionValue',
    suffix: '%',
  },
  {
    key: 'minCommission',
    label: 'Min. Commission',
    valueKey: 'minCommission',
    payloadModeKey: 'minCommission',
    payloadValueKey: 'minCommissionValue',
    suffix: '$',
  },
  {
    key: 'buyerPremium',
    label: 'Buyer Premium',
    valueKey: 'buyerPremium',
    payloadModeKey: 'buyerPremium',
    payloadValueKey: 'buyerPremiumValue',
    suffix: '%',
  },
  {
    key: 'saleTax',
    label: 'Sale Tax',
    valueKey: 'saleTax',
    payloadModeKey: 'saleTax',
    payloadValueKey: 'saleTaxValue',
    suffix: '%',
  },
  {
    key: 'creditCardFees',
    label: 'Credit Card Fees',
    valueKey: 'creditCardFees',
    payloadModeKey: 'creditCardFess',
    payloadValueKey: 'creditCardFessValue',
    suffix: '%',
  },
  {
    key: 'buyBackSurcharge',
    label: 'Buyback Surcharge',
    valueKey: 'buyBackSurcharge',
    payloadModeKey: 'buypackSurchargeDefault',
    payloadValueKey: 'buypackSurchargeValue',
    suffix: '%',
  },
  {
    key: 'internationalBidder',
    label: 'International Bidder',
    valueKey: 'internationalBidder',
    payloadModeKey: 'internationalBiddersDefault',
  },
  {
    key: 'bidHistory',
    label: 'Bid History',
    valueKey: 'bidHistory',
    payloadModeKey: 'bidHistoryDefault',
    payloadValueKey: 'bidHistory',
  },
  {
    key: 'phone',
    label: 'Phone',
    valueKey: 'defaultPhoneNo',
    payloadModeKey: 'defaultPhone',
    payloadValueKey: 'phone',
  },
  {
    key: 'email',
    label: 'Email',
    valueKey: 'defaultEmail',
    payloadModeKey: 'defaultEmail',
    payloadValueKey: 'email',
  },
  {
    key: 'bidderApprovel',
    label: 'Bidder Approval',
    valueKey: 'bidderApprovel',
    payloadModeKey: 'defaultBidderApprovel',
    payloadValueKey: 'bidderApprovel',
  },
  {
    key: 'requireBidApprovalAmount',
    label: 'Require Manual Approval Over $',
    valueKey: 'requireBidApprovalAmount',
    payloadModeKey: 'defaultRequireBidApprovalAmount',
    payloadValueKey: 'requireBidApprovalAmount',
  },
];

const locationFields: SettingField[] = [
  {
    key: 'location',
    label: 'Location',
    valueKey: 'isLocation',
    payloadModeKey: 'isLocation',
  },
  {
    key: 'address',
    label: 'Address',
    valueKey: 'defaultAddress',
    payloadModeKey: 'defaultAddressMode',
    payloadValueKey: 'defaultAddress',
  },
  {
    key: 'state',
    label: 'State',
    valueKey: 'defaultState',
    payloadModeKey: 'defaultStateMode',
    payloadValueKey: 'defaultState',
  },
  {
    key: 'city',
    label: 'City',
    valueKey: 'defaultCity',
    payloadModeKey: 'defaultCityMode',
    payloadValueKey: 'defaultCity',
  },
  {
    key: 'zipCode',
    label: 'Zipcode',
    valueKey: 'defaultZipCode',
    payloadModeKey: 'defaultZipCodeMode',
    payloadValueKey: 'defaultZipCode',
  },
  {
    key: 'staggered',
    label: 'Staggered',
    valueKey: 'stagerredMin',
    payloadModeKey: 'straggeredEndingDefault',
  },
  {
    key: 'staggeredSec',
    label: 'Sec',
    valueKey: 'stagerredSec',
    payloadModeKey: 'straggeredSecDefault',
    payloadValueKey: 'stagerredSec',
  },
  {
    key: 'extensionMin',
    label: 'Extension Min',
    valueKey: 'extensionMin',
    payloadModeKey: 'bidExtensionDefault',
    payloadValueKey: 'extensionMin',
  },
  {
    key: 'extensionLastMin',
    label: 'Extension Last Min',
    valueKey: 'extensionLastMin',
    payloadModeKey: 'extensionLastMinDefault',
    payloadValueKey: 'extensionLastMin',
  },
];

const textFields: SettingField[] = [
  {
    key: 'terms',
    label: 'Terms',
    valueKey: 'terms',
    payloadModeKey: 'termsDefault',
    payloadValueKey: 'terms',
    multiline: true,
  },
  {
    key: 'description',
    label: 'Description',
    valueKey: 'description',
    payloadModeKey: 'descriptionDefault',
    payloadValueKey: 'description',
    multiline: true,
  },
  {
    key: 'paymentDescription',
    label: 'Payment',
    valueKey: 'paymentDescription',
    payloadModeKey: 'paymentDescriptionDefault',
    payloadValueKey: 'paymentDescription',
    multiline: true,
  },
  {
    key: 'viewingDescription',
    label: 'Viewing',
    valueKey: 'viewwingDescription',
    payloadModeKey: 'viewwingDescriptionDefault',
    payloadValueKey: 'viewwingDescription',
    multiline: true,
  },
  {
    key: 'pickupDescription',
    label: 'Pickup',
    valueKey: 'pickupDescription',
    payloadModeKey: 'pickupDescriptionDefault',
    payloadValueKey: 'pickupDescription',
    multiline: true,
  },
  {
    key: 'shippingDescription',
    label: 'Shipping',
    valueKey: 'shippingDescription',
    payloadModeKey: 'shippingDescriptionDefault',
    payloadValueKey: 'shippingDescription',
    multiline: true,
  },
  {
    key: 'withCompanySale',
    label: 'Bidder Registers with Company / Sale',
    valueKey: 'withCompanySale',
    payloadModeKey: 'withCompanySale',
    defaultValue: 'Default',
  },
];

const allFields = [...topFields, ...locationFields, ...textFields];

const toPayloadMode = (mode: Mode) => mode.toLowerCase();

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, '').trim();

const stringifySettingValue = (
  settings: DefaultSetting | undefined,
  field: SettingField,
) => {
  const value = settings?.[field.valueKey as keyof DefaultSetting];

  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    return field.key === 'terms' ? stripHtml(value) : value;
  }

  return field.defaultValue || '';
};

const AddSaleSettingsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const saleId = route.params?.saleId;
  const selectedSale = route.params?.selectedSale || null;
  const { data, isLoading, isError } = useGetDefaultSetting();
  const {
    data: salesListingData,
    refetch: refetchSalesListing,
    isFetching: isSalesListingFetching,
  } = useGetSalesListing();
  const saveSaleSettingMutation = useSaveSaleSetting();
  const settings: DefaultSetting | undefined = data?.datas;
  const [modes, setModes] = useState<Record<string, Mode>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [paymentValues, setPaymentValues] = useState<string[]>([]);
  const [selectKey, setSelectKey] = useState<string | null>(null);
  const [receiveCompany, setReceiveCompany] = useState(false);
  const [receiveSale, setReceiveSale] = useState(false);

  useEffect(() => {
    if (!settings) return;

    const nextModes: Record<string, Mode> = {};
    const nextValues: Record<string, string> = {};

    allFields.forEach(field => {
      nextModes[field.key] = 'Default';
      nextValues[field.key] = stringifySettingValue(settings, field);
    });
    nextModes.paymentOption = 'Default';

    setModes(nextModes);
    setValues(nextValues);
    setPaymentValues(settings.paymentOption || []);
    setReceiveCompany(Boolean(settings.isReceiveCompany));
    setReceiveSale(Boolean(settings.isReceiveSale));
  }, [settings]);

  const increments = useMemo(
    () => settings?.variedCommissionIncrements || [],
    [settings?.variedCommissionIncrements],
  );

  const selectField = allFields.find(field => field.key === selectKey);

  const updateMode = (key: string, mode: Mode) => {
    setModes(prev => ({ ...prev, [key]: mode }));

    if (mode === 'Default') {
      const field = allFields.find(item => item.key === key);
      if (field) {
        setValues(prev => ({
          ...prev,
          [key]: stringifySettingValue(settings, field),
        }));
      }
    }

    setSelectKey(null);
  };

  const togglePayment = (option: string) => {
    setPaymentValues(prev =>
      prev.includes(option)
        ? prev.filter(item => item !== option)
        : [...prev, option],
    );
  };

  const buildPayload = () => {
    const payload: Record<string, any> = {
      saleId,
      paymentOption: paymentValues,
      paymentOptionDefault: toPayloadMode(modes.paymentOption || 'Default'),
      restrictBiddersstate: settings?.restrictBiddersState || [],
      variedCommission: settings?.variedCommission || [],
      variedCommissionIncrements: increments.map(item => ({
        from: item.from,
        to: item.to,
        increments: item.increments,
        defaultFrom: item.defaultFrom ?? null,
        defaultTo: item.defaultTo ?? null,
        defaultIncrements: item.defaultIncrements ?? null,
      })),
      variedDefaultValue:
        settings?.variedCommissionDefaultCheck === 'Yes' ? 'default' : 'other',
      commissionIncrementsDefault: 'default',
      defaultBiddersState: 'default',
      straggeredEndingDefault: toPayloadMode(modes.staggered || 'Default'),
      bidExtensionDefault: toPayloadMode(modes.extensionMin || 'Default'),
      isLocation: toPayloadMode(modes.location || 'Default'),
      withCompanySale: toPayloadMode(modes.withCompanySale || 'Default'),
      defaultAddress: values.address || '',
      defaultState: values.state || '',
      defaultCity: values.city || '',
      defaultZipCode: values.zipCode || '',
      internationalBidders: values.internationalBidder || '',
      phone: values.phone || '',
      email: values.email || '',
      bidderApprovel: values.bidderApprovel || '',
      requireBidApprovalAmount: Number(values.requireBidApprovalAmount || 0),
      bidHistory: values.bidHistory || '',
      terms: values.terms || '',
      description: values.description || '',
      paymentDescription: values.paymentDescription || '',
      viewwingDescription: values.viewingDescription || '',
      pickupDescription: values.pickupDescription || '',
      shippingDescription: values.shippingDescription || '',
      isReceiveCompany: receiveCompany,
      isReceiveSale: receiveSale,
    };

    allFields.forEach(field => {
      payload[field.payloadModeKey] = toPayloadMode(
        modes[field.key] || 'Default',
      );
      if (field.payloadValueKey) {
        payload[field.payloadValueKey] = values[field.key] || '';
      }
    });

    return payload;
  };

  const handleSubmit = async () => {
    if (!saleId) {
      AppToast.error('Sale id is missing');
      return;
    }

    const response = await saveSaleSettingMutation.mutateAsync({
      payload: buildPayload(),
    });

    AppToast.success(response?.message || 'Sale settings saved successfully');

    const latestSalesResponse = await refetchSalesListing();
    const sales =
      latestSalesResponse.data?.data || salesListingData?.data || [];
    const latestSale = sales.find(
      (item: SalesListingItem) =>
        item._id === saleId || item.saleId === saleId,
    );
    const nextSale = latestSale || selectedSale;
    const nextSaleId = nextSale?._id || nextSale?.saleId || saleId;

    if (nextSale?.templateId) {
      navigation.navigate(routes.saleHubScreen, {
        saleId: nextSaleId,
        selectedSale: {
          ...nextSale,
          saleId: nextSaleId,
          templateId: nextSale.templateId,
        },
        fromAddSaleFlow: true,
      });
      return;
    }
    navigation.navigate(routes.addSaleTemplateScreen, {
      saleId: nextSaleId,
      selectedSale: nextSale,
    });
  };

  const renderField = (field: SettingField) => {
    const mode = modes[field.key] || 'Default';
    const isEditable = mode === 'Other';

    return (
      <View key={field.key} style={styles.fieldCard}>
        <View style={styles.fieldHeader}>
          <AppText title={field.label} fontySize="px12" fontFamily="medium" />
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.modeButton}
            onPress={() => setSelectKey(field.key)}>
            <AppText title={mode} fontySize="px12" color="textPrimary" />
          </TouchableOpacity>
        </View>
        <View style={styles.inputRow}>
          <TextInput
            value={values[field.key] || ''}
            editable={isEditable}
            multiline={field.multiline}
            onChangeText={text =>
              setValues(prev => ({ ...prev, [field.key]: text }))
            }
            placeholder={field.label}
            placeholderTextColor={colors.textSecondary}
            style={[
              styles.input,
              field.multiline && styles.textArea,
              !isEditable && styles.disabledInput,
            ]}
          />
          {field.suffix ? (
            <View style={styles.suffixBox}>
              <AppText title={field.suffix} fontySize="px12" />
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  const renderPaymentOption = (option: string) => {
    const selected = paymentValues.includes(option);

    return (
      <TouchableOpacity
        key={option}
        activeOpacity={0.8}
        style={styles.checkboxRow}
        onPress={() => togglePayment(option)}>
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected ? (
            <Icon name="checkmark" size={ms(13)} color={colors.white} />
          ) : null}
        </View>
        <AppText title={option} fontySize="px12" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        leftIcon="chevron-back"
        onLeftPress={() => navigation.goBack()}
        title="Settings"
        showBorder={false}
      />

      <Loader
        isLoading={
          isLoading ||
          saveSaleSettingMutation.isPending ||
          isSalesListingFetching
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {isError ? (
          <View style={styles.emptyBox}>
            <AppText
              title="Unable to load default settings"
              color="error"
              fontySize="px14"
              fontFamily="medium"
            />
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeaderContainer}>
            <Icon name="hammer-outline" size={ms(16)} color={colors.primary} />
            <AppText
              title="General Fees & Commissions"
              fontySize="px14"
              fontFamily="bold"
              marginLeft={ms(8)}
            />
          </View>
          {topFields.slice(0, 8).map(renderField)}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderContainer}>
            <Icon name="hammer-outline" size={ms(16)} color={colors.primary} />
            <AppText
              title="Bidder Management"
              fontySize="px14"
              fontFamily="bold"
              marginLeft={ms(8)}
            />
          </View>
          {topFields.slice(8).map(renderField)}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderContainer}>
            <Icon name="hammer-outline" size={ms(16)} color={colors.primary} />
            <AppText
              title="Advanced Commissions & Increments"
              fontySize="px14"
              fontFamily="bold"
              marginLeft={ms(8)}
            />
          </View>
          {increments.map((item, index) => (
            <View key={item._id || String(index)} style={styles.incrementRow}>
              <TextInput
                value={String(item.from ?? '')}
                editable={false}
                style={[styles.incrementInput, styles.disabledInput]}
              />
              <TextInput
                value={String(item.to ?? '')}
                editable={false}
                style={[styles.incrementInput, styles.disabledInput]}
              />
              <TextInput
                value={String(item.increments ?? '')}
                editable={false}
                style={[styles.incrementInput, styles.disabledInput]}
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <AppText
            title="Terms and Description"
            fontySize="px18"
            fontFamily="bold"
            marginBottom={vs(12)}
          />
          {textFields.slice(0, 2).map(renderField)}
        </View>

        <View style={styles.section}>
          <View style={styles.fieldHeader}>
            <AppText
              title="Payment Accepted"
              fontySize="px12"
              fontFamily="medium"
            />
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.modeButton}
              onPress={() => setSelectKey('paymentOption')}>
              <AppText
                title={modes.paymentOption || 'Default'}
                fontySize="px12"
                color="textPrimary"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.paymentGrid}>
            {paymentOptions.map(renderPaymentOption)}
          </View>
          {locationFields.map(renderField)}
          {textFields.slice(2).map(renderField)}

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.checkboxRow}
            onPress={() => setReceiveCompany(prev => !prev)}>
            <View
              style={[
                styles.checkbox,
                receiveCompany && styles.checkboxSelected,
              ]}>
              {receiveCompany ? (
                <Icon name="checkmark" size={ms(13)} color={colors.white} />
              ) : null}
            </View>
            <AppText
              title="Receive Email when Bidder Registers with Company"
              fontySize="px12"
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.checkboxRow}
            onPress={() => setReceiveSale(prev => !prev)}>
            <View
              style={[styles.checkbox, receiveSale && styles.checkboxSelected]}>
              {receiveSale ? (
                <Icon name="checkmark" size={ms(13)} color={colors.white} />
              ) : null}
            </View>
            <AppText
              title="Receive Email when Bidder Registers for Sale"
              fontySize="px12"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={saveSaleSettingMutation.isPending}
          style={styles.submitButton}
          onPress={handleSubmit}>
          <AppText
            title={saveSaleSettingMutation.isPending ? 'Please wait...' : 'Submit'}
            fontySize="px14"
            fontFamily="bold"
            color="textLight"
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={!!selectKey}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectKey(null)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectKey(null)}>
          <Pressable style={styles.optionSheet}>
            <AppText
              title={selectField?.label || 'Select'}
              fontySize="px18"
              fontFamily="bold"
              marginBottom={vs(12)}
            />
            {modeOptions.map(option => (
              <TouchableOpacity
                key={option}
                activeOpacity={0.8}
                style={styles.optionRow}
                onPress={() => selectKey && updateMode(selectKey, option)}>
                <AppText title={option} fontySize="px14" />
                {selectKey && modes[selectKey] === option ? (
                  <AppText title="Selected" fontySize="px12" color="primary" />
                ) : null}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default AddSaleSettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  content: {
    padding: ms(14),
    paddingBottom: vs(104),
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: ms(8),
    borderWidth: 1,
    borderColor: colors.border,
    padding: ms(12),
    marginBottom: vs(14),
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  fieldCard: {
    marginBottom: vs(12),
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(6),
    gap: scale(10),
  },
  modeButton: {
    minWidth: scale(92),
    minHeight: vs(34),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: ms(5),
    justifyContent: 'center',
    paddingHorizontal: scale(10),
    backgroundColor: colors.white,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  input: {
    flex: 1,
    minHeight: vs(44),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: ms(5),
    color: colors.textPrimary,
    paddingHorizontal: scale(10),
    paddingVertical: vs(8),
    backgroundColor: colors.white,
  },
  textArea: {
    minHeight: vs(105),
    textAlignVertical: 'top',
  },
  disabledInput: {
    backgroundColor: '#E8EBEF',
    color: colors.textSecondary,
  },
  suffixBox: {
    width: scale(44),
    marginLeft: scale(8),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: ms(5),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8EBEF',
  },
  incrementRow: {
    flexDirection: 'row',
    gap: scale(8),
    marginBottom: vs(8),
  },
  incrementInput: {
    flex: 1,
    minHeight: vs(40),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: ms(5),
    paddingHorizontal: scale(10),
    color: colors.textPrimary,
  },
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: vs(12),
  },
  checkboxRow: {
    minWidth: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(10),
    paddingRight: scale(8),
  },
  checkbox: {
    width: ms(18),
    height: ms(18),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: ms(3),
    marginRight: scale(8),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  emptyBox: {
    padding: ms(14),
    backgroundColor: colors.white,
    borderRadius: ms(8),
    marginBottom: vs(14),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  optionSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: ms(18),
    borderTopRightRadius: ms(18),
    padding: ms(18),
  },
  optionRow: {
    minHeight: vs(46),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: ms(14),
    paddingTop: vs(12),
    paddingBottom: vs(18),
    alignItems: 'flex-end',
  },
  submitButton: {
    minWidth: scale(150),
    minHeight: vs(52),
    borderRadius: ms(8),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(18),
  },
});
