import {StyleSheet, View, TextInput} from 'react-native';
import React, {useState, useRef, useEffect, useMemo} from 'react';

import {ImageComponent} from '../../../components/AppImage';
import appImages from '../../../constants/appImages';
import {AppText} from '../../../components/AppText';

import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {Screen} from '../../../components/Screen';
import {useNavigation, useRoute} from '@react-navigation/native';
import {scale, vs, ms, mvs} from '../../../utils/responsive';
import Card from '../../../components/Card';
import {useAppDispatch} from '../../../redux/hooks';
import {
  setIsLogin,
  setRememberData,
  setTokens,
  setUserData,
  setUserId,
} from '../../../redux/slices/auth';
import {colors} from '../../../constants';
import AppButton from '../../../components/appButton';
import {useVerification} from '../../../services/queries/auth/verification';

const OTP_LENGTH = 6;
const RESEND_TIME = 120;

interface OTPVerifyParams {
  userDetails: {
    phoneLast4?: string;
    tempToken?: string;
  };
  email?: string;
  password?: string;
  rememberMe?: boolean;
}

const Verification = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const route = useRoute();
  const {userDetails, email, password, rememberMe} =
    (route.params as OTPVerifyParams) || {};
  const {mutate: VerificationOTP, isPending} = useVerification();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputs = useRef<TextInput[]>([]);

  const otpValue = useMemo(() => otp.join(''), [otp]);

  const handleVerifyOtp = () => {
    if (otpValue.length !== OTP_LENGTH) return;

    const body = {
      code: otpValue,
      tempToken: userDetails?.tempToken,
    };

    VerificationOTP(body, {
      onSuccess: res => {
        console.log(res, 'response');
        dispatch(setTokens(res?.token || null));
        dispatch(setUserId(res?.data?._id));
        dispatch(setUserData(res?.data || null));
        dispatch(setIsLogin(true));
        dispatch(
          setRememberData({
            email: email || '',
            password: password || '',
            rememberMe: rememberMe || false,
          }),
        );
      },
    });
  };

  const handleChange = (text: string, index: number) => {
    // Handle paste (e.g., "123456")
    if (text.length > 1) {
      const digits = text.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
      const newOtp = [...otp];

      digits.forEach((digit, i) => {
        newOtp[i] = digit;
      });

      setOtp(newOtp);

      if (digits.length === OTP_LENGTH) {
        inputs.current[OTP_LENGTH - 1]?.blur();
      }
      return;
    }

    if (!/^\d?$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }

    // Auto-submit when last digit entered
    if (text && index === OTP_LENGTH - 1) {
      inputs.current[index]?.blur();
    }
  };

  const handleBackspace = (index: number) => {
    if (index > 0 && !otp[index]) {
      inputs.current[index - 1]?.focus();
    }
  };

  const isComplete = otp.every(v => v.length === 1);

  const handleGoback = () => {
    navigation.goBack();
  };

  return (
    <Screen style={styles.container}>
      <KeyboardAwareScrollView
        bottomOffset={scale(100)}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* <View style={styles.innerContainer}> */}
        <Card style={styles.card}>
          <ImageComponent
            source={appImages.splashLogo}
            style={styles.logo}
            resizeMode="contain"
          />

          <AppText
            title="Verification Code"
            fontFamily="bold"
            fontySize="px24"
            style={styles.title}
          />

          <AppText
            title={`Enter the 6-digit code sent to your phone ending in ${
              userDetails.phoneLast4 ?? ''
            }`}
            fontySize="px14"
            color="textSecondary"
            textAlign="center"
            style={styles.subtitle}
          />

          {/* OTP Inputs */}
          <View style={styles.otpContainer}>
            {otp.map((value, index) => (
              <TextInput
                key={index}
                ref={ref => {
                  if (ref) inputs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  focusedIndex === index && styles.otpFocused,
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={value}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                onChangeText={text => handleChange(text, index)}
                onKeyPress={({nativeEvent}) =>
                  nativeEvent.key === 'Backspace' && handleBackspace(index)
                }
                autoFocus={index === 0}
              />
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <AppButton
              title="Back"
              textColor="textPrimary"
              style={styles.backButton}
              onPress={handleGoback}
              bgColor="background"
            />
            <AppButton
              title="Verify"
              style={styles.button}
              disabled={!isComplete}
              onPress={handleVerifyOtp}
              loading={isPending}
            />
          </View>
        </Card>
        {/* </View> */}
      </KeyboardAwareScrollView>
    </Screen>
  );
};

export default Verification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: scale(140),
    height: vs(80),
    marginBottom: vs(16),
    alignSelf: 'center',
  },
  title: {
    marginBottom: vs(8),
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: vs(24),
    textAlign: 'center',
  },
  card: {},
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginTop: vs(8),
    // marginBottom: vs(24),
    alignSelf: 'center',
  },
  otpInput: {
    width: ms(40),
    height: ms(50),
    borderRadius: ms(5),
    borderWidth: scale(1),
    borderColor: colors.border,
    textAlign: 'center',
    fontSize: ms(20),
    marginHorizontal: scale(6),
    color: colors.textPrimary,
    backgroundColor: colors.white,
    padding: 0,
  },
  otpFilled: {
    borderColor: colors.blue,
  },
  button: {
    marginTop: vs(16),
    borderRadius: ms(10),
    width: '49%',
  },
  backButton: {
    marginTop: vs(16),
    borderRadius: ms(10),
    width: '49%',
    borderWidth: scale(1),
    borderColor: colors.darkGray,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: vs(20),
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: vs(5),
  },
  otpFocused: {
    borderColor: colors.blue || '#3B82F6',
    borderWidth: 2,
  },
});
