import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, deleteApi } from '../../../api';
import apiEndPoints from '../../../../constants/apiConstant';
import AppToast from '../../../../components/toaster';

export interface ClientItem {
  _id: string;
  firstName: string;
  lastName: string;
  type: string;
  date?: string;
  idCode?: string;
  homeAddress?: string;
  homeZipCode?: string;
  homeState?: string;
  homeCity?: string;
  propertyAddress?: string;
  propertyZipCode?: string;
  propertyState?: string;
  propertyCity?: string;
  companyId?: string;
  companyLink?: string;
  phone?: string;
  email: string;
  alternateEmail?: string;
  paymentNotes?: string;
  propertyType?: string;
  commission?: string;
  cellPhone?: string;
  pickupFessCheck?: boolean;
  pickupFessValue?: string;
  commissionCheck?: boolean;
  commissionCheckValue?: string;
  other?: boolean;
  otherFeesValue?: string;
  image?: string[];
  pickupFees?: string;
  alternateContacts?: string;
  otherFees?: string;
  onlineAccess?: string;
  accessLink?: string;
  status: string;
  isActive: boolean;
  isVerified: boolean;
  isDeleted: boolean;
  isBlocked: boolean;
  alsoBiddersAdd?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ClientsResponse {
  status: boolean;
  data: ClientItem[];
  totalCount: number;
  page: number;
  perPage: number;
  pages: number;
  message: string;
}

export interface GetClientsParams {
  page: number;
  perPage: number;
  searchItem?: string;
  type?: string;
  status?: string;
}

export interface SendClientEmailPayload {
  ids: string[];
  subject: string;
  message: string;
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

const getFeeValue = (isChecked: any, value: any) =>
  isChecked ? cleanFormValue(value) : 'undefined';

const buildClientFormData = (
  payload: Record<string, any>,
  options?: { id?: string; includeImageFlag?: boolean },
) => {
  const formData = new FormData();

  const fields: Record<string, any> = {
    date: payload.date,
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phone: payload.phone,
    homeAddress: payload.homeAddress,
    homeCity: payload.homeCity,
    homeState: payload.homeState,
    homeZipCode: payload.homeZipCode,
    propertyAddress: payload.propertyAddress,
    propertyCity: payload.propertyCity,
    propertyState: payload.propertyState,
    propertyZipCode: payload.propertyZipCode,
    status: payload.status,
    propertyType: payload.propertyType,
    idCode: payload.idCode,
    otherFees: getFeeValue(payload.other, payload.otherFeesValue),
    accessLink: payload.accessLink,
    pickupFees: getFeeValue(payload.pickupFessCheck, payload.pickupFessValue),
    onlineAccess: payload.onlineAccess,
    commission: getFeeValue(payload.commissionCheck, payload.commissionCheckValue),
    alternateEmail: payload.alternateEmail,
    alternateContacts: payload.alternateContacts,
    paymentNotes: payload.paymentNotes,
    cellPhone: payload.cellPhone,
    type: payload.type,
    companyLink: payload.companyLink,
    alsoBiddersAdd: payload.alsoBiddersAdd,
    commissionCheck: !!payload.commissionCheck,
    pickupFessCheck: !!payload.pickupFessCheck,
    other: !!payload.other,
  };

  if (options?.includeImageFlag) {
    fields.isImage = false;
  }

  if (options?.id) {
    fields.id = options.id;
  }

  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, cleanFormValue(value));
  });

  return formData;
};

export const useGetClients = (params: GetClientsParams) => {
  return useQuery<ClientsResponse>({
    queryKey: ['clients', params],
    queryFn: async () => {
      const res = await get(apiEndPoints.allClient, params);
      return res;
    },
    retry: false,
    staleTime: 1000 * 60 * 1, // 1 minute stale time
  });
};

export const useAddClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const formData = buildClientFormData(payload);
      const res = await post(apiEndPoints.addClient, formData, 1);
      return res;
    },
    onSuccess: (data) => {
      AppToast.success(data?.message || 'Client added successfully');
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error: any) => {
      AppToast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, any> }) => {
      const formData = buildClientFormData(payload, {
        id,
        includeImageFlag: true,
      });
      const res = await post(apiEndPoints.updateClient, formData, 1);
      return res;
    },
    onSuccess: (data) => {
      AppToast.success(data?.message || 'Client updated successfully');
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error: any) => {
      AppToast.error(getErrorMessage(error));
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteApi(`${apiEndPoints.deleteClient}/${id}`);
      return res;
    },
    onSuccess: (data) => {
      AppToast.success(data?.message || 'Client deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error: any) => {
      AppToast.error(getErrorMessage(error));
    },
  });
};

export const useSendClientEmail = () => {
  return useMutation({
    mutationFn: async (payload: SendClientEmailPayload) => {
      const res = await post(apiEndPoints.clientEmail, payload);
      if (res && res.status === false) {
        throw new Error(res.message || 'Failed to send email');
      }
      return res;
    },
    onSuccess: (data) => {
      AppToast.success(data?.message || 'Email Send successfully');
    },
    onError: (error: any) => {
      console.log(error?.response,'==================================')
      AppToast.error(getErrorMessage(error));
    },
  });
};
