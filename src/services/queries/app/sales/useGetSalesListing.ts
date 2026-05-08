import {useQuery} from '@tanstack/react-query';
import {get} from '../../../api';
import apiEndPoints from '../../../../constants/apiConstant';

export type SalesListingItem = {
  _id: string;
  saleId?: string;
  title: string;
  bussinessName?: string;
  saleType?: string;
  templateId?: string;
  isSpecialField?: boolean;
  specialFieldArray?: string[];
  multiStartDate?: Array<{
    startDate?: string;
    startTime?: string;
    endTime?: string;
    _id?: string;
  }>;
};

export const useGetSalesListing = () => {
  return useQuery({
    queryKey: ['salesListing'],
    queryFn: async () => {
      const res = await get(apiEndPoints.salesListing);
      return res;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};
