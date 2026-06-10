import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '../../../api';
import apiEndPoints from '../../../../constants/apiConstant';
import AppToast from '../../../../components/toaster';

export interface StaffPermissions {
  dashboard: boolean;
  profile: boolean;
  default_settings: boolean;
  staff: boolean;
  payment_settings: boolean;
  sms_security: boolean;
  legal_pages: boolean;
  consignors: boolean;
  bidders: boolean;
  sales: boolean;
  notifications: boolean;
  company_reports: boolean;
  consignment_requests: boolean;
  invoicing: boolean;
  marketing: boolean;
}

export interface StaffItem {
  _id: string;
  firstName: string;
  lastName: string;
  position: string;
  date: string;
  birthDate: string;
  address: string;
  zipCode: string;
  state: string;
  city: string;
  companyId?: string;
  phone: string;
  email: string;
  notes: string;
  others: string;
  alsoBiddersConsignor: string;
  hasLogin: boolean;
  permissions: StaffPermissions;
  isActive: boolean;
  isVerified: boolean;
  isDeleted: boolean;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  inviteToken?: string;
  inviteTokenExpires?: string;
}

export interface StaffResponse {
  status: boolean;
  data: StaffItem[];
  totalCount: number;
  page: number;
  perPage: number;
  pages: number;
  message: string;
}

export interface GetStaffParams {
  page: number;
  perPage: number;
  searchItem?: string;
  status?: string | boolean;
}

const getErrorMessage = (error: any) =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.message ||
  'Something went wrong. Please try again.';

const getStaffId = (res: any): string | undefined => {
  if (!res) return undefined;
  if (Array.isArray(res.data) && res.data.length > 0) {
    return res.data[0]._id || res.data[0].id;
  }
  if (res.data && typeof res.data === 'object') {
    return res.data._id || res.data.id;
  }
  if (Array.isArray(res.datas) && res.datas.length > 0) {
    return res.datas[0]._id || res.datas[0].id;
  }
  if (res.datas && typeof res.datas === 'object') {
    return res.datas._id || res.datas.id;
  }
  return res._id || res.id;
};

export const useGetStaff = (params: GetStaffParams) => {
  return useQuery<StaffResponse>({
    queryKey: ['staffList', params],
    queryFn: async () => {
      const res = await get(apiEndPoints.allStaff, params);
      return res;
    },
    retry: false,
    staleTime: 1000 * 60 * 1,
  });
};

export const useAddStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const { permissions, ...staffData } = payload;
      const res = await post(apiEndPoints.addStaff, staffData);
      if (res && res.status === false) {
        throw new Error(res.message || 'Failed to add staff');
      }
      
      const staffId = getStaffId(res);
      if (staffId && permissions) {
        const permRes = await post(apiEndPoints.updateStaffPermissions, {
          staffId,
          permissions,
        });
        if (permRes && permRes.status === false) {
          throw new Error(permRes.message || 'Failed to update staff permissions');
        }
      }
      return res;
    },
    onSuccess: (data) => {
      AppToast.success(data?.message || 'Staff added successfully');
      queryClient.invalidateQueries({ queryKey: ['staffList'] });
    },
    onError: (error: any) => {
      AppToast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const { permissions, ...staffData } = payload;
      const res = await post(apiEndPoints.updateStaff, staffData);
      if (res && res.status === false) {
        throw new Error(res.message || 'Failed to update staff');
      }
      return res;
    },
    onSuccess: (data) => {
      AppToast.success(data?.message || 'Staff updated successfully');
      queryClient.invalidateQueries({ queryKey: ['staffList'] });
    },
    onError: (error: any) => {
      AppToast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateStaffPermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { staffId: string; permissions: StaffPermissions }) => {
      const res = await post(apiEndPoints.updateStaffPermissions, payload);
      if (res && res.status === false) {
        throw new Error(res.message || 'Failed to update permissions');
      }
      return res;
    },
    onSuccess: (data) => {
      AppToast.success(data?.message || 'Permissions updated successfully');
      queryClient.invalidateQueries({ queryKey: ['staffList'] });
    },
    onError: (error: any) => {
      AppToast.error(getErrorMessage(error));
    },
  });
};
