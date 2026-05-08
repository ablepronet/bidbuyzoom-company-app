import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import {AppText} from './AppText';
import {colors} from '../constants';
import {ms, scale, vs} from '../utils/responsive';

const GOOGLE_PLACES_API_KEY = 'AIzaSyDvYUrMqUZcGivY2sBgNQ1r18YSdR4m6_w';

type Suggestion = {
  description: string;
  place_id: string;
};

export type GooglePlaceResult = {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  fullAddress: string;
};

type Props = {
  value: string;
  error?: string;
  onChangeText: (value: string) => void;
  onSelectPlace: (place: GooglePlaceResult) => void;
};

const GooglePlaceAutoComplete: React.FC<Props> = ({
  value,
  error,
  onChangeText,
  onSelectPlace,
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!isFocused || value.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          'https://maps.googleapis.com/maps/api/place/autocomplete/json',
          {
            params: {
              input: value,
              key: GOOGLE_PLACES_API_KEY,
              language: 'en',
              components: 'country:us',
              types: 'address',
            },
          },
        );

        if (requestIdRef.current === requestId) {
          setSuggestions(response.data?.predictions || []);
        }
      } catch {
        if (requestIdRef.current === requestId) {
          setSuggestions([]);
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setIsLoading(false);
        }
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [isFocused, value]);

  const handleSelectPlace = async (suggestion: Suggestion) => {
    try {
      setIsLoading(true);
      setSuggestions([]);
      setIsFocused(false);

      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/details/json',
        {
          params: {
            place_id: suggestion.place_id,
            key: GOOGLE_PLACES_API_KEY,
            fields: 'address_component,formatted_address',
          },
        },
      );

      const details = response.data?.result;
      const components = details?.address_components || [];
      let city = '';
      let state = '';
      let zipCode = '';
      let streetNumber = '';
      let streetName = '';

      components.forEach((component: any) => {
        if (component.types.includes('street_number')) {
          streetNumber = component.long_name;
        }
        if (component.types.includes('route')) {
          streetName = component.long_name;
        }
        if (
          component.types.includes('locality') ||
          component.types.includes('postal_town')
        ) {
          city = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
          state = component.long_name;
        }
        if (component.types.includes('postal_code')) {
          zipCode = component.long_name;
        }
      });

      const address = streetNumber
        ? `${streetNumber} ${streetName}`.trim()
        : streetName || suggestion.description;

      onChangeText(address);
      onSelectPlace({
        address,
        city,
        state,
        zipCode,
        fullAddress: details?.formatted_address || suggestion.description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.inputWrapper, error && styles.errorBorder]}>
        <TextInput
          value={value}
          placeholder="Address"
          placeholderTextColor={colors.textSecondary}
          onChangeText={text => {
            setIsFocused(true);
            onChangeText(text);
          }}
          onFocus={() => setIsFocused(true)}
          autoCorrect={false}
          autoCapitalize="none"
          style={styles.input}
        />
        {value ? (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.clearButton}
            onPress={() => {
              onChangeText('');
              setSuggestions([]);
            }}>
            <Icon name="close-circle" size={ms(20)} color={colors.placeholder} />
          </TouchableOpacity>
        ) : null}
        {isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      </View>
      {error ? (
        <AppText title={error} color="error" fontySize="px12" marginTop={4} />
      ) : null}
      {isFocused && suggestions.length ? (
        <ScrollView
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          style={styles.suggestions}>
          {suggestions.map(suggestion => (
            <TouchableOpacity
              key={suggestion.place_id}
              activeOpacity={0.8}
              style={styles.suggestionItem}
              onPress={() => handleSelectPlace(suggestion)}>
              <AppText
                title={suggestion.description}
                fontySize="px14"
                color="textPrimary"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
};

export default GooglePlaceAutoComplete;

const styles = StyleSheet.create({
  container: {
    zIndex: 20,
  },
  inputWrapper: {
    minHeight: vs(46),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: ms(5),
    backgroundColor: colors.white,
    paddingHorizontal: scale(12),
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: vs(44),
    color: colors.textPrimary,
    fontSize: ms(14),
    paddingVertical: 0,
  },
  clearButton: {
    paddingHorizontal: scale(6),
  },
  errorBorder: {
    borderColor: colors.error,
  },
  suggestions: {
    maxHeight: vs(260),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: ms(5),
    backgroundColor: colors.white,
    marginTop: vs(4),
  },
  suggestionItem: {
    minHeight: vs(56),
    justifyContent: 'center',
    paddingHorizontal: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
