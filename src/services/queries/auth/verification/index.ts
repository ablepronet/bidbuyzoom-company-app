import {useMutation} from '@tanstack/react-query';
import {post} from '../../../api';
import HandleApiCatch from '../../../../helper/handleCatch';
import {apiEndPoints} from '../../../../constants';
import AppToast from '../../../../components/toaster';

type Verification = {
  code?: string;
  tempToken?: string;
};

export const useVerification = () => {
  return useMutation({
    mutationFn: (payload: Verification) => {
      return post(`${apiEndPoints.verification}`, payload);
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
