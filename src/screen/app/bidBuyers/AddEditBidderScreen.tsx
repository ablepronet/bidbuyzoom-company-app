import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  Modal,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/Ionicons';
import State from 'country-state-city/lib/state';
import moment from 'moment';
import { pick, types } from '@react-native-documents/picker';

import AppHeader from '../../../components/appHeader';
import { AppText } from '../../../components/AppText';
import { AppInput } from '../../../components/AppInput';
import AppCheckbox from '../../../components/AppCheckbox';
import AppButton from '../../../components/appButton';
import Loader from '../../../components/loader';
import { colors } from '../../../constants';
import { ms, scale, vs } from '../../../utils/responsive';
import { useAddBidder, useUpdateBidder, BidderItem } from '../../../services/queries/app/bidders';
import AppDateTimePickerModal from '../../../components/AppDateTimePickerModal';
import GooglePlaceAutoComplete, { GooglePlaceResult } from '../../../components/GooglePlaceAutoComplete';
import AppToast from '../../../components/toaster';

interface FormState {
  date: string;
  type: string;
  approval: string;
  status: string;
  firstName: string;
  lastName: string;
  biddersCompanyName: string;
  phone: string;
  cellPhone: string;
  email: string;
  address: string;
  state: string;
  city: string;
  zipCode: string;
  buyerPremiumCheck: boolean;
  buyerPremiumValue: string;
  creditCardCheck: boolean;
  creditCardValue: string;
  areasOfInterest: string;
  salesTaxExempt: string;
  salesTaxValue: string;
  salesTaxState: string;
  alsoClientAdd: string;
  notes: string;
  emailNotification: boolean;
  textNotification: boolean;
}

interface SelectedDocument {
  uri: string;
  name: string;
  type?: string;
  size?: number;
}

const AddEditBidderScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();

  const bidder: BidderItem | undefined = route.params?.bidder;
  const isEditMode = route.params?.mode === 'edit' || !!bidder;

  const getBidderValue = (primaryKey: keyof BidderItem, ...fallbackKeys: string[]) => {
    if (!bidder) return undefined;
    const source = bidder as Record<string, any>;
    const cleanValue = (val: any) => {
      if (val === undefined || val === null || val === 'undefined' || val === 'null') {
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

  const toBoolean = (value: any) => {
    if (value === undefined || value === null || value === 'undefined' || value === 'null') {
      return false;
    }
    return value === true || value === 'true' || value === 'Yes';
  };

  const addBidderMutation = useAddBidder();
  const updateBidderMutation = useUpdateBidder();

  // Initial Form State
  const [form, setForm] = useState<FormState>({
    date: getBidderValue('date') ? moment(getBidderValue('date')).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
    type: getBidderValue('type') || 'Bidders',
    approval: getBidderValue('status') || 'Pending', // using status as approval or default
    status: getBidderValue('status') || 'Active',
    firstName: getBidderValue('firstName') || '',
    lastName: getBidderValue('lastName') || '',
    biddersCompanyName: getBidderValue('biddersCompanyName') || '',
    phone: getBidderValue('phone') || '',
    cellPhone: getBidderValue('cellPhone') || '',
    email: getBidderValue('email') || '',
    address: getBidderValue('address') || '',
    state: getBidderValue('state') || '',
    city: getBidderValue('city') || '',
    zipCode: getBidderValue('zipCode') || '',
    buyerPremiumCheck: toBoolean(getBidderValue('buyerPremiumCheck')),
    buyerPremiumValue: getBidderValue('buyerPremiumValue', 'buyerPremium') || '',
    creditCardCheck: toBoolean(getBidderValue('creditCardCheck')),
    creditCardValue: getBidderValue('creditCardValue', 'creditCardFees') || '',
    areasOfInterest: getBidderValue('areasOfInterest') || '',
    salesTaxExempt: getBidderValue('salesTaxExempt') || 'No',
    salesTaxValue: getBidderValue('salesTaxValue') || '',
    salesTaxState: getBidderValue('salesTaxState') || '',
    alsoClientAdd: getBidderValue('alsoClientAdd') || 'No',
    notes: getBidderValue('notes') || '',
    emailNotification: bidder ? bidder.notificationOption?.includes('Email') ?? false : false,
    textNotification: bidder ? bidder.notificationOption?.includes('Text') ?? false : false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [selectedDocument, setSelectedDocument] = useState<SelectedDocument | null>(null);

  // Sync route params with form state when editing client to handle screen caching in drawer navigator
  useEffect(() => {
    if (isEditMode && bidder) {
      setForm({
        date: getBidderValue('date') ? moment(getBidderValue('date')).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
        type: getBidderValue('type') || 'Bidders',
        approval: getBidderValue('status') || 'Pending',
        status: getBidderValue('status') || 'Active',
        firstName: getBidderValue('firstName') || '',
        lastName: getBidderValue('lastName') || '',
        biddersCompanyName: getBidderValue('biddersCompanyName') || '',
        phone: getBidderValue('phone') || '',
        cellPhone: getBidderValue('cellPhone') || '',
        email: getBidderValue('email') || '',
        address: getBidderValue('address') || '',
        state: getBidderValue('state') || '',
        city: getBidderValue('city') || '',
        zipCode: getBidderValue('zipCode') || '',
        buyerPremiumCheck: toBoolean(getBidderValue('buyerPremiumCheck')),
        buyerPremiumValue: getBidderValue('buyerPremiumValue', 'buyerPremium') || '',
        creditCardCheck: toBoolean(getBidderValue('creditCardCheck')),
        creditCardValue: getBidderValue('creditCardValue', 'creditCardFees') || '',
        areasOfInterest: getBidderValue('areasOfInterest') || '',
        salesTaxExempt: getBidderValue('salesTaxExempt') || 'No',
        salesTaxValue: getBidderValue('salesTaxValue') || '',
        salesTaxState: getBidderValue('salesTaxState') || '',
        alsoClientAdd: getBidderValue('alsoClientAdd') || 'No',
        notes: getBidderValue('notes') || '',
        emailNotification: bidder.notificationOption?.includes('Email') ?? false,
        textNotification: bidder.notificationOption?.includes('Text') ?? false,
      });
      setSelectedDocument(null);
      setErrors({});
      setTouched({});
    } else if (route.params?.mode === 'add') {
      setForm({
        date: moment().format('YYYY-MM-DD'),
        type: 'Bidders',
        approval: 'Pending',
        status: 'Active',
        firstName: '',
        lastName: '',
        biddersCompanyName: '',
        phone: '',
        cellPhone: '',
        email: '',
        address: '',
        state: '',
        city: '',
        zipCode: '',
        buyerPremiumCheck: false,
        buyerPremiumValue: '',
        creditCardCheck: false,
        creditCardValue: '',
        areasOfInterest: '',
        salesTaxExempt: 'No',
        salesTaxValue: '',
        salesTaxState: '',
        alsoClientAdd: 'No',
        notes: '',
        emailNotification: false,
        textNotification: false,
      });
      setSelectedDocument(null);
      setErrors({});
      setTouched({});
    }
  }, [bidder, route.params?.mode]);

  // States & Cities lookups
  const US_STATES = useMemo(() => State.getStatesOfCountry('US') || [], []);
  const usStateOptions = useMemo(() => US_STATES.map(s => s.name), [US_STATES]);

  // Dropdown Modal helper states
  const [pickerMode, setPickerMode] = useState<boolean>(false);
  const [pickerValue, setPickerValue] = useState<Date>(new Date(form.date));

  useEffect(() => {
    if (form.date) {
      setPickerValue(new Date(form.date));
    }
  }, [form.date]);

  const [selectConfig, setSelectConfig] = useState<{
    key: keyof FormState;
    title: string;
    options: string[];
  } | null>(null);

  const updateField = (key: keyof FormState, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.type.trim()) nextErrors.type = 'Type is required';
    if (!form.approval.trim()) nextErrors.approval = 'Approval is required';
    if (!form.firstName.trim()) nextErrors.firstName = 'First Name is required';
    if (!form.lastName.trim()) nextErrors.lastName = 'Last Name is required';
    if (!form.cellPhone.trim()) nextErrors.cellPhone = 'Cell Phone is required';
    if (!form.zipCode.trim()) nextErrors.zipCode = 'Zip Code is required';
    if (form.buyerPremiumCheck && !form.buyerPremiumValue.trim()) {
      nextErrors.buyerPremiumValue = 'Buyer Premium value is required';
    }
    if (form.creditCardCheck && !form.creditCardValue.trim()) {
      nextErrors.creditCardValue = 'Credit Card Fees value is required';
    }
    if (!form.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      nextErrors.email = 'Email is invalid';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    const allTouched = Object.keys(form).reduce((acc, key) => {
      acc[key as keyof FormState] = true;
      return acc;
    }, {} as Record<keyof FormState, boolean>);
    setTouched(allTouched);

    if (!validate()) return;

    const notificationOption: string[] = [];
    if (form.emailNotification) notificationOption.push('Email');
    if (form.textNotification) notificationOption.push('Text');

    const payload = {
      ...form,
      isActive: form.status === 'Active',
      notificationOption,
      documentFile: selectedDocument,
    };

    try {
      if (isEditMode && bidder) {
        await updateBidderMutation.mutateAsync({ id: bidder._id, payload });
      } else {
        await addBidderMutation.mutateAsync(payload);
      }
      navigation.goBack();
    } catch (e) {
      console.log('Submission failed', e);
    }
  };

  const handleDateConfirm = (selectedDate: Date) => {
    setPickerMode(false);
    setPickerValue(selectedDate);
    updateField('date', moment(selectedDate).format('YYYY-MM-DD'));
  };

  const handlePickDocument = async () => {
    try {
      const res = await pick({
        type: [types.allFiles],
        allowMultiSelection: false,
      });
      const file = res[0];

      if (!file?.uri) return;

      setSelectedDocument({
        uri: file.uri,
        name: file.name || 'Selected document',
        type: file.type || 'application/octet-stream',
        size: file.size || undefined,
      });
    } catch (error: any) {
      if (error?.code !== 'DOCUMENT_PICKER_CANCELED') {
        AppToast.error('Unable to select document');
      }
    }
  };

  const renderSelectField = (label: string, fieldKey: keyof FormState, options: string[], placeholder: string = 'Select options') => {
    const val = form[fieldKey] as string;
    return (
      <View style={styles.fieldContainer}>
        <AppText title={label} fontFamily="medium" fontySize="px14" marginBottom={8} />
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.dropdownTrigger}
          onPress={() => {
            Keyboard.dismiss();
            setSelectConfig({
              key: fieldKey,
              title: `Select ${label}`,
              options,
            });
          }}>
          <AppText
            title={val || placeholder}
            fontySize="px16"
            color={val ? 'textPrimary' : 'textSecondary'}
          />
          <Icon name="chevron-down-outline" size={ms(18)} color={colors.textSecondary} />
        </TouchableOpacity>
        {errors[fieldKey] && (
          <AppText title={errors[fieldKey]} color="error" fontySize="px14" marginTop={4} />
        )}
      </View>
    );
  };

  const isPending = addBidderMutation.isPending || updateBidderMutation.isPending;

  return (
    <View style={styles.container}>
      <Loader isLoading={isPending} />
      <AppHeader
        leftIcon="chevron-back"
        onLeftPress={() => navigation.goBack()}
        title={isEditMode ? 'Edit Bidder' : 'Add New Bidders'}
        showBorder={false}
      />
      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableResetScrollToCoords={false}
        extraScrollHeight={50}>
        
        {/* Form Fields */}
        <View style={styles.formSection}>
          
          {/* Date Selector */}
          <View style={styles.fieldContainer}>
            <AppText title="Date" fontFamily="medium" fontySize="px14" marginBottom={8} />
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.dropdownTrigger}
              onPress={() => setPickerMode(true)}>
              <AppText title={moment(form.date).format('MM/DD/YYYY')} fontySize="px16" color="textPrimary" />
              <Icon name="calendar-outline" size={ms(18)} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {renderSelectField('Type', 'type', ['Bidders', 'Buyers'], 'Select Bidders / Buyers')}
          {renderSelectField('Approval', 'approval', ['Automatic', 'Manual', 'Blocked'], 'Select Approval')}
          {renderSelectField('Status', 'status', ['Active', 'Inactive', 'Paid', 'Complete'], 'Select status')}

          <AppInput
            label="First Name"
            required
            placeholder="Enter First Name"
            value={form.firstName}
            onChangeText={t => updateField('firstName', t)}
            error={errors.firstName}
          />

          <AppInput
            label="Last Name"
            required
            placeholder="Enter Last Name"
            value={form.lastName}
            onChangeText={t => updateField('lastName', t)}
            error={errors.lastName}
          />

          <AppInput
            label="Company"
            placeholder="Enter Company"
            value={form.biddersCompanyName}
            onChangeText={t => updateField('biddersCompanyName', t)}
          />

          <AppInput
            label="Phone"
            placeholder="Enter Phone Number"
            value={form.phone}
            onChangeText={t => updateField('phone', t)}
            keyboardType="phone-pad"
          />

          <AppInput
            label="Cell Phone"
            required
            placeholder="Enter Cell Phone Number"
            value={form.cellPhone}
            onChangeText={t => updateField('cellPhone', t)}
            keyboardType="phone-pad"
            error={errors.cellPhone}
          />

          <AppInput
            label="Email"
            required
            placeholder="Enter Email"
            value={form.email}
            onChangeText={t => updateField('email', t)}
            keyboardType="email-address"
            error={errors.email}
          />

          {/* Address Section */}
          <AppText title="Address Details" fontFamily="bold" fontySize="px16" marginTop={vs(12)} marginBottom={vs(8)} color="primary" />
          
          <View style={{ zIndex: 99, position: 'relative', marginBottom: vs(12) }}>
            <AppText title="Address" fontFamily="medium" fontySize="px14" marginBottom={8} />
            <GooglePlaceAutoComplete
              value={form.address}
              onChangeText={t => updateField('address', t)}
              onSelectPlace={(place: GooglePlaceResult) => {
                updateField('address', place.address);
                if (place.state) updateField('state', place.state);
                if (place.city) updateField('city', place.city);
                if (place.zipCode) updateField('zipCode', place.zipCode);
              }}
            />
          </View>

          {renderSelectField('State', 'state', usStateOptions, 'Select State')}

          <AppInput
            label="City"
            placeholder="Enter City"
            value={form.city}
            onChangeText={t => updateField('city', t)}
          />

          <AppInput
            label="Zip code"
            required
            placeholder="Zip code"
            value={form.zipCode}
            onChangeText={t => updateField('zipCode', t)}
            keyboardType="numeric"
            error={errors.zipCode}
          />

          {/* Additional Options */}
          <AppCheckbox
            value={form.buyerPremiumCheck}
            onChange={v => updateField('buyerPremiumCheck', v)}
            label="Buyer Premium"
            containerStyle={{ marginVertical: vs(6) }}
          />
          {form.buyerPremiumCheck && (
            <AppInput
              placeholder="Value"
              value={form.buyerPremiumValue}
              onChangeText={t => updateField('buyerPremiumValue', t)}
              keyboardType="numeric"
              error={errors.buyerPremiumValue}
            />
          )}

          <AppCheckbox
            value={form.creditCardCheck}
            onChange={v => updateField('creditCardCheck', v)}
            label="Credit Card Fees"
            containerStyle={{ marginVertical: vs(6) }}
          />
          {form.creditCardCheck && (
            <AppInput
              placeholder="Value"
              value={form.creditCardValue}
              onChangeText={t => updateField('creditCardValue', t)}
              keyboardType="numeric"
              error={errors.creditCardValue}
            />
          )}

          <AppInput
            label="Areas Of Interest"
            placeholder="Areas of interest"
            value={form.areasOfInterest}
            onChangeText={t => updateField('areasOfInterest', t)}
          />

          {renderSelectField('Sales Tax Exempt', 'salesTaxExempt', ['No', 'Yes'], 'Select Sales Tax Exempt')}

          <AppInput
            label="Sales Tax #"
            placeholder="Sales tax #"
            value={form.salesTaxValue}
            onChangeText={t => updateField('salesTaxValue', t)}
          />

          {renderSelectField('Sales Tax State', 'salesTaxState', usStateOptions, 'Select State')}
          
          {renderSelectField('Also Consignor', 'alsoClientAdd', ['No', 'Yes', 'Yes, Populate Consignor Fields'], 'Select Also Consignor')}

          <AppInput
            label="Notes"
            placeholder="Notes"
            value={form.notes}
            onChangeText={t => updateField('notes', t)}
            multiline
            numberOfLines={4}
            style={styles.textAreaInput}
          />

          <View style={styles.fieldContainer}>
            <AppText title="Documents Uploaded" fontFamily="medium" fontySize="px14" marginBottom={8} />
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.documentPicker}
              onPress={handlePickDocument}>
              <AppText
                title={selectedDocument?.name || 'No file chosen'}
                fontySize="px14"
                color={selectedDocument ? 'textPrimary' : 'textSecondary'}
                numberOfLines={1}
                style={styles.documentName}
              />
              <Icon name="cloud-upload-outline" size={ms(22)} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Notification Options */}
          <AppText title="Notification Options" fontFamily="bold" fontySize="px16" marginTop={vs(12)} marginBottom={vs(8)} color="primary" />
          <View style={styles.checkboxGroup}>
            <AppCheckbox
              value={form.emailNotification}
              onChange={v => updateField('emailNotification', v)}
              label="Email"
              containerStyle={{ marginRight: ms(20) }}
            />
            <AppCheckbox
              value={form.textNotification}
              onChange={v => updateField('textNotification', v)}
              label="Text"
            />
          </View>

        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <AppButton
            title="Cancel"
            onPress={() => navigation.goBack()}
            style={styles.cancelBtn}
            textColor="textSecondary"
            bgColor="white"
            borderColor="border"
            transparent={false}
          />
          <AppButton
            title={isEditMode ? 'Update' : 'Submit'}
            onPress={handleSubmit}
            style={styles.submitBtn}
          />
        </View>

      </KeyboardAwareScrollView>

      <AppDateTimePickerModal
        isVisible={pickerMode}
        mode="date"
        date={pickerValue}
        onConfirm={handleDateConfirm}
        onCancel={() => setPickerMode(false)}
        confirmTextIOS="Confirm"
        cancelTextIOS="Cancel"
      />

      {/* Dropdown Options Bottom Modal */}
      <Modal
        visible={!!selectConfig}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectConfig(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSelectConfig(null)}>
          <Pressable style={styles.optionSheet}>
            <AppText
              title={selectConfig?.title}
              fontySize="px18"
              fontFamily="bold"
              marginBottom={vs(12)}
              color="primary"
            />
            <ScrollView keyboardShouldPersistTaps="handled">
              {selectConfig?.options.map((option, index) => (
                <TouchableOpacity
                  key={`${selectConfig.key}-${option}-${index}`}
                  activeOpacity={0.8}
                  style={styles.optionRow}
                  onPress={() => {
                    updateField(selectConfig.key, option);
                    if (selectConfig.key === 'state') {
                      updateField('city', '');
                    }
                    setSelectConfig(null);
                  }}>
                  <AppText
                    title={option}
                    fontySize="px16"
                    color={form[selectConfig.key] === option ? 'primary' : 'textPrimary'}
                    fontFamily={form[selectConfig.key] === option ? 'bold' : 'regular'}
                  />
                  {form[selectConfig.key] === option && (
                    <Icon name="checkmark" size={ms(20)} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default AddEditBidderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: ms(16),
  },
  formSection: {
    backgroundColor: colors.white,
    borderRadius: scale(8),
    padding: ms(16),
    borderWidth: 1,
    borderColor: colors.border,
  },
  fieldContainer: {
    marginBottom: vs(12),
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: scale(5),
    paddingHorizontal: scale(12),
    height: vs(48),
    backgroundColor: colors.white,
  },
  documentPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: scale(5),
    paddingHorizontal: scale(12),
    minHeight: vs(48),
    backgroundColor: colors.white,
  },
  documentName: {
    flex: 1,
    marginRight: ms(10),
  },
  textAreaInput: {
    minHeight: vs(90),
    textAlignVertical: 'top',
    paddingTop: vs(12),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vs(20),
    marginBottom: vs(10),
  },
  cancelBtn: {
    flex: 1,
    marginRight: ms(8),
  },
  submitBtn: {
    flex: 1,
    marginLeft: ms(8),
    backgroundColor: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  optionSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: scale(16),
    borderTopRightRadius: scale(16),
    maxHeight: vs(400),
    padding: ms(20),
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkboxGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: vs(6),
  },
});
