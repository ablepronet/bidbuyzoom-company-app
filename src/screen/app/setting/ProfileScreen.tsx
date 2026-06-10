import React, { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/Ionicons';
import State from 'country-state-city/lib/state';
import FastImage from 'react-native-fast-image';

import AppHeader from '../../../components/appHeader';
import { AppText } from '../../../components/AppText';
import { AppInput } from '../../../components/AppInput';
import AppButton from '../../../components/appButton';
import Card from '../../../components/Card';
import Loader from '../../../components/loader';
import { colors } from '../../../constants';
import { ms, scale, vs } from '../../../utils/responsive';
import GooglePlaceAutoComplete, { GooglePlaceResult } from '../../../components/GooglePlaceAutoComplete';
import { useGetUserProfile, useUpdateUserProfile } from '../../../services/queries/app/Profile';
import { getImageUri } from '../../../utils/getImageUri';
import { showImagePickerAlert, ImagePickerResult } from '../../../utils/imagePicker';

interface FormState {
  firstName: string;
  lastName: string;
  companyName: string;
  phone: string;
  cellPhone: string;
  email: string;
  alternativeEmail: string;
  ein: string;
  isLicNumber: string;
  licNumber: string;
  address: string;
  addressAlternate: string;
  state: string;
  city: string;
  zipCode: string;
  companyType: string;
  websiteUrl: string;
  summaryDescription: string;
  alsoBiddersClient: string;
}

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { data: profileData, isLoading: isProfileLoading } = useGetUserProfile();
  const updateProfileMutation = useUpdateUserProfile();

  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    companyName: '',
    phone: '',
    cellPhone: '',
    email: '',
    alternativeEmail: '',
    ein: '',
    isLicNumber: 'No',
    licNumber: '',
    address: '',
    addressAlternate: '',
    state: '',
    city: '',
    zipCode: '',
    companyType: 'Auction',
    websiteUrl: '',
    summaryDescription: '',
    alsoBiddersClient: 'No',
  });

  const [selectedLogo, setSelectedLogo] = useState<ImagePickerResult | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [selectConfig, setSelectConfig] = useState<{
    key: keyof FormState;
    title: string;
    options: string[];
  } | null>(null);

  // Sync profile data
  useEffect(() => {
    if (profileData?.datas) {
      const datas = profileData.datas;
      setForm({
        firstName: datas.firstName || '',
        lastName: datas.lastName || '',
        companyName: datas.companyName || '',
        phone: datas.phone || '',
        cellPhone: datas.cellPhone || '',
        email: datas.email || '',
        alternativeEmail: datas.alternativeEmail || '',
        ein: datas.ein || '',
        isLicNumber: datas.isLicNumber === 'true' || datas.isLicNumber === true ? 'Yes' : 'No',
        licNumber: datas.licNumber || '',
        address: datas.address || '',
        addressAlternate: datas.addressAlternate || '',
        state: datas.state || '',
        city: datas.city || '',
        zipCode: datas.zipCode || '',
        companyType: datas.companyType || 'Auction',
        websiteUrl: datas.websiteUrl || datas.website || '',
        summaryDescription: datas.summaryDescription || '',
        alsoBiddersClient: datas.alsoBiddersClient || 'No',
      });

      if (datas.logo) {
        setSelectedLogo({
          uri: getImageUri(datas.logo),
        });
      }
    }
  }, [profileData]);

  // USA States options
  const US_STATES = useMemo(() => State.getStatesOfCountry('US'), []);
  const usStateOptions = useMemo(() => US_STATES.map(s => s.name), [US_STATES]);

  const updateField = (key: keyof FormState, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const handleLogoPick = async () => {
    Keyboard.dismiss();
    const result = await showImagePickerAlert({
      mediaType: 'photo',
      quality: 0.8,
    });
    if (result.uri) {
      setSelectedLogo(result);
    }
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.firstName.trim()) nextErrors.firstName = 'First Name is required';
    if (!form.lastName.trim()) nextErrors.lastName = 'Last Name is required';
    if (!form.companyName.trim()) nextErrors.companyName = 'Company Name is required';
    if (!form.phone.trim()) nextErrors.phone = 'Phone number is required';
    if (!form.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      nextErrors.email = 'Email is invalid';
    }
    if (form.isLicNumber === 'Yes' && !form.licNumber.trim()) {
      nextErrors.licNumber = 'License Number is required';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!validate()) return;

    const formData = new FormData();
    formData.append('firstName', form.firstName);
    formData.append('lastName', form.lastName);
    formData.append('companyName', form.companyName);
    formData.append('phone', form.phone);
    formData.append('cellPhone', form.cellPhone);
    formData.append('email', form.email);
    formData.append('alternativeEmail', form.alternativeEmail);
    formData.append('ein', form.ein);
    formData.append('isLicNumber', form.isLicNumber === 'Yes' ? 'true' : 'false');
    formData.append('licNumber', form.isLicNumber === 'Yes' ? form.licNumber : '');
    formData.append('address', form.address);
    formData.append('addressAlternate', form.addressAlternate);
    formData.append('state', form.state);
    formData.append('city', form.city);
    formData.append('zipCode', form.zipCode);
    formData.append('companyType', form.companyType);
    formData.append('website', form.websiteUrl);
    formData.append('websiteUrl', form.websiteUrl);
    formData.append('summaryDescription', form.summaryDescription);
    formData.append('alsoBiddersClient', form.alsoBiddersClient);

    // Only upload if it is a local file picked by the user
    if (selectedLogo && selectedLogo.uri && (selectedLogo.uri.startsWith('file://') || selectedLogo.uri.startsWith('content://'))) {
      formData.append('logo', {
        uri: selectedLogo.uri,
        name: selectedLogo.fileName || 'logo.jpg',
        type: selectedLogo.type || 'image/jpeg',
      } as any);
    }

    try {
      await updateProfileMutation.mutateAsync(formData);
    } catch (e) {
      console.log('Profile update failed', e);
    }
  };

  const renderSelectField = (label: string, fieldKey: keyof FormState, options: string[], placeholder: string = 'Select option') => {
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
        title="Profile"
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

        {/* Header Branding Card */}
        <Card style={styles.card}>
          <View style={styles.headerLeftOnly}>
            <AppText
              title="Company Profile"
              fontySize="px18"
              fontFamily="bold"
              color="textPrimary"
            />
            <AppText
              title="Manage company information, branding, contact information and business settings."
              fontySize="px12"
              fontFamily="regular"
              color="textSecondary"
              marginTop={vs(4)}
            />
          </View>
        </Card>

        {/* Company Information Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="business-outline" size={ms(20)} color={colors.primary} style={styles.cardIcon} />
            <View>
              <AppText title="Company Information" fontySize="px14" fontFamily="bold" color="textPrimary" />
              <AppText title="Basic company details and primary contact information." fontySize="px12" color="textSecondary" />
            </View>
          </View>

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
            required
            placeholder="Enter Company Name"
            value={form.companyName}
            onChangeText={t => updateField('companyName', t)}
            error={errors.companyName}
          />

          <AppInput
            label="Phone"
            required
            placeholder="Enter Phone Number"
            value={form.phone}
            onChangeText={t => updateField('phone', t)}
            keyboardType="phone-pad"
            error={errors.phone}
          />

          <AppInput
            label="Cell Phone"
            placeholder="Enter Cell Phone Number"
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
          />

          <AppInput
            label="Alternate Email"
            placeholder="Enter Alternate Email"
            value={form.alternativeEmail}
            onChangeText={t => updateField('alternativeEmail', t)}
            keyboardType="email-address"
          />

          <AppInput
            label="EIN"
            placeholder="Enter EIN"
            value={form.ein}
            onChangeText={t => updateField('ein', t)}
          />
        </Card>

        {/* Licensing & Branding Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="ribbon-outline" size={ms(20)} color={colors.primary} style={styles.cardIcon} />
            <View>
              <AppText title="Licensing & Branding" fontySize="px14" fontFamily="bold" color="textPrimary" />
              <AppText title="Auction license information and company logo used in your branded auction pages." fontySize="px12" color="textSecondary" />
            </View>
          </View>

          {renderSelectField(
            'Some States require an auction license for online sales. Do you hold an Auctioneers License?',
            'isLicNumber',
            ['No', 'Yes']
          )}

          {form.isLicNumber === 'Yes' && (
            <AppInput
              label="Lic. Number"
              placeholder="Enter License Number"
              value={form.licNumber}
              onChangeText={t => updateField('licNumber', t)}
              error={errors.licNumber}
            />
          )}

          <View style={styles.fieldContainer}>
            <View>
              <AppText title="Upload Logo" fontFamily="medium" fontySize="px14" marginBottom={8} />
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLogoPick}
              style={styles.uploadLogoTrigger}>
              {selectedLogo?.uri ? (
                <View style={styles.uploadLogoContent}>
                  <FastImage
                    source={{ uri: selectedLogo.uri }}
                    style={styles.logoThumbnail}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                  <AppText title="Change Logo" fontySize="px14" fontFamily="medium" color="primary" marginLeft={ms(12)} />
                </View>
              ) : (
                <View style={styles.uploadLogoContent}>
                  <AppText title="Select Logo" fontySize="px14" color="textSecondary" />
                </View>
              )}
              <Icon name="cloud-upload-outline" size={ms(20)} color={colors.primary} />
            </TouchableOpacity>
            <AppText
              title="Note: The file size should be between 0 KB and 1000 KB for optimal performance."
              fontySize="px10"
              fontFamily="regular"
              color="dangerToastText"
              marginTop={vs(6)}
            />
          </View>
        </Card>

        {/* Address Information Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="location-outline" size={ms(20)} color={colors.primary} style={styles.cardIcon} />
            <View>
              <AppText title="Address Information" fontySize="px14" fontFamily="bold" color="textPrimary" />
              <AppText title="Public address and auction URL information for your company profile." fontySize="px12" color="textSecondary" />
            </View>
          </View>

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

          <AppInput
            label="Address 2"
            placeholder="Address alternate"
            value={form.addressAlternate}
            onChangeText={t => updateField('addressAlternate', t)}
          />

          {renderSelectField('State', 'state', usStateOptions, 'Select State')}

          <AppInput
            label="City"
            placeholder="Enter City"
            value={form.city}
            onChangeText={t => updateField('city', t)}
          />

          <AppInput
            label="Zip code"
            placeholder="Zip code"
            value={form.zipCode}
            onChangeText={t => updateField('zipCode', t)}
            keyboardType="numeric"
          />

          {renderSelectField('Company Type', 'companyType', ['Auction', 'Estate Sales', 'Other Bussiness', 'Private Estate Sales'])}

          {/* <AppInput
            label="Auction URL"
            placeholder="Auction web link"
            value={form.websiteUrl}
            onChangeText={t => updateField('websiteUrl', t)}
            autoCapitalize="none"
          /> */}

          <AppInput
            label="Summary Description"
            placeholder="Enter short description about your company"
            value={form.summaryDescription}
            onChangeText={t => updateField('summaryDescription', t)}
            multiline
            numberOfLines={4}
            style={styles.textAreaInput}
          />

          {renderSelectField('Also Bidder', 'alsoBiddersClient', [
            'No',
            'Yes',
            'Yes, Populate Bidders Fields',
            'Yes, Populate Consignor Fields',
            'Yes, Populate Consignor/Bidders Fields',
          ])}
        </Card>

        {/* Actions Button */}
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
            title="Save Changes"
            onPress={handleSubmit}
            style={styles.submitBtn}
            loading={updateProfileMutation.isPending}
          />
        </View>

      </KeyboardAwareScrollView>

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

export default ProfileScreen;

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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: ms(16),
    paddingBottom: vs(30),
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: scale(12),
    padding: ms(16),
    marginBottom: vs(16),
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    marginRight: ms(16),
  },
  headerLeftOnly: {
    flex: 1,
  },
  uploadLogoTrigger: {
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
  uploadLogoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoThumbnail: {
    width: ms(32),
    height: ms(32),
    borderRadius: scale(4),
  },
  logoContainer: {
    width: ms(70),
    height: ms(70),
    borderRadius: scale(10),
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    position: 'relative',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: scale(8),
  },
  logoBadge: {
    position: 'absolute',
    bottom: -scale(4),
    right: -scale(4),
    backgroundColor: colors.primary,
    width: ms(20),
    height: ms(20),
    borderRadius: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(16),
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
    paddingBottom: vs(10),
  },
  cardIcon: {
    marginRight: ms(10),
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
    marginTop: vs(10),
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
