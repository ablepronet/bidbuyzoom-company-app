import {useQuery} from '@tanstack/react-query';
import {get} from '../../../api';
import apiEndPoints from '../../../../constants/apiConstant';

interface CatalogParams {
  id: string;
}

export const useGetCatalogDataDetails = (params: CatalogParams) => {
  return useQuery({
    queryKey: ['catalogueData', params.id],
    queryFn: () => get(`${apiEndPoints.getCatalogDetails}/${params.id}`),
    enabled: Boolean(params.id),
    retry: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};
