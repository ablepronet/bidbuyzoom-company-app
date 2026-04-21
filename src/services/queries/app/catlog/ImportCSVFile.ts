// services/queries/app/catalog/useUploadLotCSV.ts

import {useMutation} from '@tanstack/react-query';
import {post} from '../../../api';
import {apiEndPoints} from '../../../../constants';
import AppToast from '../../../../components/toaster';
import HandleApiCatch from '../../../../helper/handleCatch';

interface UploadLotCSVPayload {
  payload: FormData;
}

export const useUploadLotCSV = () => {
  return useMutation({
    mutationFn: ({payload}: UploadLotCSVPayload) => {
      return post(apiEndPoints.lotImport, payload, 1); 
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