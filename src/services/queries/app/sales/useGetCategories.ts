import {useQuery} from '@tanstack/react-query';
import {get} from '../../../api';
import apiEndPoints from '../../../../constants/apiConstant';

export type CategoryItem = {
  _id: string;
  name: string;
  isActive?: boolean;
  isDeleted?: boolean;
  isSaleStatus?: boolean;
};

export const useGetCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await get(apiEndPoints.category);
      return res;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};
