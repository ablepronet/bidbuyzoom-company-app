import {useQuery} from '@tanstack/react-query';
import axios from 'axios';

import apiEndPoints, {IMAGE_BASE_URL} from '../../../../constants/apiConstant';
import {useAppSelector} from '../../../../redux/hooks';

export type SaleTypeItem = {
  _id: string;
  name: string;
  isActive?: boolean;
  isDeleted?: boolean;
  sequence?: number;
};

export const useGetSaleTypes = () => {
  const {token} = useAppSelector(state => state.auth);

  return useQuery({
    queryKey: ['saleTypes', token],

    queryFn: async () => {
      const res = await axios.get(`${IMAGE_BASE_URL}${apiEndPoints.saleType}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data;
    },

    enabled: !!token,
    retry: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};
