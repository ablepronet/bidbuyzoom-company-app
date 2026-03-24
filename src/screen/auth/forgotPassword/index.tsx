import { StyleSheet, View, Alert } from 'react-native';
import React, { useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';

import globalStyles from '../../../styles/globalStyles';
import { ms, scale, vs } from '../../../utils/responsive';
import { appIcons, appString, colors } from '../../../constants';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ImageComponent } from '../../../components/AppImage';
import appImages from '../../../constants/appImages';
import { Screen } from '../../../components/Screen';
import { AppText } from '../../../components/AppText';
import { AppInput } from '../../../components/AppInput';
import AppButton from '../../../components/appButton';
import AppPressable from '../../../components/appPressable';
import { routes } from '../../../navigation/route';
import { ValidationSchemas } from '../../../helper/validation';
import { useForgotPassword } from '../../../services/queries/auth/forgotPassword';
const ForgotPassword = () => {
  const { forgotPasswordValidation } = ValidationSchemas();
  const { mutate: forgotPassword, isPending } = useForgotPassword();
  const navigation = useNavigation<any>();
  const [isLinkSent, setIsLinkSent] = useState(false);
  const emailRef = useRef<any>(null);

  const handleSendResetLink = async (values: { email: string }) => {
    try {
      const body = {
        email: values.email.trim(),
      };
      forgotPassword(body, {
        onSuccess: res => {
          console.log(res, 'Forgot password response');
          setIsLinkSent(true);
        },
      });
      //
    } catch (error) {
      Alert.alert('Error', 'Failed to send reset link. Please try again.');
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const handleSignIn = () => {
    navigation.goBack();
  };

  // Render link sent success UI
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
              <ImageComponent
                source={appImages.splashLogo}
                style={styles.headerImage}
                resizeMode="contain"
              />
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
                title={appString.forgotPassword?.linkSentTitle}
                textAlign="center"
                fontySize="px24"
                fontFamily="bold"
                color="backgroundDark"
                marginTop={vs(20)}
              />
              <AppText
                title={
                  appString.forgotPassword?.linkSentMessage ||
                  'A password reset link has been sent to your email. Please check your inbox.'
                }
                textAlign="center"
                fontySize="px14"
                fontFamily="medium"
                color="darkGray"
                marginTop={vs(12)}
              />
            </View>

            <View style={styles.formContainer}>
              <AppButton
                title={appString.forgotPassword?.close || 'Close'}
                onPress={handleClose}
                style={styles.closeButton}
              />
            </View>
          </Screen>
        </KeyboardAwareScrollView>
      </View>
    );
  }

  // Render forgot password form UI
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
            <ImageComponent
              source={appImages.splashLogo}
              style={styles.headerImage}
              resizeMode="contain"
            />
            <AppText
              title={appString.forgotPassword?.title || 'Forgot Password'}
              textAlign="center"
              fontySize="px24"
              fontFamily="bold"
              color="backgroundDark"
              marginTop={vs(20)}
            />
            <AppText
              title={
                appString.forgotPassword?.subtitle ||
                'Enter your email to receive a reset link'
              }
              textAlign="center"
              fontySize="px14"
              fontFamily="medium"
              color="darkGray"
              marginTop={vs(12)}
            />
          </View>

          <View style={styles.formContainer}>
            <Formik
              initialValues={{
                email: '',
              }}
              validationSchema={forgotPasswordValidation}
              onSubmit={handleSendResetLink}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                isSubmitting,
              }) => (
                <>
                  <AppInput
                    ref={emailRef}
                    label={
                      appString.forgotPassword?.emailLabel || 'Email address'
                    }
                    placeholder={appString.forgotPassword?.emailPlaceholder}
                    keyboardType="email-address"
                    returnKeyType="done"
                    required={true}
                    blurOnSubmit={false}
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    error={touched.email ? errors.email : undefined}
                    onSubmitEditing={() => {
                      handleSubmit();
                    }}
                  />

                  <AppButton
                    title={
                      appString.forgotPassword?.sendResetLink ||
                      'Send Reset Link'
                    }
                    onPress={handleSubmit}
                    style={styles.sendButton}
                    loading={isSubmitting || isPending}
                    disabled={isSubmitting}
                  />

                  <View style={styles.signInContainer}>
                    <AppText
                      title={
                        appString.forgotPassword?.rememberPassword ||
                        'Remember your password?'
                      }
                      color="darkGray"
                      fontySize="px14"
                      fontFamily="medium"
                      textAlign="center"
                    />
                    <AppPressable onPress={handleSignIn}>
                      <AppText
                        title={appString.forgotPassword?.signIn || 'Sign In'}
                        color="primary"
                        fontySize="px14"
                        fontFamily="medium"
                        textAlign="center"
                      />
                    </AppPressable>
                  </View>
                </>
              )}
            </Formik>
          </View>
        </Screen>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  headerImage: {
    height: vs(50),
    width: '100%',
    resizeMode: 'contain',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  headerContainer: {
    gap: vs(8),
  },
  formContainer: {
    marginTop: vs(30),
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
