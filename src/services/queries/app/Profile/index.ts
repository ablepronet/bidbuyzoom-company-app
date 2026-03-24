import { useQuery } from '@tanstack/react-query';
import { get } from '../../../api';
import apiEndPoints from '../../../../constants/apiConstant';

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
