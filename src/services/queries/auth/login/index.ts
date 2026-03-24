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

    onError: err => {
      HandleApiCatch(err);
    },
  });
};
