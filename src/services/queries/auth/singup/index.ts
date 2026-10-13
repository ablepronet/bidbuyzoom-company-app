import { useMutation } from '@tanstack/react-query';
import { post } from '../../../api';
import { apiEndPoints } from '../../../../constants';
import AppToast from '../../../../components/toaster';
import HandleApiCatch from '../../../../helper/handleCatch';

type SignupPayload = {
  company_name?: string;
  company_url: string;
  email?: string;
  firstName?: string | undefined;
  lastName?: string;
  password?: string;
  phone?: string;
  recaptchaToken?: string;
  fcmToken?: string | null;
  platform?: string;
};

export const useSingUP = () => {
  return useMutation({
    mutationFn: (payload: SignupPayload) => {
      return post(apiEndPoints.signup, payload);
    },
    onSuccess: res => {
      if (res?.message) {
        AppToast.success(res?.message);
      }
    },

    onError: (error: any) => {
      const err =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong please try after sometime';
      // console.log(err, 'errorororooror');
      AppToast.error(err);
      // HandleApiCatch(err);
    },
  });
};
