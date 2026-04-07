import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import {StyleSheet, TextInput, View, TextInputProps} from 'react-native';
import AppPressable from './appPressable';
import {appIcons, colors} from '../constants';
import {scale, vs} from '../utils/responsive';
import {AppText} from './AppText';
import {ImageComponent} from './AppImage';

export interface AppInputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
}

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  secure?: boolean;
  rightIcon?: any;
  showRightIcon?: boolean;
  onPressIcon?: () => void;
  maxLength?: number;
  placeholder?: string;
  isBlur?: boolean;
  required?: boolean;
}

export const AppInput = forwardRef<AppInputRef, AppInputProps>(
  (
    {
      label,
      error,
      secure = false,
      rightIcon,
      showRightIcon = false,
      onPressIcon,
      maxLength = 50,
      placeholder,
      style,
      isBlur = false,
      required = false,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<TextInput>(null);
    const [isSecure, setIsSecure] = useState<boolean>(secure);
    // const {t} = useTranslation();
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: () => inputRef.current?.clear(),
    }));

    const toggleSecure = () => {
      setIsSecure(prev => !prev);
    };

    return (
      <View style={styles.container}>
        {label && (
          <View style={styles.labelContainer}>
            <AppText
              title={label}
              fontFamily="medium"
              marginBottom={8}
              fontySize="px14"
            />
            {required && (
              <AppText
                title="*"
                fontFamily="medium"
                marginBottom={8}
                fontySize="px14"
                color="dangerToastText"
              />
            )}
          </View>
        )}

        <View
          style={[
            styles.inputWrapper,
            error && styles.errorBorder,
            isBlur && styles.disabledWrapper,
          ]}>
          <TextInput
            key={secure ? String(isSecure) : 'normal'}
            ref={inputRef}
            placeholder={placeholder}
            {...props} // ✅ spread FIRST
            style={[styles.input, style]}
            placeholderTextColor={colors.textSecondary}
            secureTextEntry={secure ? isSecure : false}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={maxLength}
            {...props}
          />

          {secure ? (
            <AppPressable onPress={toggleSecure} style={styles.eyeButton}>
              <ImageComponent
                source={isSecure ? appIcons.black.hidden : appIcons.black.eye}
                style={styles.eyeIcon}
              />
            </AppPressable>
          ) : showRightIcon && rightIcon ? (
            <AppPressable onPress={onPressIcon} style={styles.rightIconWrapper}>
              <ImageComponent source={rightIcon} style={styles.rightIcon} />
            </AppPressable>
          ) : null}
        </View>

        {error && (
          <AppText title={error} color="error" fontySize="px14" marginTop={4} />
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    marginBottom: vs(10),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: scale(5),
    paddingHorizontal: scale(12),
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    height: vs(48),
    color: colors.dark,
    fontSize: scale(16),
  },
  eyeButton: {
    padding: scale(6),
  },
  eyeIcon: {
    height: vs(20),
    width: vs(20),
    tintColor: colors.textSecondary,
  },
  errorBorder: {
    borderColor: colors.error,
  },
  rightIconWrapper: {
    paddingLeft: scale(6),
  },

  rightIcon: {
    height: vs(20),
    width: vs(20),
    tintColor: colors.textSecondary,
  },
  disabledWrapper: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(2),
  },
});
