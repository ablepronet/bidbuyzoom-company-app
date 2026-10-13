import { Platform, StyleSheet, Text, View } from 'react-native';
import React, { useRef } from 'react';
import globalStyles from '../../../styles/globalStyles';
import { scale, vs } from '../../../utils/responsive';
import { appIcons, appString, colors } from '../../../constants';
import { ImageComponent } from '../../../components/AppImage';
import appImages from '../../../constants/appImages';
import { Screen } from '../../../components/Screen';
import { AppText } from '../../../components/AppText';
import { Formik } from 'formik';
import { ValidationSchemas } from '../../../helper/validation';
import { AppInput } from '../../../components/AppInput';
import AppButton from '../../../components/appButton';
import AppPressable from '../../../components/appPressable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AppPhoneInput from '../../../components/AppPhoneInput';
import { useNavigation } from '@react-navigation/native';
import { useSingUP } from '../../../services/queries/auth/singup';
import { routes } from '../../../navigation/route';
import { getFCMToken } from '../../../services/notificationService';

const SignUp = () => {
  const navigation = useNavigation<any>();
  const { signUpValidation } = ValidationSchemas();
  const { mutate: signUp, isPending } = useSingUP();
  const instest = useSafeAreaInsets();

  const [countryCode, setCountryCode] = React.useState<any>('US');
  const [callingCode, setCallingCode] = React.useState('1');
  const [isLinkSent, setIsLinkSent] = React.useState(false);
  const [submittedEmail, setSubmittedEmail] = React.useState('');
  const handleCountryChange = (country: any) => {
    setCountryCode(country.code);
    setCallingCode(country.dial_code.replace('+', '') || '');
  };

  const onSignUpSubmit = async (values: {
    firstName: string;
    lastName: string;
    companyName: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    setSubmittedEmail(values.email);
    const fcmToken = await getFCMToken();
    const body = {
      company_name: values.companyName,
      company_url: '',
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      password: values.password,
      phone: values.phone,
      recaptchaToken: '',
      fcmToken: fcmToken || '',
      platform: Platform.OS,
    };
    console.log('📱 [Signup Request Body]:', body);
    signUp(body, {
      onSuccess: res => {
        // Navigate to email verification screen

        if (res?.status) {
          navigation.navigate(routes.OtpVerification, {
            email: values.email,
            isEmailVerification: true,
          });
        }
      },
    });
  };

  const handleClose = () => {
    navigation.goBack();
  };

  if (isLinkSent) {
    return (
      <View style={globalStyles.container}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraScrollHeight={20}
        >
          <Screen
            edges={['bottom']}
            backgroundColor={colors.background}
            style={{ justifyContent: 'center' }}
          >
            <View style={styles.headerContainer}>
              <View
                style={{
                  height: vs(60),
                  width: vs(60),
                  borderRadius: '100%',
                  backgroundColor: colors.ligthGreen,
                  alignSelf: 'center',
                  marginTop: vs(20),
                  justifyContent: 'center',
                }}
              >
                <ImageComponent
                  source={appIcons.green.tickCircle}
                  style={styles.checkIconStyle}
                  resizeMode="contain"
                />
              </View>
              <AppText
                title={appString.signUp?.successFull}
                textAlign="center"
                fontySize="px24"
                fontFamily="bold"
                color="backgroundDark"
                marginTop={vs(10)}
              />
              <AppText
                title={
                  appString.signUp?.linkSentMessage ||
                  'A password reset link has been sent to your email. Please check your inbox.'
                }
                textAlign="center"
                fontySize="px14"
                fontFamily="medium"
                color="darkGray"
              />
              <View
                style={{
                  backgroundColor: '#f3f4f6',
                  alignSelf: 'center',
                  padding: scale(10),
                  borderRadius: scale(5),
                  marginTop: vs(10),
                }}
              >
                <AppText
                  title={submittedEmail || 'Email not submitted'}
                  textAlign="center"
                  fontySize="px14"
                  fontFamily="medium"
                  color="darkGray"
                />
              </View>
              <AppText
                title={
                  appString.signUp?.linkSentMessage2 ||
                  'A password reset link has been sent to your email. Please check your inbox.'
                }
                textAlign="center"
                fontySize="px14"
                fontFamily="medium"
                color="darkGray"
              />
            </View>

            <AppButton
              title={appString.signUp?.continueToLogin || 'Continue to Login'}
              onPress={handleClose}
              style={styles.closeButton}
            />
          </Screen>
        </KeyboardAwareScrollView>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
        <Screen
          edges={['bottom']}
          backgroundColor={colors.background}
          style={{ justifyContent: 'center' }}
        >
          <View
            style={[
              styles.headerContainer,
              {
                marginTop: vs(10) + instest.top,
              },
            ]}
          >
            <ImageComponent
              source={appImages.splashLogo}
              style={styles.headerImage}
              resizeMode="contain"
            />
            <AppText
              title={appString.signUp.title}
              textAlign="center"
              fontySize="px20"
              fontFamily="bold"
              color="backgroundDark"
            />
            <AppText
              title={appString.signUp.subtitle}
              textAlign="center"
              fontySize="px14"
              fontFamily="medium"
              color="darkGray"
            />
          </View>

          <View style={styles.formContainer}>
            <Formik
              initialValues={{
                firstName: '',
                lastName: '',
                companyName: '',
                email: '',
                phone: '',
                password: '',
              }}
              validationSchema={signUpValidation}
              onSubmit={onSignUpSubmit}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <>
                  <AppInput
                    label={appString.signUp.firstName}
                    placeholder={appString.signUp.firstNamePlaceholder}
                    returnKeyType="next"
                    required={true}
                    blurOnSubmit={false}
                    value={values.firstName}
                    onChangeText={handleChange('firstName')}
                    onBlur={handleBlur('firstName')}
                    error={touched.firstName ? errors.firstName : undefined}
                  />

                  <AppInput
                    label={appString.signUp.lastName}
                    placeholder={appString.signUp.lastNamePlaceholder}
                    returnKeyType="next"
                    required={true}
                    blurOnSubmit={false}
                    value={values.lastName}
                    onChangeText={handleChange('lastName')}
                    onBlur={handleBlur('lastName')}
                    error={touched.lastName ? errors.lastName : undefined}
                  />

                  <AppInput
                    label={appString.signUp.companyName}
                    placeholder={appString.signUp.companyNamePlaceholder}
                    returnKeyType="next"
                    required={true}
                    blurOnSubmit={false}
                    value={values.companyName}
                    onChangeText={handleChange('companyName')}
                    onBlur={handleBlur('companyName')}
                    error={touched.companyName ? errors.companyName : undefined}
                  />

                  <AppInput
                    label={appString.login.email}
                    placeholder={appString.login.enterEmail}
                    keyboardType="email-address"
                    returnKeyType="next"
                    required={true}
                    blurOnSubmit={false}
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    error={touched.email ? errors.email : undefined}
                  />

                  <AppPhoneInput
                    label={appString.signUp.phoneLabel}
                    value={values.phone}
                    onChangeText={handleChange('phone')}
                    countryCode={countryCode}
                    callingCode={callingCode}
                    onCountryChange={handleCountryChange}
                    error={touched.phone ? errors.phone : undefined}
                    editable={true}
                  />

                  <AppInput
                    required={true}
                    label={appString.login.password}
                    placeholder={appString.login.passwordPlaceholder}
                    secure
                    returnKeyType="done"
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    error={touched.password ? errors.password : undefined}
                    maxLength={20}
                    onSubmitEditing={() => {
                      handleSubmit();
                    }}
                  />

                  <AppButton
                    title={appString.common.submit}
                    onPress={handleSubmit}
                    style={{ marginTop: vs(20) }}
                    loading={isPending}
                  />
                </>
              )}
            </Formik>

            <View style={styles.loginContainer}>
              <AppText
                title={appString.signUp.alreadyAccount}
                color="darkGray"
                fontySize="px16"
                fontFamily="medium"
                textAlign="center"
              />
              <AppPressable onPress={() => handleClose()}>
                <AppText
                  title={appString.signUp.login}
                  color="primary"
                  fontySize="px14"
                  fontFamily="medium"
                  textAlign="center"
                />
              </AppPressable>
            </View>
          </View>
        </Screen>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  headerImage: {
    height: vs(50),
    width: '100%',
    resizeMode: 'contain',
    marginTop: vs(25),
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  screenContainer: {
    justifyContent: 'center',
  },
  headerContainer: {
    gap: vs(10),
  },
  formContainer: {
    marginTop: vs(30),
  },
  loginContainer: {
    marginTop: vs(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(5),
  },
  sendButton: {
    marginTop: vs(24),
  },
  closeButton: {
    marginTop: vs(24),
  },
  signInContainer: {
    marginTop: vs(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(5),
  },
  footerContainer: {
    marginTop: vs(40),
    marginBottom: vs(20),
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    width: '100%',
  },
  checkIconStyle: {
    height: vs(30),
    width: '100%',
    resizeMode: 'contain',
  },
});
