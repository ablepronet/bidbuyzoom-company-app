import {useMutation} from '@tanstack/react-query';
import {post} from '../../../api';
import {apiEndPoints} from '../../../../constants';
import AppToast from '../../../../components/toaster';
import HandleApiCatch from '../../../../helper/handleCatch';

interface UpdateCatalogPayload {
  id: string;
  payload: FormData;
}

export const useUpdateCatalogDataDetails = () => {
  return useMutation({
    mutationFn: ({id, payload}: UpdateCatalogPayload) => {
      return post(`${apiEndPoints.updateCatalogDetails}/${id}`, payload, 1);
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
