import {useQuery} from '@tanstack/react-query';
import {get} from '../../../api';
import apiEndPoints from '../../../../constants/apiConstant';

export type DefaultSetting = {
  commission?: string;
  minCommission?: string;
  buyerPremium?: string;
  saleTax?: string;
  creditCardFees?: string;
  buyBackSurcharge?: string;
  internationalBidder?: string;
  defaultPhoneNo?: string;
  defaultEmail?: string;
  bidderApprovel?: string;
  requireBidApprovalAmount?: number;
  variedCommissionDefaultCheck?: string;
  variedCommissionIncrements?: Array<{
    from?: number;
    to?: number;
    increments?: number;
    defaultFrom?: number | null;
    defaultTo?: number | null;
    defaultIncrements?: number | null;
    _id?: string;
  }>;
  bidHistory?: string;
  terms?: string;
  description?: string;
  paymentOption?: string[];
  isLocation?: string;
  defaultAddress?: string;
  defaultState?: string;
  defaultCity?: string;
  defaultZipCode?: string;
  restrictBiddersState?: string[];
  isReceiveCompany?: boolean;
  isReceiveSale?: boolean;
  extensionMin?: string;
  extensionLastMin?: string;
  stagerredMin?: string;
  stagerredSec?: string;
  variedCommission?: any[];
  staggeredEnding?: {
    enabled?: boolean;
    intervalSeconds?: number;
    lotsPerInterval?: number;
  };
  bidExtension?: {
    enabled?: boolean;
    durationMinutes?: number;
    triggerWindowMinutes?: number;
  };
};

export const useGetDefaultSetting = () => {
  return useQuery({
    queryKey: ['defaultSetting'],
    queryFn: async () => {
      const res = await get(apiEndPoints.defaultSetting);
      return res;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};
