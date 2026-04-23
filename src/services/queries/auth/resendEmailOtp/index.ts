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

    onError: err => {
      HandleApiCatch(err);
    },
  });
};
