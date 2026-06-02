import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, deleteApi } from '../../../api';
import apiEndPoints from '../../../../constants/apiConstant';
import AppToast from '../../../../components/toaster';

export interface BidderItem {
  _id: string;
  firstName: string;
  lastName: string;
  type: string;
  date?: string;
  idCode?: string;
  idCodeStatus?: string;
  approval?: string;
  reason?: string;
  companyId?: string;
  biddersCompanyName?: string;
  email: string;
  cellPhone?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  buyerPremiumCheck?: boolean;
  buyerPremiumValue?: string;
  creditCardCheck?: boolean;
  creditCardValue?: string;
  areasOfInterest?: string;
  salesTaxExempt?: string;
  salesTaxState?: string;
  salesTaxValue?: string;
  alsoClientAdd?: string;
  notes?: string;
  notificationOption?: string[];
  status: string;
  isActive: boolean;
  isVerified: boolean;
  isDeleted: boolean;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface BiddersResponse {
  status: boolean;
  data: BidderItem[];
  totalCount: number;
  page: number;
  perPage: number;
  pages: number;
  message: string;
}

export interface GetBiddersParams {
  page: number;
  perPage: number;
  searchItem?: string;
  type?: string;
  status?: string;
}

const getErrorMessage = (error: any) =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.message ||
  'Something went wrong. Please try again later.';

const cleanFormValue = (value: any) => {
  if (value === null || value === undefined || value === 'null' || value === 'undefined') {
    return '';
  }
  return value;
};

const buildBidderFormData = (
  payload: Record<string, any>,
  options?: { id?: string },
) => {
  const formData = new FormData();
  const notificationOption = Array.isArray(payload.notificationOption)
    ? payload.notificationOption.join(',')
    : payload.notificationOption;

  const fields: Record<string, any> = {
    date: payload.date,
    type: payload.type,
    approval: payload.approval,
    status: payload.status,
    firstName: payload.firstName,
    lastName: payload.lastName,
    biddersCompanyName: payload.biddersCompanyName,
    phone: payload.phone,
    cellPhone: payload.cellPhone,
    email: payload.email,
    address: payload.address,
    state: payload.state,
    city: payload.city,
    zipCode: payload.zipCode,
    buyerPremiumCheck: !!payload.buyerPremiumCheck,
    buyerPremiumValue: payload.buyerPremiumValue || '15',
    buyerPremium: payload.buyerPremiumValue || '15',
    creditCardCheck: !!payload.creditCardCheck,
    creditCardValue: payload.creditCardValue,
    creditCardFees: payload.creditCardValue,
    areasOfInterest: payload.areasOfInterest,
    salesTaxExempt: payload.salesTaxExempt,
    salesTaxValue: payload.salesTaxValue,
    salesTaxState: payload.salesTaxState,
    alsoConsignor: payload.alsoClientAdd || 'No',
    notes: payload.notes,
    notificationOption,
    isActive: !!payload.isActive,
  };

  if (options?.id) {
    fields.id = options.id;
    fields.isImage = 'false';
  }

  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, cleanFormValue(value));
  });

  if (payload.documentFile?.uri) {
    formData.append('documentsUploaded', {
      uri: payload.documentFile.uri,
      name: payload.documentFile.name || 'document',
      type: payload.documentFile.type || 'application/octet-stream',
    } as any);
  }

  return formData;
};

export const useGetBidders = (params: GetBiddersParams) => {
  return useQuery<BiddersResponse>({
    queryKey: ['bidders', params],
    queryFn: async () => {
      const res = await get(apiEndPoints.allBidders, params);
      return res;
    },
    retry: false,
    staleTime: 1000 * 60 * 1, // 1 minute stale time
  });
};

export const useAddBidder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const formData = buildBidderFormData(payload);
      const res = await post(apiEndPoints.addBidders, formData, 1);
      if (res && res.status === false) {
        throw new Error(res.message || 'Failed to add bidder');
      }
      return res;
    },
    onSuccess: (data) => {
      AppToast.success(data?.message || 'Bidder added successfully');
      return queryClient.invalidateQueries({ queryKey: ['bidders'] });
    },
    onError: (error: any) => {
      AppToast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateBidder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, any> }) => {
      const formData = buildBidderFormData(payload, { id });
      const res = await post(apiEndPoints.updateBidders, formData, 1);
      if (res && res.status === false) {
        throw new Error(res.message || 'Failed to update bidder');
      }
      return res;
    },
    onSuccess: (data) => {
      AppToast.success(data?.message || 'Bidder updated successfully');
      return queryClient.invalidateQueries({ queryKey: ['bidders'] });
    },
    onError: (error: any) => {
      AppToast.error(getErrorMessage(error));
    },
  });
};

export const useDeleteBidder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteApi(`${apiEndPoints.deleteBidders}/${id}`);
      return res;
    },
    onSuccess: (data) => {
      AppToast.success(data?.message || 'Bidder deleted successfully');
      return queryClient.invalidateQueries({ queryKey: ['bidders'] });
    },
    onError: (error: any) => {
      AppToast.error(getErrorMessage(error));
    },
  });
};

export const useSendBidderEmail = () => {
  return useMutation({
    mutationFn: async ({ ids, subject, message }: { ids: string[]; subject: string; message: string }) => {
      const res = await post(apiEndPoints.biddersEmail, { ids, subject, message });
      if (res && res.status === false) {
        throw new Error(res.message || 'Failed to send email');
      }
      return res;
    },
    onSuccess: (data) => {
      AppToast.success(data?.message || 'Email sent successfully');
    },
    onError: (error: any) => {
      AppToast.error(getErrorMessage(error));
    },
  });
};
