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

import AppHeader from '../../../components/appHeader';
import { AppText } from '../../../components/AppText';
import { AppInput } from '../../../components/AppInput';
import AppCheckbox from '../../../components/AppCheckbox';
import AppButton from '../../../components/appButton';
import Loader from '../../../components/loader';
import { colors } from '../../../constants';
import { ms, scale, vs } from '../../../utils/responsive';
import { useAddClient, useUpdateClient, ClientItem } from '../../../services/queries/app/client';
import AppDateTimePickerModal from '../../../components/AppDateTimePickerModal';
import GooglePlaceAutoComplete, { GooglePlaceResult } from '../../../components/GooglePlaceAutoComplete';

interface FormState {
  date: string;
  type: string;
  idCode: string;
  status: string;
  firstName: string;
  lastName: string;
  companyLink: string;
  phone: string;
  cellPhone: string;
  email: string;
  alternateEmail: string;
  homeAddress: string;
  homeState: string;
  homeCity: string;
  homeZipCode: string;
  sameAsAddress: boolean;
  propertyAddress: string;
  propertyState: string;
  propertyCity: string;
  propertyZipCode: string;
  propertyType: string;
  alternateContacts: string;
  paymentNotes: string;
  commissionCheck: boolean;
  commissionCheckValue: string;
  pickupFessCheck: boolean;
  pickupFessValue: string;
  other: boolean;
  otherFeesValue: string;
  onlineAccess: string;
  accessLink: string;
  alsoBiddersAdd: string;
}

const AddEditClientScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();

  const client: ClientItem | undefined = route.params?.client;
  const isEditMode = route.params?.mode === 'edit' || !!client;
  const getClientValue = (primaryKey: keyof ClientItem, ...fallbackKeys: string[]) => {
    if (!client) return undefined;
    const source = client as Record<string, any>;
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

  const addClientMutation = useAddClient();
  const updateClientMutation = useUpdateClient();

  // Initial Form State
  const [form, setForm] = useState<FormState>({
    date: getClientValue('date') ? moment(getClientValue('date')).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
    type: getClientValue('type') || 'Consignors',
    idCode: getClientValue('idCode') || '',
    status: getClientValue('status') || (client?.isActive === false ? 'Inactive' : 'Active'),
    firstName: getClientValue('firstName') || '',
    lastName: getClientValue('lastName') || '',
    companyLink: getClientValue('companyLink', 'company') || '',
    phone: getClientValue('phone') || '',
    cellPhone: getClientValue('cellPhone') || '',
    email: getClientValue('email') || '',
    alternateEmail: getClientValue('alternateEmail') || '',
    homeAddress: getClientValue('homeAddress') || '',
    homeState: getClientValue('homeState') || '',
    homeCity: getClientValue('homeCity') || '',
    homeZipCode: getClientValue('homeZipCode') || '',
    sameAsAddress: client ? getClientValue('homeAddress') === getClientValue('propertyAddress') && !!getClientValue('homeAddress') : false,
    propertyAddress: getClientValue('propertyAddress') || '',
    propertyState: getClientValue('propertyState') || '',
    propertyCity: getClientValue('propertyCity') || '',
    propertyZipCode: getClientValue('propertyZipCode') || '',
    propertyType: getClientValue('propertyType') || '',
    alternateContacts: getClientValue('alternateContacts') || '',
    paymentNotes: getClientValue('paymentNotes') || '',
    commissionCheck: toBoolean(getClientValue('commissionCheck')) || !!getClientValue('commissionCheckValue', 'commission'),
    commissionCheckValue: getClientValue('commissionCheckValue', 'commission') || '',
    pickupFessCheck: toBoolean(getClientValue('pickupFessCheck')) || !!getClientValue('pickupFessValue', 'pickupFees'),
    pickupFessValue: getClientValue('pickupFessValue', 'pickupFees') || '',
    other: toBoolean(getClientValue('other')) || !!getClientValue('otherFeesValue', 'otherFees'),
    otherFeesValue: getClientValue('otherFeesValue', 'otherFees') || '',
    onlineAccess: getClientValue('onlineAccess') || '',
    accessLink: getClientValue('accessLink') || '',
    alsoBiddersAdd: getClientValue('alsoBiddersAdd') || 'No',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});

  // Sync route params with form state when editing client to handle screen caching in drawer navigator
  useEffect(() => {
    if (isEditMode && client) {
      setForm({
        date: getClientValue('date') ? moment(getClientValue('date')).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
        type: getClientValue('type') || 'Consignors',
        idCode: getClientValue('idCode') || '',
        status: getClientValue('status') || (client?.isActive === false ? 'Inactive' : 'Active'),
        firstName: getClientValue('firstName') || '',
        lastName: getClientValue('lastName') || '',
        companyLink: getClientValue('companyLink', 'company') || '',
        phone: getClientValue('phone') || '',
        cellPhone: getClientValue('cellPhone') || '',
        email: getClientValue('email') || '',
        alternateEmail: getClientValue('alternateEmail') || '',
        homeAddress: getClientValue('homeAddress') || '',
        homeState: getClientValue('homeState') || '',
        homeCity: getClientValue('homeCity') || '',
        homeZipCode: getClientValue('homeZipCode') || '',
        sameAsAddress: getClientValue('homeAddress') === getClientValue('propertyAddress') && !!getClientValue('homeAddress'),
        propertyAddress: getClientValue('propertyAddress') || '',
        propertyState: getClientValue('propertyState') || '',
        propertyCity: getClientValue('propertyCity') || '',
        propertyZipCode: getClientValue('propertyZipCode') || '',
        propertyType: getClientValue('propertyType') || '',
        alternateContacts: getClientValue('alternateContacts') || '',
        paymentNotes: getClientValue('paymentNotes') || '',
        commissionCheck: toBoolean(getClientValue('commissionCheck')) || !!getClientValue('commissionCheckValue', 'commission'),
        commissionCheckValue: getClientValue('commissionCheckValue', 'commission') || '',
        pickupFessCheck: toBoolean(getClientValue('pickupFessCheck')) || !!getClientValue('pickupFessValue', 'pickupFees'),
        pickupFessValue: getClientValue('pickupFessValue', 'pickupFees') || '',
        other: toBoolean(getClientValue('other')) || !!getClientValue('otherFeesValue', 'otherFees'),
        otherFeesValue: getClientValue('otherFeesValue', 'otherFees') || '',
        onlineAccess: getClientValue('onlineAccess') || '',
        accessLink: getClientValue('accessLink') || '',
        alsoBiddersAdd: getClientValue('alsoBiddersAdd') || 'No',
      });
      setErrors({});
      setTouched({});
    } else if (route.params?.mode === 'add') {
      setForm({
        date: moment().format('YYYY-MM-DD'),
        type: 'Consignors',
        idCode: '',
        status: 'Active',
        firstName: '',
        lastName: '',
        companyLink: '',
        phone: '',
        cellPhone: '',
        email: '',
        alternateEmail: '',
        homeAddress: '',
        homeState: '',
        homeCity: '',
        homeZipCode: '',
        sameAsAddress: false,
        propertyAddress: '',
        propertyState: '',
        propertyCity: '',
        propertyZipCode: '',
        propertyType: '',
        alternateContacts: '',
        paymentNotes: '',
        commissionCheck: false,
        commissionCheckValue: '',
        pickupFessCheck: false,
        pickupFessValue: '',
        other: false,
        otherFeesValue: '',
        onlineAccess: '',
        accessLink: '',
        alsoBiddersAdd: 'No',
      });
      setErrors({});
      setTouched({});
    }
  }, [client, route.params?.mode]);

  // States & Cities lookups
  const US_STATES = useMemo(() => State.getStatesOfCountry('US'), []);

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

  // Sync Same As Address
  useEffect(() => {
    if (form.sameAsAddress) {
      setForm(prev => ({
        ...prev,
        propertyAddress: prev.homeAddress,
        propertyState: prev.homeState,
        propertyCity: prev.homeCity,
        propertyZipCode: prev.homeZipCode,
      }));
    }
  }, [form.sameAsAddress, form.homeAddress, form.homeState, form.homeCity, form.homeZipCode]);

  const updateField = (key: keyof FormState, value: any) => {
    setForm(prev => {
      const updated = { ...prev, [key]: value };
      if (key === 'sameAsAddress' && value === false) {
        updated.propertyAddress = '';
        updated.propertyState = '';
        updated.propertyCity = '';
        updated.propertyZipCode = '';
      }
      return updated;
    });

    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.idCode.trim()) nextErrors.idCode = 'Consignor Code is required';
    if (!form.firstName.trim()) nextErrors.firstName = 'First Name is required';
    if (!form.lastName.trim()) nextErrors.lastName = 'Last Name is required';
    if (!form.cellPhone.trim()) nextErrors.cellPhone = 'Cell Phone is required';
    if (!form.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      nextErrors.email = 'Email is invalid';
    }

    if (form.commissionCheck && !form.commissionCheckValue.trim()) {
      nextErrors.commissionCheckValue = 'Commission value is required';
    }
    if (form.pickupFessCheck && !form.pickupFessValue.trim()) {
      nextErrors.pickupFessValue = 'Pickup fee value is required';
    }
    if (form.other && !form.otherFeesValue.trim()) {
      nextErrors.otherFeesValue = 'Other fees value is required';
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

    const payload = {
      ...form,
      isActive: form.status === 'Active',
    };

    try {
      if (isEditMode && client) {
        await updateClientMutation.mutateAsync({ id: client._id, payload });
      } else {
        await addClientMutation.mutateAsync(payload);
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

  const isPending = addClientMutation.isPending || updateClientMutation.isPending;

  return (
    <View style={styles.container}>
      <Loader isLoading={isPending} />
      <AppHeader
        leftIcon="chevron-back"
        onLeftPress={() => navigation.goBack()}
        title={isEditMode ? 'Edit Client' : 'Add New Client'}
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

          {renderSelectField('Type', 'type', ['Consignors', 'Clients'])}

          <AppInput
            label="Consignor Code"
            required
            placeholder="Enter Consignor Code"
            value={form.idCode}
            onChangeText={t => updateField('idCode', t)}
            error={errors.idCode}
          />

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
            value={form.companyLink}
            onChangeText={t => updateField('companyLink', t)}
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

          <AppInput
            label="Alternate Email"
            placeholder="Enter Alternate Email"
            value={form.alternateEmail}
            onChangeText={t => updateField('alternateEmail', t)}
            keyboardType="email-address"
          />

          {/* Home Address Section */}
          <AppText title="Home Address" fontFamily="bold" fontySize="px16" marginTop={vs(12)} marginBottom={vs(8)} color="primary" />

          <View style={{ zIndex: 99, position: 'relative', marginBottom: vs(12) }}>
            <AppText title="Address" fontFamily="medium" fontySize="px14" marginBottom={8} />
            <GooglePlaceAutoComplete
              value={form.homeAddress}
              onChangeText={t => updateField('homeAddress', t)}
              onSelectPlace={(place: GooglePlaceResult) => {
                updateField('homeAddress', place.address);
                if (place.state) updateField('homeState', place.state);
                if (place.city) updateField('homeCity', place.city);
                if (place.zipCode) updateField('homeZipCode', place.zipCode);
              }}
            />
          </View>

          {renderSelectField('State', 'homeState', usStateOptions, 'Select State')}

          <AppInput
            label="City"
            placeholder="Enter City"
            value={form.homeCity}
            onChangeText={t => updateField('homeCity', t)}
          />

          <AppInput
            label="Zip code"
            placeholder="Zip code"
            value={form.homeZipCode}
            onChangeText={t => updateField('homeZipCode', t)}
            keyboardType="numeric"
          />

          {/* Same as address checkbox */}
          <AppCheckbox
            value={form.sameAsAddress}
            onChange={v => updateField('sameAsAddress', v)}
            label="Same as address above"
            containerStyle={{ marginVertical: vs(12) }}
          />

          {/* Property Address Section */}
          {!form.sameAsAddress && (
            <>
              <AppText title="Property Address" fontFamily="bold" fontySize="px16" marginTop={vs(6)} marginBottom={vs(8)} color="primary" />

              <View style={{ zIndex: 98, position: 'relative', marginBottom: vs(12) }}>
                <AppText title="Address" fontFamily="medium" fontySize="px14" marginBottom={8} />
                <GooglePlaceAutoComplete
                  value={form.propertyAddress}
                  onChangeText={t => updateField('propertyAddress', t)}
                  onSelectPlace={(place: GooglePlaceResult) => {
                    updateField('propertyAddress', place.address);
                    if (place.state) updateField('propertyState', place.state);
                    if (place.city) updateField('propertyCity', place.city);
                    if (place.zipCode) updateField('propertyZipCode', place.zipCode);
                  }}
                />
              </View>

              {renderSelectField('State', 'propertyState', usStateOptions, 'Select State')}

              <AppInput
                label="City"
                placeholder="Enter City"
                value={form.propertyCity}
                onChangeText={t => updateField('propertyCity', t)}
              />

              <AppInput
                label="Zip code"
                placeholder="Zip code"
                value={form.propertyZipCode}
                onChangeText={t => updateField('propertyZipCode', t)}
                keyboardType="numeric"
              />
            </>
          )}

          {renderSelectField('Property Type', 'propertyType', ['Estate', 'Private Home', 'Office', 'Storage', 'Other'], 'Select property type')}

          <AppInput
            label="Alternate Contacts"
            placeholder="Alternate contacts"
            value={form.alternateContacts}
            onChangeText={t => updateField('alternateContacts', t)}
          />

          <AppInput
            label="Payments Notes"
            placeholder="Payments notes"
            value={form.paymentNotes}
            onChangeText={t => updateField('paymentNotes', t)}
            multiline
            numberOfLines={4}
            style={styles.textAreaInput}
          />

          {/* Financials / Fees Section */}
          <AppText title="Fees Setup" fontFamily="bold" fontySize="px16" marginTop={vs(12)} marginBottom={vs(8)} color="primary" />

          {/* Commission Row */}
          <AppCheckbox
            value={form.commissionCheck}
            onChange={v => updateField('commissionCheck', v)}
            label="Commission"
            containerStyle={{ marginBottom: vs(6) }}
          />
          {form.commissionCheck && (
            <AppInput
              placeholder="Commission value (%)"
              value={form.commissionCheckValue}
              onChangeText={t => updateField('commissionCheckValue', t)}
              keyboardType="numeric"
              error={errors.commissionCheckValue}
            />
          )}

          {/* Pickup Fees Row */}
          <AppCheckbox
            value={form.pickupFessCheck}
            onChange={v => updateField('pickupFessCheck', v)}
            label="Pickup Fees"
            containerStyle={{ marginVertical: vs(6) }}
          />
          {form.pickupFessCheck && (
            <AppInput
              placeholder="Pickup fee value"
              value={form.pickupFessValue}
              onChangeText={t => updateField('pickupFessValue', t)}
              keyboardType="numeric"
              error={errors.pickupFessValue}
            />
          )}

          {/* Other Fees Row */}
          <AppCheckbox
            value={form.other}
            onChange={v => updateField('other', v)}
            label="Other Fees"
            containerStyle={{ marginVertical: vs(6) }}
          />
          {form.other && (
            <AppInput
              placeholder="Other fees value"
              value={form.otherFeesValue}
              onChangeText={t => updateField('otherFeesValue', t)}
              keyboardType="numeric"
              error={errors.otherFeesValue}
            />
          )}

          {/* Online Access, Access Link, Also Bidder */}
          <View style={{ marginTop: vs(12) }}>
            {renderSelectField('Online Access', 'onlineAccess', ['No (default to no)', 'Yes', 'Number Of Auctions', 'Items Purchased', 'Total Purchased', 'Email Subscribed'], 'Select online access')}

            <AppInput
              label="Access Link"
              placeholder="Enter Access Link"
              value={form.accessLink}
              onChangeText={t => updateField('accessLink', t)}
            />

            {renderSelectField('Also Bidder', 'alsoBiddersAdd', ['No', 'Yes, Populate Bidders Fields'])}
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
                    if (selectConfig.key === 'homeState') {
                      updateField('homeCity', '');
                    }
                    if (selectConfig.key === 'propertyState') {
                      updateField('propertyCity', '');
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

export default AddEditClientScreen;

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
});
