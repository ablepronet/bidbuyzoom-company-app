import {useMutation} from '@tanstack/react-query';
import {post} from '../../../api';
import HandleApiCatch from '../../../../helper/handleCatch';
import {apiEndPoints} from '../../../../constants';
import AppToast from '../../../../components/toaster';

type ResendEmailOtp = {
  email: string;
};

export const useResendEmailOtp = () => {
  return useMutation({
    mutationFn: (payload: ResendEmailOtp) => {
      return post(`${apiEndPoints.resendEmailOtp}`, payload);
    },

    onSuccess: res => {
      if (res?.message) {
        AppToast.success(res.message);
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
