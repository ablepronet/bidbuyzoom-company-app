import {useMutation} from '@tanstack/react-query';
import {post} from '../../../api';
import {apiEndPoints} from '../../../../constants';
import AppToast from '../../../../components/toaster';
import HandleApiCatch from '../../../../helper/handleCatch';

interface MobileBulkUploadPayload {
  payload: FormData;
}

export const useImportImages = () => {
  return useMutation({
    mutationFn: ({payload}: MobileBulkUploadPayload) => {
      return post(apiEndPoints.mobileBulkUpload, payload, 1);
    },

    onSuccess: res => {
      if (res?.message) {
        const toastType = res?.status === false ? 'error' : 'success';
        AppToast[toastType](res?.message);
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
    },
  });
};