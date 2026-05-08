import React from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {AppText} from '../AppText';
import {colors} from '../../constants';
import {ms, scale, vs} from '../../utils/responsive';

export const FieldLabel = ({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) => (
  <View style={styles.labelRow}>
    <AppText title={label} fontySize="px12" fontFamily="medium" />
    {required ? (
      <AppText
        title=" *"
        fontySize="px12"
        fontFamily="medium"
        color="primary"
      />
    ) : null}
  </View>
);

export const ErrorText = ({error}: {error?: string}) =>
  error ? (
    <AppText title={error} color="error" fontySize="px12" marginTop={vs(4)} />
  ) : null;

export const TextInputField = ({
  label,
  value,
  placeholder,
  required,
  error,
  multiline,
  maxLength,
  onChangeText,
  ...props
}: TextInputProps & {
  label: string;
  value: string;
  placeholder: string;
  required?: boolean;
  error?: string;
}) => (
  <View style={styles.field}>
    <FieldLabel label={label} required={required} />
    <TextInput
      value={value}
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondary}
      onChangeText={onChangeText}
      style={[
        styles.input,
        multiline && styles.textArea,
        error && styles.errorBorder,
      ]}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      maxLength={maxLength}
      {...props}
    />
    {maxLength ? (
      <AppText
        title={`${value.length} / ${maxLength} characters`}
        fontySize="px10"
        color="textSecondary"
        textAlign="right"
        marginTop={vs(4)}
      />
    ) : null}
    <ErrorText error={error} />
  </View>
);

export const SelectField = ({
  label,
  value,
  placeholder,
  required,
  error,
  onPress,
  disabled,
  showIcon = true,
}: {
  label: string;
  value: string;
  placeholder: string;
  required?: boolean;
  error?: string;
  onPress?: () => void;
  disabled?: boolean;
  showIcon?: boolean;
}) => (
  <View style={styles.field}>
    <FieldLabel label={label} required={required} />
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.selectBox, error && styles.errorBorder]}
      disabled={disabled}
      onPress={onPress}>
      <AppText
        title={value || placeholder}
        color={value ? 'textPrimary' : 'textSecondary'}
        fontySize="px14"
        numberOfLines={1}
        style={styles.selectText}
      />
      {showIcon ? (
        <Icon name="chevron-down" size={ms(18)} color={colors.textSecondary} />
      ) : null}
    </TouchableOpacity>
    <ErrorText error={error} />
  </View>
);

export const DateTimeField = ({
  label,
  value,
  placeholder,
  mode,
  required,
  error,
  onPress,
}: {
  label: string;
  value: string;
  placeholder: string;
  mode: 'date' | 'time';
  required?: boolean;
  error?: string;
  onPress: () => void;
}) => (
  <View style={styles.field}>
    <FieldLabel label={label} required={required} />
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.selectBox, error && styles.errorBorder]}
      onPress={onPress}>
      <AppText
        title={value || placeholder}
        color={value ? 'textPrimary' : 'textSecondary'}
        fontySize="px14"
        numberOfLines={1}
        style={styles.selectText}
      />
      <Icon
        name={mode === 'date' ? 'calendar-outline' : 'time-outline'}
        size={ms(18)}
        color={colors.textSecondary}
      />
    </TouchableOpacity>
    <ErrorText error={error} />
  </View>
);

export const CheckboxRow = ({
  label,
  selected,
  onPress,
  width = '50%',
  error,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  width?: ViewStyle['width'];
  error?: boolean;
}) => (
  <TouchableOpacity
    activeOpacity={0.8}
    style={[styles.checkboxRow, {width}]}
    onPress={onPress}>
    <View
      style={[
        styles.checkbox,
        selected && styles.checkboxSelected,
        error && styles.errorBorder,
      ]}>
      {selected && <Icon name="checkmark" size={ms(13)} color={colors.white} />}
    </View>
    <AppText
      title={label}
      fontySize="px12"
      color="textPrimary"
      style={styles.flexText}
    />
  </TouchableOpacity>
);

export const RadioRow = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity activeOpacity={0.8} style={styles.radioRow} onPress={onPress}>
    <View style={[styles.radioOuter, selected && styles.radioActive]}>
      {selected && <View style={styles.radioInner} />}
    </View>
    <AppText
      title={label}
      fontySize="px12"
      color="textPrimary"
      style={styles.flexText}
    />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  field: {
    marginBottom: vs(12),
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(6),
  },
  input: {
    minHeight: vs(46),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: ms(5),
    backgroundColor: colors.white,
    color: colors.textPrimary,
    fontSize: ms(14),
    paddingHorizontal: scale(12),
    paddingVertical: vs(10),
  },
  textArea: {
    minHeight: vs(105),
  },
  selectBox: {
    minHeight: vs(46),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: ms(5),
    backgroundColor: colors.white,
    paddingHorizontal: scale(12),
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectText: {
    flex: 1,
    marginRight: scale(8),
  },
  errorBorder: {
    borderColor: colors.error,
  },
  checkboxRow: {
    minHeight: vs(26),
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: scale(8),
    marginBottom: vs(4),
  },
  checkbox: {
    width: ms(17),
    height: ms(17),
    borderRadius: ms(3),
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(7),
  },
  checkboxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  flexText: {
    flex: 1,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(8),
  },
  radioOuter: {
    width: ms(17),
    height: ms(17),
    borderRadius: ms(9),
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(8),
    backgroundColor: colors.white,
  },
  radioActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: ms(9),
    height: ms(9),
    borderRadius: ms(5),
    backgroundColor: colors.primary,
  },
});
