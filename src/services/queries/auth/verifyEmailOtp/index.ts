import {useMutation} from '@tanstack/react-query';
import {post} from '../../../api';
import HandleApiCatch from '../../../../helper/handleCatch';
import {apiEndPoints} from '../../../../constants';
import AppToast from '../../../../components/toaster';

type VerifyEmailOtp = {
  email: string;
  otp: string;
};

export const useVerifyEmailOtp = () => {
  return useMutation({
    mutationFn: (payload: VerifyEmailOtp) => {
      return post(`${apiEndPoints.verifyEmailOtp}`, payload);
    },

    onSuccess: res => {
      if (res?.message) {
        AppToast.success(res.message);
      }
    },

    onError: err => {
      HandleApiCatch(err);
    },
  });
};
