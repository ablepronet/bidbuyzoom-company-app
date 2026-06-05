import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '../../../api';
import apiEndPoints from '../../../../constants/apiConstant';
import AppToast from '../../../../components/toaster';

export const useGetUserProfile = () => {
  return useQuery<any>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const res = await get(apiEndPoints.getUserProfile);
      return res;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

const getErrorMessage = (error: any) =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.message ||
  'Something went wrong. Please try again.';

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      // type = 1 specifies multipart/form-data in the post helper
      const res = await post('update-profile', formData, 1);
      return res;
    },
    onSuccess: (data) => {
      AppToast.success(data?.message || 'Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error: any) => {
      AppToast.error(getErrorMessage(error));
    },
  });
};

