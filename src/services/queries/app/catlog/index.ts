import {useQuery, keepPreviousData} from '@tanstack/react-query';
import {get} from '../../../api';
import apiEndPoints from '../../../../constants/apiConstant';

interface CatalogParams {
  saleId?: string | number;
  templateId?: string | number;
  page?: number;
  perPage?: number;
  search?: string;
}

export const useGetCatalogDetails = (params: CatalogParams) => {
  return useQuery({
    queryKey: [
      'catalogueData',
      params.saleId,
      params.templateId,
      params.page,
      params.perPage,
      params.search,
    ],
    queryFn: () => get(apiEndPoints.catalogData, params),
    placeholderData: keepPreviousData,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};
