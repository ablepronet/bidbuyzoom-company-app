import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import AppHeader from '../../../components/appHeader';
import { AppText } from '../../../components/AppText';
import { AppInput } from '../../../components/AppInput';
import AppButton from '../../../components/appButton';
import AppCheckbox from '../../../components/AppCheckbox';
import Card from '../../../components/Card';
import AppPicker from '../../../components/AppPicker';
import { colors } from '../../../constants';
import { ms, vs } from '../../../utils/responsive';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AppToast from '../../../components/toaster';
import State from 'country-state-city/lib/state';
import GooglePlaceAutoComplete, { GooglePlaceResult } from '../../../components/GooglePlaceAutoComplete';
import { initStripe, createToken, CardField } from '@stripe/stripe-react-native';
import { useGetStripeConfig, useAddCardPayment } from '../../../services/queries/app/plans/plans';
import Loader from '../../../components/loader';

const AddCardScreen = () => {
  const navigation = useNavigation();

  // Load US States dynamically
  const STATES_LIST = useMemo(() => {
    return (State.getStatesOfCountry('US') || []).map(s => ({
      label: s.name,
      value: s.name,
    }));
  }, []);

  // Fetch Stripe publishable key configuration
  const { data: stripeConfig, isLoading: isConfigLoading } = useGetStripeConfig();
  const addCardMutation = useAddCardPayment();

  const [stripeInitialized, setStripeInitialized] = useState(false);
  const [isLinking, setIsLinking] = useState(false);

  // Initialize Stripe when config is loaded
  useEffect(() => {
    if (stripeConfig?.publishableKey) {
      initStripe({
        publishableKey: stripeConfig.publishableKey,
      })
        .then(() => {
          setStripeInitialized(true);
        })
        .catch((err) => {
          console.log('initStripe failed:', err);
          AppToast.error('Stripe initialization failed');
        });
    }
  }, [stripeConfig]);

  // Company Address states 
  const [compAddress, setCompAddress] = useState('');
  const [compState, setCompState] = useState('');
  const [compCity, setCompCity] = useState('');
  const [compZip, setCompZip] = useState('');

  // Billing Address states
  const [billAddress, setBillAddress] = useState('');
  const [billState, setBillState] = useState('');
  const [billCity, setBillCity] = useState('');
  const [billZip, setBillZip] = useState('');
  const [sameAsAbove, setSameAsAbove] = useState(false);

  // Card details states
  const [cardName, setCardName] = useState('');
  const [cardComplete, setCardComplete] = useState(false);
  const [useDefault, setUseDefault] = useState(true);

  // Modal visibilities for state pickers
  const [compStateVisible, setCompStateVisible] = useState(false);
  const [billStateVisible, setBillStateVisible] = useState(false);

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSameAsAboveChange = useCallback((val: boolean) => {
    setSameAsAbove(val);
    if (val) {
      setBillAddress(compAddress);
      setBillState(compState);
      setBillCity(compCity);
      setBillZip(compZip);
    } else {
      setBillAddress('');
      setBillState('');
      setBillCity('');
      setBillZip('');
    }
  }, [compAddress, compState, compCity, compZip]);

  const handleLinkCard = useCallback(async () => {
    if (stripeConfig && !stripeConfig.configured) {
      AppToast.error('Stripe is not configured on the server');
      return;
    }

    if (!stripeInitialized) {
      AppToast.error('Stripe is initializing, please wait...');
      return;
    }

    const newErrors: Record<string, string> = {};

    // US Address validations
    if (!compAddress) newErrors.compAddress = 'Address is required';
    if (!compState) newErrors.compState = 'State is required';
    if (!compCity) newErrors.compCity = 'City is required';

    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!compZip) {
      newErrors.compZip = 'Zip code is required';
    } else if (!zipRegex.test(compZip)) {
      newErrors.compZip = 'Invalid US zip code format (5 or 9 digits)';
    }

    if (!sameAsAbove) {
      if (!billAddress) newErrors.billAddress = 'Address is required';
      if (!billState) newErrors.billState = 'State is required';
      if (!billCity) newErrors.billCity = 'City is required';
      if (!billZip) {
        newErrors.billZip = 'Zip code is required';
      } else if (!zipRegex.test(billZip)) {
        newErrors.billZip = 'Invalid US zip code format (5 or 9 digits)';
      }
    }

    // Cardholder name validation: 2-50 chars, letters/spaces/hyphen/apostrophe
    const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;
    if (!cardName) {
      newErrors.cardName = 'Name on card is required';
    } else if (!nameRegex.test(cardName)) {
      newErrors.cardName = 'Name must be 2-50 characters (letters, spaces, hyphen, apostrophe)';
    }

    if (!cardComplete) {
      newErrors.cardDetails = 'Card details are incomplete';
      AppToast.error('Please enter complete card details');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLinking(true);

    try {
      const billingAddress = sameAsAbove ? compAddress : billAddress;
      const billingCity = sameAsAbove ? compCity : billCity;
      const billingState = sameAsAbove ? compState : billState;
      const billingZipCode = sameAsAbove ? compZip : billZip;

      // Create Stripe token using Billing details
      const { token, error } = await createToken({
        type: 'Card',
        name: cardName,
        address: {
          line1: billingAddress,
          city: billingCity,
          state: billingState,
          postalCode: billingZipCode,
          country: 'US',
        },
      });

      if (error) {
        AppToast.error(error.message || 'Stripe card tokenization failed');
        setIsLinking(false);
        return;
      }

      if (!token || !token.card) {
        AppToast.error('Failed to retrieve token details');
        setIsLinking(false);
        return;
      }

      // Call API to link the card
      addCardMutation.mutate({
        tokenId: token.id,
        lastFourDigit: token.card.last4,
        cardType: token.card.brand?.toLowerCase() || '',
        cardHolderName: cardName,
        address: billingAddress,
        city: billingCity,
        state: billingState,
        zipCode: billingZipCode,
        bussinessAddress: compAddress,
        bussinessCity: compCity,
        bussinessState: compState,
        bussinessZipCode: compZip,
        isDefault: useDefault,
      }, {
        onSuccess: (res) => {
          setIsLinking(false);
          navigation.goBack();
        },
        onError: (err) => {
          setIsLinking(false);
        }
      });

    } catch (err: any) {
      AppToast.error(err?.message || 'Something went wrong');
      setIsLinking(false);
    }
  }, [
    stripeConfig,
    stripeInitialized,
    compAddress,
    compState,
    compCity,
    compZip,
    sameAsAbove,
    billAddress,
    billState,
    billCity,
    billZip,
    cardName,
    cardComplete,
    useDefault,
    navigation,
    addCardMutation
  ]);

  const isPending = isConfigLoading || isLinking || addCardMutation.isPending;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardContainer}
    >
      <View style={styles.container}>
        <Loader isLoading={isPending} />
        <AppHeader
          leftIcon="chevron-back"
          onLeftPress={() => navigation.goBack()}
          title="Add New Card"
          showBorder={false}
          showNotification={false}
        />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <AppText
            title="Add New Card"
            fontySize="px18"
            fontFamily="bold"
            color="textPrimary"
            style={styles.screenTitle}
          />
          <AppText
            title="Complete the fields below to connect your payment method."
            fontySize="px12"
            fontFamily="regular"
            color="textSecondary"
            style={styles.screenSubtitle}
          />

          {/* Company Address Section */}
          <AppText title="Company Address" fontySize="px14" fontFamily="bold" color="textPrimary" style={styles.sectionTitle} />
          <Card style={styles.formCard}>
            <View style={{ zIndex: 99, position: 'relative', marginBottom: vs(12) }}>
              <AppText title="Address *" fontySize="px14" fontFamily="medium" color="textSecondary" marginBottom={8} />
              <GooglePlaceAutoComplete
                value={compAddress}
                onChangeText={(t) => {
                  setCompAddress(t);
                  if (sameAsAbove) setBillAddress(t);
                }}
                onSelectPlace={(place: GooglePlaceResult) => {
                  setCompAddress(place.address);
                  if (place.state) {
                    setCompState(place.state);
                    if (sameAsAbove) setBillState(place.state);
                  }
                  if (place.city) {
                    setCompCity(place.city);
                    if (sameAsAbove) setBillCity(place.city);
                  }
                  if (place.zipCode) {
                    setCompZip(place.zipCode);
                    if (sameAsAbove) setBillZip(place.zipCode);
                  }
                }}
                error={errors.compAddress}
              />
            </View>

            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.pickerField, styles.rowItem, errors.compState ? styles.pickerError : null]}
                onPress={() => setCompStateVisible(true)}
              >
                <AppText title="State *" fontySize="px14" fontFamily="medium" color="textSecondary" marginBottom={8} />
                <View style={styles.pickerValueRow}>
                  <AppText title={compState ? (STATES_LIST.find(s => s.value === compState)?.label || compState) : "Select State"} fontySize="px14" color={compState ? "textPrimary" : "placeholder"} />
                  <Icon name="chevron-down" size={ms(16)} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>

              <View style={styles.rowItem}>
                <AppInput
                  label="City *"
                  required
                  placeholder="Enter City"
                  value={compCity}
                  onChangeText={(t) => {
                    setCompCity(t);
                    if (sameAsAbove) setBillCity(t);
                  }}
                  error={errors.compCity}
                />
              </View>
            </View>

            <AppInput
              label="Zip code *"
              placeholder="Zip code"
              value={compZip}
              onChangeText={(t) => {
                setCompZip(t);
                if (sameAsAbove) setBillZip(t);
              }}
              error={errors.compZip}
              required
              keyboardType="numeric"
            />
          </Card>

          {/* Billing Address Section */}
          <AppText title="Billing Address" fontySize="px14" fontFamily="bold" color="textPrimary" style={styles.sectionTitle} />
          <Card style={styles.formCard}>
            <AppCheckbox
              value={sameAsAbove}
              onChange={handleSameAsAboveChange}
              label="Same as address above"
              containerStyle={styles.checkboxMargin}
            />

            {!sameAsAbove && (
              <>
                <View style={{ zIndex: 98, position: 'relative', marginBottom: vs(12) }}>
                  <AppText title="Address *" fontySize="px14" fontFamily="medium" color="textSecondary" marginBottom={8} />
                  <GooglePlaceAutoComplete
                    value={billAddress}
                    onChangeText={setBillAddress}
                    onSelectPlace={(place: GooglePlaceResult) => {
                      setBillAddress(place.address);
                      if (place.state) setBillState(place.state);
                      if (place.city) setBillCity(place.city);
                      if (place.zipCode) setBillZip(place.zipCode);
                    }}
                    error={errors.billAddress}
                  />
                </View>

                <View style={styles.row}>
                  <TouchableOpacity
                    style={[styles.pickerField, styles.rowItem, errors.billState ? styles.pickerError : null]}
                    onPress={() => setBillStateVisible(true)}
                  >
                    <AppText title="State *" fontySize="px14" fontFamily="medium" color="textSecondary" marginBottom={8} />
                    <View style={styles.pickerValueRow}>
                      <AppText title={billState ? (STATES_LIST.find(s => s.value === billState)?.label || billState) : "Select State"} fontySize="px14" color={billState ? "textPrimary" : "placeholder"} />
                      <Icon name="chevron-down" size={ms(16)} color={colors.textSecondary} />
                    </View>
                  </TouchableOpacity>

                  <View style={styles.rowItem}>
                    <AppInput
                      label="City *"
                      required
                      placeholder="Enter City"
                      value={billCity}
                      onChangeText={setBillCity}
                      error={errors.billCity}
                    />
                  </View>
                </View>

                <AppInput
                  label="Zip code *"
                  placeholder="Zip code"
                  value={billZip}
                  onChangeText={setBillZip}
                  error={errors.billZip}
                  required
                  keyboardType="numeric"
                />
              </>
            )}
          </Card>

          {/* Card Details Section */}
          <View style={styles.cardHeaderRow}>
            <AppText title="Card Details" fontySize="px14" fontFamily="bold" color="textPrimary" />
            <AppCheckbox
              value={useDefault}
              onChange={setUseDefault}
              label="Use default"
            />
          </View>

          <Card style={styles.formCard}>
            <AppInput
              label="Name on Card"
              placeholder="Name on Card"
              value={cardName}
              onChangeText={setCardName}
              error={errors.cardName}
              required
            />

            {stripeInitialized ? (
              <View style={{ marginBottom: vs(12) }}>
                <AppText title="Card Details *" fontySize="px14" fontFamily="medium" color="textSecondary" marginBottom={8} />
                <CardField
                  postalCodeEnabled={false}
                  placeholders={{
                    number: 'Card Number',
                  }}
                  cardStyle={{
                    backgroundColor: colors.white,
                    textColor: colors.textPrimary,
                    placeholderColor: colors.placeholder,
                  }}
                  style={styles.stripeCardField}
                  onCardChange={(cardDetails) => {
                    setCardComplete(cardDetails.complete);
                  }}
                />
                {errors.cardDetails && (
                  <AppText title={errors.cardDetails} color="error" fontySize="px12" marginTop={4} />
                )}
              </View>
            ) : (
              <View style={{ height: vs(70), justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="small" color={colors.primary} />
                <AppText title="Initializing secure billing..." fontySize="px12" color="textSecondary" marginTop={8} />
              </View>
            )}
          </Card>

          {/* Save Action */}
          <AppButton
            title="Securely Link Card"
            onPress={handleLinkCard}
            bgColor="primary"
            style={styles.linkButton}
          />

          {/* Notices */}
          <AppText
            title="Notice: To verify your card, a temporary charge of $1.00 will be applied and removed within 5 days."
            fontySize="px12"
            fontFamily="medium"
            color="primary"
            marginTop={vs(15)}
          />

          <AppText
            title="Security: Your card information is not stored on our servers. Instead, a compliant processor, such as Authorize.net or Stripe, securely maintains your card details. When charges are made, we communicate with the processor to process the payment"
            fontySize="px12"
            fontFamily="regular"
            color="primary"
            marginTop={vs(8)}
            style={{ opacity: 0.9 }}
          />

        </ScrollView>

        {/* Modal Pickers */}
        <AppPicker
          visible={compStateVisible}
          options={STATES_LIST}
          onSelect={(val: any) => {
            setCompState(val as string);
            if (sameAsAbove) setBillState(val as string);
          }}
          onClose={() => setCompStateVisible(false)}
          title="Select State"
        />

        <AppPicker
          visible={billStateVisible}
          options={STATES_LIST}
          onSelect={(val: any) => setBillState(val as string)}
          onClose={() => setBillStateVisible(false)}
          title="Select State"
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default AddCardScreen;

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
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
  sectionTitle: {
    marginTop: vs(8),
    marginBottom: vs(8),
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: ms(16),
    marginBottom: vs(12),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: ms(12),
  },
  rowItem: {
    flex: 1,
  },
  pickerField: {
    marginBottom: vs(10),
  },
  pickerValueRow: {
    height: vs(48),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    paddingHorizontal: ms(12),
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerError: {
    borderColor: colors.error,
  },
  checkboxMargin: {
    marginBottom: vs(10),
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: vs(8),
    marginBottom: vs(8),
  },
  linkButton: {
    marginTop: vs(15),
    borderRadius: 6,
    height: vs(44),
    backgroundColor: colors.primary,
  },
  stripeCardField: {
    width: '100%',
    height: vs(50),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    backgroundColor: colors.white,
  },
});
