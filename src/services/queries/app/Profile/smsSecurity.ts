import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post } from '../../../api';
import apiEndPoints from '../../../../constants/apiConstant';
import AppToast from '../../../../components/toaster';

const getErrorMessage = (error: any) =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.message ||
  'Something went wrong. Please try again.';

export interface Toggle2FAPayload {
  is2FAEnabled: boolean;
  is2FAForBidders: boolean;
}

export interface ToggleSmsSettingsPayload {
  isSmsEnabled: boolean;
  smsNotificationTypes: {
    outbid: boolean;
    wonLot: boolean;
    invoiceReady: boolean;
    paymentConfirmation: boolean;
    auctionReminder: boolean;
  };
}

export const useToggle2FA = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Toggle2FAPayload) => {
      const res = await post(apiEndPoints.toggle2FA, payload);
      return res;
    },
    onSuccess: (data) => {
      AppToast.success(data?.message || 'Security settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error: any) => {
      AppToast.error(getErrorMessage(error));
    },
  });
};

export const useToggleSmsSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ToggleSmsSettingsPayload) => {
      const res = await post(apiEndPoints.toggleSmsSettings, payload);
      return res;
    },
    onSuccess: (data) => {
      AppToast.success(data?.message || 'SMS settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error: any) => {
      AppToast.error(getErrorMessage(error));
    },
  });
};
