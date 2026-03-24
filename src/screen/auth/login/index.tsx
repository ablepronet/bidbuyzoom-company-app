import { Platform, StyleSheet, Text, View } from 'react-native';
import React, { useRef } from 'react';
import globalStyles from '../../../styles/globalStyles';
import { scale, vs } from '../../../utils/responsive';
import { appString, colors } from '../../../constants';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ImageComponent } from '../../../components/AppImage';
import appImages from '../../../constants/appImages';
import { Screen } from '../../../components/Screen';
import { AppText } from '../../../components/AppText';
import { Formik } from 'formik';
import { ValidationSchemas } from '../../../helper/validation';
import { AppInput } from '../../../components/AppInput';
import AppButton from '../../../components/appButton';
import AppPressable from '../../../components/appPressable';
import { useNavigation } from '@react-navigation/native';
import { routes } from '../../../navigation/route';
import { useLogin } from '../../../services/queries/auth/login';
import {
  setIsLogin,
  setTokens,
  setUserData,
  setUserId,
} from '../../../redux/slices/auth';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
const Login = () => {
  const navigation = useNavigation<any>();
  const { mutate: login, isPending } = useLogin();
  const { loginValidation } = ValidationSchemas();
  const emailRef = useRef<any>(null);
  const { token } = useAppSelector(state => state.auth);
  const passwordRef = useRef<any>(null);
  const dispatch = useAppDispatch();
  const onEmailSubmit = (values: { email: string; password: string }) => {
    const body = {
      email: values.email.trim(),
      password: values.password.trim(),
      recaptchaToken: null,
      customR: '',
    };
    login(body, {
      onSuccess: res => {
        console.log(res, 'Login response');
        if (res?.status) {
          dispatch(setTokens(res?.token || null));
          dispatch(setUserId(res?.data?._id));
          dispatch(setUserData(res?.data || null));
          dispatch(setIsLogin(true));
        }
      },
    });
  };

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
              title={appString.login.title}
              textAlign="center"
              fontySize="px20"
              fontFamily="bold"
              color="backgroundDark"
            />
            <AppText
              title={appString.login.subtitle}
              textAlign="center"
              fontySize="px14"
              fontFamily="medium"
              color="darkGray"
            />
          </View>
          <View style={styles.formContainer}>
            <Formik
              initialValues={{
                email: '',
                password: '',
              }}
              validationSchema={loginValidation}
              onSubmit={onEmailSubmit}
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
                    ref={emailRef}
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
                    onSubmitEditing={() => {
                      passwordRef.current?.focus();
                    }}
                  />

                  <AppInput
                    ref={passwordRef}
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
                  <View style={styles.forgotPasswordContainer}>
                    {/* <AppCheckbox
                      value={rememberMe}
                      onChange={val => dispatch(setRememberMe(val))}
                      label={appString.login.rememberMe}
                      containerStyle={{ marginTop: vs(10) }}
                    /> */}
                    <AppPressable
                      onPress={() => {
                        navigation.navigate(routes.ForgotPass);
                      }}
                    >
                      <AppText
                        title={appString.login.forgotPassword}
                        fontySize="px16"
                        color="primary"
                        fontFamily="medium"
                        marginTop={vs(5)}
                      />
                    </AppPressable>
                  </View>

                  <AppButton
                    title={appString.login.continue}
                    onPress={handleSubmit}
                    style={{ marginTop: vs(20) }}
                    loading={isPending}
                  />
                </>
              )}
            </Formik>
            <View style={styles.signupContainer}>
              <AppText
                title={appString.login.noAccount}
                color="darkGray"
                fontySize="px16"
                fontFamily="medium"
                textAlign="center"
              />
              <AppPressable onPress={() => navigation.navigate(routes.SignUp)}>
                <AppText
                  title={appString.login.signUp}
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

export default Login;

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
  screenContainer: {
    justifyContent: 'center',
  },
  headerContainer: {
    gap: vs(10),
  },
  formContainer: {
    marginTop: vs(30),
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
  },
  continueButton: {
    marginTop: vs(20),
  },
  signupContainer: {
    marginTop: vs(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(5),
  },
});
