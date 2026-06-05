import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '../../../api';
import apiEndPoints from '../../../../constants/apiConstant';
import AppToast from '../../../../components/toaster';

export interface PlanFeature {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlanFee {
  type: string;
  amount: number;
  _id: string;
}

export interface PricingPlan {
  _id: string;
  planName: string;
  description: string;
  upfrontFee: string;
  amount: string;
  priceType: string;
  fees: PlanFee[];
  period: 'Monthly' | 'Yearly' | 'Lifetime';
  featuresIds: PlanFeature[];
  isActive: boolean;
  isDeleted: boolean;
  yearlyDiscountPercent: number;
  isTrialAvailable: boolean;
  trialDays: number;
  isPopular: boolean;
  renewalNote: string;
  stripePriceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillingSummary {
  currentPlan: any | null;
  subscriptionStatus: string;
  isOnTrial: boolean;
  nextBillingDate?: string;
  lastBillingDate?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePaymentMethodId?: string;
  lastPlanPaymentIntentId?: string;
  trialEndDate?: string;
}

export const useGetBillingSummary = () => {
  return useQuery<BillingSummary>({
    queryKey: ['billingSummary'],
    queryFn: async () => {
      const res = await get(apiEndPoints.billingSummary);
      return res?.data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetPricing = () => {
  return useQuery<PricingPlan[]>({
    queryKey: ['pricing'],
    queryFn: async () => {
      try {
        // Try relative to BASE_URL (which resolves to api/pricing or api/../pricing depending on setting)
        const res = await get(apiEndPoints.pricing);
        if (res && res.status && res.data && res.data.length > 0) {
          return res.data;
        }
      } catch (e) {
        console.log('Failed fetching pricing from relative endpoint:', e);
      }

      // Try absolute fallback URL at root /pricing (without api/ prefix)
      try {
        const resAbsolute = await get('https://staging-api.bidbuyzoom.com/pricing');
        if (resAbsolute && resAbsolute.data) {
          return resAbsolute.data;
        }
      } catch (e) {
        console.log('Failed fetching pricing from absolute fallback root endpoint:', e);
      }

      return [];
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};

export interface SelectPlanPayload {
  companyId: string;
  planId: string;
  startTrial: boolean;
  trialDays: number;
}

export const useSubscribePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SelectPlanPayload) => {
      const res = await post('select-plan', payload);
      return res;
    },
    onSuccess: (data) => {
      AppToast.success(data?.message || 'Subscribed successfully!');
      queryClient.invalidateQueries({ queryKey: ['billingSummary'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error: any) => {
      AppToast.error(error?.message || 'Checkout failed. Please try again.');
    },
  });
};

export interface StripeConfig {
  configured: boolean;
  publishableKey: string;
  source: string;
}

export const useGetStripeConfig = () => {
  return useQuery<StripeConfig>({
    queryKey: ['stripeConfig'],
    queryFn: async () => {
      const res = await get(apiEndPoints.stripeConfig);
      return res?.data;
    },
    retry: false,
  });
};

export interface PaymentCard {
  _id: string;
  lastFourDigit: string;
  cardType: string;
  cardHolderName: string;
  isDefault: boolean;
}

export interface GetPaymentCardsResponse {
  status: boolean;
  data: PaymentCard[];
  pages: number;
}

export const useGetPaymentCards = (page: number = 1, perPage: number = 20) => {
  return useQuery<GetPaymentCardsResponse>({
    queryKey: ['paymentCards', page, perPage],
    queryFn: async () => {
      const res = await get(`${apiEndPoints.getPaymentCards}?page=${page}&perPage=${perPage}`);
      return res;
    },
    retry: false,
  });
};

export interface AddCardPayload {
  tokenId: string;
  lastFourDigit: string;
  cardType: string;
  cardHolderName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  bussinessAddress: string;
  bussinessCity: string;
  bussinessState: string;
  bussinessZipCode: string;
  isDefault: boolean;
}

export const useAddCardPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AddCardPayload) => {
      const res = await post(apiEndPoints.addCardPayment, payload);
      return res;
    },
    onSuccess: (data) => {
      AppToast.success(data?.message || 'Card linked successfully!');
      queryClient.invalidateQueries({ queryKey: ['paymentCards'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['billingSummary'] });
    },
    onError: (error: any) => {
      AppToast.error(error?.message || 'Failed to add card. Please try again.');
    },
  });
};

export const useDeleteCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await post(apiEndPoints.deleteCard, { id });
      return res;
    },
    onSuccess: (data) => {
      AppToast.success(data?.message || 'Card deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['paymentCards'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['billingSummary'] });
    },
    onError: (error: any) => {
      AppToast.error(error?.message || 'Failed to delete card.');
    },
  });
};
