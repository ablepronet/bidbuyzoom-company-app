import React, { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  TextStyle,
  ViewStyle,
  Platform,
  Dimensions,
} from 'react-native';
import {
  CountryPicker,
  countryCodes,
  CountryItem,
} from 'react-native-country-codes-picker';

import { colors } from '../constants';
import { scale, vs, ms,  } from '../utils/responsive';
import { AppText } from './AppText';

const {width, height} = Dimensions.get('window');

interface AppPhoneInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  countryCode?: string;
  callingCode?: string;
  onCountryChange?: (country: CountryItem) => void;
  error?: string;
  editable?: boolean;
}

const AppPhoneInput: React.FC<AppPhoneInputProps> = ({
  label,
  value,
  onChangeText,
  countryCode = 'IN',
  callingCode,
  onCountryChange,
  error,
  editable = true,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const selectedCountry = useMemo(() => {
    return countryCodes.find(c => c.code === (countryCode || ''));
  }, [countryCode]);

  const handleSelect = (country: CountryItem) => {
    setShowPicker(false);
    onCountryChange?.(country);
  };

  return (
    <View style={styles.container}>
      {label && (
        <AppText
          title={label}
          fontFamily="medium"
          marginBottom={vs(6)}
          fontySize="px16"
        />
      )}

      <View
        style={[
          styles.inputWrapper,
          error && styles.errorBorder,
          !editable && styles.disabledWrapper,
        ]}
        pointerEvents={editable ? 'auto' : 'none'}
      >
        <Pressable
          style={styles.countryPickerTrigger}
          onPress={() => editable && setShowPicker(true)}
          disabled={!editable}
        >
          <AppText
            title={selectedCountry?.flag ?? '🌐'}
            isTr={false}
            fontySize='px18'
          />
          <AppText
            title={callingCode ? `+${callingCode}` : selectedCountry?.dial_code}
            style={styles.callingCode}
            isTr={false}
          />
        </Pressable>

        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
          placeholder="Phone number"
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={colors.textSecondary}
          maxLength={15}
          editable={editable}
        />

        <CountryPicker
          show={showPicker}
          lang="en"
          pickerButtonOnPress={handleSelect}
          onBackdropPress={() => setShowPicker(false)}
          onRequestClose={() => setShowPicker(false)}
          initialState={countryCode}
          inputPlaceholder="Search country"
          inputPlaceholderTextColor={colors.textSecondary}
          searchMessage="No country found"
          style={{
            modal: {
              ...styles.modal,
              ...(Platform.OS === 'web' && { maxWidth: Math.min(600, width * 0.9) }),
            },
            modalInner: styles.modalInner,
            backdrop: styles.backdrop,
            textInput: styles.searchInput,
            line: styles.line,
            itemsList: styles.itemsList,
            countryMessageContainer: styles.countryMessageContainer,
            searchMessageText: styles.searchMessageText,
          }}
        />
      </View>

      {!!error && (
        <AppText title={error} color="error" fontySize="px14" marginTop={vs(4)} />
      )}
    </View>
  );
};

export default AppPhoneInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: vs(16),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: scale(5),
    paddingHorizontal: scale(10),
    backgroundColor: colors.white,
  },
  countryPickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: scale(10),
  },
  flag: {
    fontSize: scale(18),
  },
  callingCode: {
    marginHorizontal: scale(6),
    fontSize: scale(16),
    color: colors.textPrimary,
  },
  input: {
    flex: 1,
    height: vs(48),
    fontSize: scale(16),
    color: colors.textPrimary,
  },
  errorBorder: {
    borderColor: colors.error,
  },
  disabledWrapper: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.8,
  },
  // CountryPicker styles
  modal: {
    backgroundColor: colors.white,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 600 : undefined,
    borderTopRightRadius: scale(20),
    borderTopLeftRadius: scale(20),
    padding: ms(16),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: vs(6),
    },
    shadowOpacity: 0.37,
    shadowRadius: scale(7.49),
    elevation: 10,
  },
  modalInner: {
    zIndex: 99,
    backgroundColor: colors.white,
    width: '100%',
  },
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  searchBar: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: scale(10),
    height: vs(44),
    paddingHorizontal: scale(12),
    paddingVertical: Platform.OS === 'ios' ? vs(12) : vs(8),
  },
  searchInput: {
    fontSize: ms(16),
    color: colors.textPrimary,
  },
  line: {
    width: '100%',
    height: 1,
    borderRadius: scale(2),
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginVertical: vs(12),
  },
  itemsList: {
    height: height * 0.6,
  },
  countryMessageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: vs(250),
  },
  searchMessageText: {
    color: colors.textSecondary,
    fontSize: ms(16),
    textAlign: 'center',
  },
});