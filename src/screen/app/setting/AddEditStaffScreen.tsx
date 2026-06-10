import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  Modal,
  Pressable,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/Ionicons';
import { State, City } from 'country-state-city';
import moment from 'moment';

import AppHeader from '../../../components/appHeader';
import { AppText } from '../../../components/AppText';
import { AppInput } from '../../../components/AppInput';
import AppButton from '../../../components/appButton';
import Card from '../../../components/Card';
import AppDateTimePickerModal from '../../../components/AppDateTimePickerModal';
import Loader from '../../../components/loader';
import GooglePlaceAutoComplete, { GooglePlaceResult } from '../../../components/GooglePlaceAutoComplete';
import { colors } from '../../../constants';
import { ms, scale, vs } from '../../../utils/responsive';
import { useAddStaff, useUpdateStaff, useUpdateStaffPermissions, StaffPermissions } from '../../../services/queries/app/staff';

interface FormState {
  firstName: string;
  lastName: string;
  date: string; // Hire Date / Created Date
  position: string;
  cellPhone: string;
  email: string;
  address: string;
  state: string;
  city: string;
  zipCode: string;
  birthDate: string;
  notes: string;
  others: string;
  alsoBiddersConsignor: 'No' | 'Yes';
  hasLogin: boolean;
}

const PERMISSION_KEYS: { key: keyof StaffPermissions; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'profile', label: 'Company Profile' },
  { key: 'default_settings', label: 'Default Settings' },
  { key: 'staff', label: 'Staff Management' },
  { key: 'payment_settings', label: 'Payment Settings' },
  { key: 'sms_security', label: 'SMS & Security' },
  { key: 'legal_pages', label: 'Legal Pages' },
  { key: 'consignors', label: 'Consignors / Clients' },
  { key: 'bidders', label: 'Bidders / Buyers' },
  { key: 'sales', label: 'Sales (Catalog, Monitor, Invoice, etc.)' },
  { key: 'notifications', label: 'Notification Settings' },
  { key: 'company_reports', label: 'Company Reports' },
  { key: 'consignment_requests', label: 'Consignment Requests' },
  { key: 'invoicing', label: 'Separate Invoicing' },
  { key: 'marketing', label: 'Marketing' },
];

const AddEditStaffScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const staff = route.params?.staff;
  const mode = route.params?.mode || 'add';

  const addStaffMutation = useAddStaff();
  const updateStaffMutation = useUpdateStaff();
  const updateStaffPermissionsMutation = useUpdateStaffPermissions();

  // Form State
  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    date: moment().format('YYYY-MM-DD'),
    position: '',
    cellPhone: '',
    email: '',
    address: '',
    state: '',
    city: '',
    zipCode: '',
    birthDate: '',
    notes: '',
    others: '',
    alsoBiddersConsignor: 'No',
    hasLogin: false,
  });

  // Permissions State
  const [permissions, setPermissions] = useState<StaffPermissions>({
    dashboard: false,
    profile: false,
    default_settings: false,
    staff: false,
    payment_settings: false,
    sms_security: false,
    legal_pages: false,
    consignors: false,
    bidders: false,
    sales: false,
    notifications: false,
    company_reports: false,
    consignment_requests: false,
    invoicing: false,
    marketing: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [activeDatePicker, setActiveDatePicker] = useState<'date' | 'birthDate' | null>(null);

  // States list lookup
  const US_STATES = useMemo(() => State.getStatesOfCountry('US'), []);
  const stateOptions = useMemo(() => US_STATES.map(s => s.name), [US_STATES]);

  // Cities dynamically filtered by selected state
  const selectedStateObj = useMemo(() => {
    return US_STATES.find(s => s.name === form.state);
  }, [form.state, US_STATES]);

  const cityOptions = useMemo(() => {
    if (!selectedStateObj) return [];
    return City.getCitiesOfState('US', selectedStateObj.isoCode).map(c => c.name);
  }, [selectedStateObj]);

  // Picker modal config
  const [selectConfig, setSelectConfig] = useState<{
    key: 'state' | 'city' | 'alsoBiddersConsignor';
    title: string;
    options: string[];
  } | null>(null);

  // Sync data on Edit mode
  useEffect(() => {
    if (mode === 'edit' && staff) {
      setForm({
        firstName: staff.firstName || '',
        lastName: staff.lastName || '',
        date: staff.date ? staff.date.split('T')[0] : moment().format('YYYY-MM-DD'),
        position: staff.position || '',
        cellPhone: staff.phone || '', // maps to phone/cellPhone
        email: staff.email || '',
        address: staff.address || '',
        state: staff.state || '',
        city: staff.city || '',
        zipCode: staff.zipCode || '',
        birthDate: staff.birthDate ? staff.birthDate.split('T')[0] : '',
        notes: staff.notes || '',
        others: staff.others || '',
        alsoBiddersConsignor: staff.alsoBiddersConsignor || 'No',
        hasLogin: staff.hasLogin || false,
      });

      if (staff.permissions) {
        setPermissions({
          dashboard: !!staff.permissions.dashboard,
          profile: !!staff.permissions.profile,
          default_settings: !!staff.permissions.default_settings,
          staff: !!staff.permissions.staff,
          payment_settings: !!staff.permissions.payment_settings,
          sms_security: !!staff.permissions.sms_security,
          legal_pages: !!staff.permissions.legal_pages,
          consignors: !!staff.permissions.consignors,
          bidders: !!staff.permissions.bidders,
          sales: !!staff.permissions.sales,
          notifications: !!staff.permissions.notifications,
          company_reports: !!staff.permissions.company_reports,
          consignment_requests: !!staff.permissions.consignment_requests,
          invoicing: !!staff.permissions.invoicing,
          marketing: !!staff.permissions.marketing,
        });
      }
    } else if (mode === 'add') {
      setForm({
        firstName: '',
        lastName: '',
        date: moment().format('YYYY-MM-DD'),
        position: '',
        cellPhone: '',
        email: '',
        address: '',
        state: '',
        city: '',
        zipCode: '',
        birthDate: '',
        notes: '',
        others: '',
        alsoBiddersConsignor: 'No',
        hasLogin: false,
      });
      setPermissions({
        dashboard: false,
        profile: false,
        default_settings: false,
        staff: false,
        payment_settings: false,
        sms_security: false,
        legal_pages: false,
        consignors: false,
        bidders: false,
        sales: false,
        notifications: false,
        company_reports: false,
        consignment_requests: false,
        invoicing: false,
        marketing: false,
      });
    }
  }, [staff, mode]);

  const updateField = (key: keyof FormState, value: any) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'state') {
        next.city = ''; // Reset city if state changes
      }
      return next;
    });

    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const togglePermission = (key: keyof StaffPermissions) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Enabled permissions counter
  const enabledPermissionsCount = useMemo(() => {
    return Object.values(permissions).filter(Boolean).length;
  }, [permissions]);

  const validate = () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.firstName.trim()) nextErrors.firstName = 'First Name is required';
    if (!form.lastName.trim()) nextErrors.lastName = 'Last Name is required';
    if (!form.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      nextErrors.email = 'Email is invalid';
    }
    if (!form.date) nextErrors.date = 'Date is required';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    Keyboard.dismiss();
    if (!validate()) return;

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      date: form.date,
      position: form.position.trim(),
      phone: form.cellPhone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      state: form.state,
      city: form.city,
      zipCode: form.zipCode.trim(),
      birthDate: form.birthDate,
      notes: form.notes.trim(),
      others: form.others.trim(),
      alsoBiddersConsignor: form.alsoBiddersConsignor,
      hasLogin: form.hasLogin,
      permissions,
    };

    try {
      if (mode === 'add') {
        await addStaffMutation.mutateAsync(payload);
        navigation.goBack();
      } else {
        await updateStaffMutation.mutateAsync({
          ...payload,
          id: staff._id,
          isActive: staff.isActive,
        });
        navigation.goBack();
      }
    } catch (e) {
      console.log('Failed to save staff', e);
    }
  };

  const handleUpdatePermissions = async () => {
    Keyboard.dismiss();
    if (!staff?._id) return;
    try {
      await updateStaffPermissionsMutation.mutateAsync({
        staffId: staff._id,
        permissions,
      });
    } catch (e) {
      console.log('Failed to update permissions', e);
    }
  };

  const renderSelectField = (label: string, fieldKey: 'state' | 'city' | 'alsoBiddersConsignor', options: string[], placeholder: string = 'Select option') => {
    const val = form[fieldKey] as string;
    return (
      <View style={styles.fieldContainer}>
        <AppText title={label} fontFamily="medium" fontySize="px14" marginBottom={8} color="textPrimary" />
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

  const isPending = addStaffMutation.isPending || updateStaffMutation.isPending || updateStaffPermissionsMutation.isPending;

  return (
    <View style={styles.container}>
      <Loader isLoading={isPending} />

      <AppHeader
        leftIcon="chevron-back"
        onLeftPress={() => navigation.goBack()}
        title={mode === 'add' ? 'Add Staff' : 'Edit Staff'}
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

        {/* Staff Information Card */}
        <Card style={styles.card}>
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

          {/* Date Picker (Hire Date) */}
          <View style={styles.fieldContainer}>
            <AppText title="Date *" fontFamily="medium" fontySize="px14" marginBottom={8} color="textPrimary" />
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.dropdownTrigger, errors.date ? styles.errorBorder : null]}
              onPress={() => setActiveDatePicker('date')}>
              <AppText
                title={form.date ? moment(form.date).format('DD/MM/YYYY') : 'Select Date'}
                fontySize="px16"
                color={form.date ? 'textPrimary' : 'textSecondary'}
              />
              <Icon name="calendar-outline" size={ms(18)} color={colors.textSecondary} />
            </TouchableOpacity>
            {errors.date && (
              <AppText title={errors.date} color="error" fontySize="px14" marginTop={4} />
            )}
          </View>

          <AppInput
            label="Position"
            placeholder="Enter Position"
            value={form.position}
            onChangeText={t => updateField('position', t)}
          />

          <AppInput
            label="Cell Phone"
            placeholder="Enter Phone Number"
            value={form.cellPhone}
            onChangeText={t => updateField('cellPhone', t)}
            keyboardType="phone-pad"
          />

          <AppInput
            label="Email"
            required
            placeholder="Enter Email"
            value={form.email}
            onChangeText={t => updateField('email', t)}
            keyboardType="email-address"
            error={errors.email}
            editable={mode === 'add'} // email should generally be readonly on edit
          />

          <View style={{ zIndex: 99, position: 'relative', marginBottom: vs(12) }}>
            <AppText title="Address" fontFamily="medium" fontySize="px14" marginBottom={8} color="textPrimary" />
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

          {/* States selector */}
          {renderSelectField('State', 'state', stateOptions, 'Select State')}

          {/* Cities selector (filtered by state) */}
          {renderSelectField('City', 'city', cityOptions, form.state ? 'Select City' : 'Select State first')}

          <AppInput
            label="Zip code"
            placeholder="Zip code"
            value={form.zipCode}
            onChangeText={t => updateField('zipCode', t)}
            keyboardType="numeric"
          />

          {/* Birthday Date Picker */}
          <View style={styles.fieldContainer}>
            <AppText title="Birthday" fontFamily="medium" fontySize="px14" marginBottom={8} color="textPrimary" />
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.dropdownTrigger}
              onPress={() => setActiveDatePicker('birthDate')}>
              <AppText
                title={form.birthDate ? moment(form.birthDate).format('DD/MM/YYYY') : 'dd/mm/yyyy'}
                fontySize="px16"
                color={form.birthDate ? 'textPrimary' : 'textSecondary'}
              />
              <Icon name="calendar-outline" size={ms(18)} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <AppInput
            label="Notes"
            placeholder="Enter Notes"
            value={form.notes}
            onChangeText={t => updateField('notes', t)}
            multiline
            numberOfLines={4}
            style={styles.textAreaInput}
          />

          <AppInput
            label="Other"
            placeholder="Enter other details"
            value={form.others}
            onChangeText={t => updateField('others', t)}
            multiline
            numberOfLines={4}
            style={styles.textAreaInput}
          />

          {renderSelectField('Also Bidder', 'alsoBiddersConsignor', ['No', 'Yes'])}

          <AppButton
            title="Submit"
            onPress={handleSave}
            style={styles.submitBtn}
            loading={isPending}
          />
        </Card>

        {/* Login & Permissions Card */}
        <Card style={[styles.card, { marginTop: vs(10) }]}>
          <View style={styles.permissionsHeader}>
            <AppText title="Login & Permissions" fontySize="px16" fontFamily="bold" color="textPrimary" />
            <View style={styles.toggleRowInline}>
              <AppText title="Send Login Invite on Add" fontySize="px12" color="textSecondary" style={{ marginRight: 8 }} />
              <Switch
                value={form.hasLogin}
                onValueChange={(val) => updateField('hasLogin', val)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
                style={styles.switchScale}
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.pageAccessHeader}>
            <AppText title="Page Access Permissions" fontySize="px14" fontFamily="bold" color="textPrimary" />
            <AppText title={`${enabledPermissionsCount} / 15 enabled`} fontySize="px12" color="textSecondary" />
          </View>

          {/* Grid of Toggles */}
          <View style={styles.togglesGrid}>
            {PERMISSION_KEYS.map((item) => (
              <View key={item.key} style={styles.gridItem}>
                <Switch
                  value={permissions[item.key]}
                  onValueChange={() => togglePermission(item.key)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                  style={styles.switchScale}
                />
                <AppText title={item.label} fontySize="px14" color="textPrimary" style={styles.gridText} />
              </View>
            ))}
          </View>

          {mode === 'edit' && (
            <AppButton
              title="Update Permissions"
              onPress={handleUpdatePermissions}
              style={{ marginTop: vs(15) }}
              loading={updateStaffPermissionsMutation.isPending}
            />
          )}
        </Card>

      </KeyboardAwareScrollView>

      {/* Date Pickers */}
      <AppDateTimePickerModal
        isVisible={activeDatePicker !== null}
        mode="date"
        date={activeDatePicker && form[activeDatePicker] ? new Date(form[activeDatePicker]) : new Date()}
        onConfirm={(date) => {
          if (activeDatePicker) {
            updateField(activeDatePicker, moment(date).format('YYYY-MM-DD'));
          }
          setActiveDatePicker(null);
        }}
        onCancel={() => setActiveDatePicker(null)}
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
              fontySize="px16"
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

export default AddEditStaffScreen;

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
    paddingBottom: vs(40),
  },
  topBackRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: vs(12),
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#98A2B3',
    paddingHorizontal: scale(14),
    paddingVertical: vs(8),
    borderRadius: scale(6),
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: scale(12),
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
  errorBorder: {
    borderColor: colors.error,
  },
  textAreaInput: {
    minHeight: vs(90),
    textAlignVertical: 'top',
    paddingTop: vs(12),
  },
  submitBtn: {
    backgroundColor: colors.primary,
    marginTop: vs(15),
  },
  permissionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: vs(12),
  },
  pageAccessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  togglesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: vs(14),
  },
  gridItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: vs(2),
  },
  switchScale: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  gridText: {
    marginLeft: ms(10),
    flex: 1,
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
