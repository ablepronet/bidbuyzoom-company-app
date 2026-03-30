import { StyleSheet } from 'react-native';
import React from 'react';
import { authStackParamsList } from '../navigationTypes';
import { colors } from '../../constants';
import { routes } from '../route';
import Login from '../../screen/auth/login';
import SignUp from '../../screen/auth/signup';
import ForgotPassword from '../../screen/auth/forgotPassword';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Verification from '../../screen/auth/Verification';

const Stack = createNativeStackNavigator<authStackParamsList>();
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    //   initialRouteName={routes.WelcomeScreen}
    >
      <Stack.Screen name={routes.LoginScreen} component={Login} />
      <Stack.Screen name={routes.OtpVerification} component={Verification} />
      <Stack.Screen name={routes.SignUp} component={SignUp} />
      <Stack.Screen name={routes.ForgotPass} component={ForgotPassword} />
    </Stack.Navigator>
  );
};

export default AuthStack;

const styles = StyleSheet.create({});
