import { useMutation } from '@tanstack/react-query';
import { post } from '../../../api';
import { apiEndPoints } from '../../../../constants';
import { Platform } from 'react-native';
import AppToast from '../../../../components/toaster';
import HandleApiCatch from '../../../../helper/handleCatch';

type LoginPayload = {
  email: string;
  password?: string;
  recaptchaToken?: null | undefined;
  customR?: string;
  fcmToken?: string | null;
  platform?: string;
};

export const useLogin = () => {
  return useMutation({
    mutationFn: (payload: LoginPayload) => {
      return post(apiEndPoints.login, payload, 1);
    },
    onSuccess: res => {
      if (res?.message) {
        const toastType = res?.status === false ? 'error' : 'success';
        AppToast[toastType](res?.message);
      }
    },

    onError: (error: any) => {
      console.log(error, 'errorororooror 12321');
      const err =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Something went wrong please try after sometime';
      // console.log(err, 'errorororooror');
      AppToast.error(err);
      // HandleApiCatch(err);
    },
  });
};
