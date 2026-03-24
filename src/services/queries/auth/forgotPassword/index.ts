import { useMutation } from '@tanstack/react-query';
import { post } from '../../../api';
import { apiEndPoints } from '../../../../constants';
import { Platform } from 'react-native';
import AppToast from '../../../../components/toaster';
import HandleApiCatch from '../../../../helper/handleCatch';

type forgotPasswordPayload = {
  email: string;
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (payload: forgotPasswordPayload) => {
      return post(apiEndPoints.forgotPassword, payload, 1);
    },
    onSuccess: res => {
      if (res?.message) {
        AppToast.success(res?.message);
      }
    },

    onError: err => {
      HandleApiCatch(err);
    },
  });
};
