import {useMutation} from '@tanstack/react-query';
import {post} from '../../../api';
import {apiEndPoints} from '../../../../constants';
import AppToast from '../../../../components/toaster';

type SaleInformationPayload = {
  payload: FormData;
};

type SaleImagesPayload = {
  payload: FormData;
};

type SaleSettingPayload = {
  payload: Record<string, any>;
};

const getErrorMessage = (error: any) =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.message ||
  'Something went wrong please try after sometime';

export const useAddSaleInformation = () => {
  return useMutation({
    mutationFn: ({payload}: SaleInformationPayload) => {
      return post(apiEndPoints.sale, payload, 1);
    },
    onError: (error: any) => {
      AppToast.error(getErrorMessage(error));
    },
  });
};

export const useAddSaleImages = () => {
  return useMutation({
    mutationFn: ({payload}: SaleImagesPayload) => {
      return post(apiEndPoints.saleImages, payload, 1);
    },
    onError: (error: any) => {
      AppToast.error(getErrorMessage(error));
    },
  });
};

export const useSaveSaleSetting = () => {
  return useMutation({
    mutationFn: ({payload}: SaleSettingPayload) => {
      return post(apiEndPoints.saleSetting, payload);
    },
    onError: (error: any) => {
      AppToast.error(getErrorMessage(error));
    },
  });
};
