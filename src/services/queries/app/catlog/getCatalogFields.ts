import {useQuery} from '@tanstack/react-query';
import {get} from '../../../api';
import apiEndPoints from '../../../../constants/apiConstant';

interface CatalogFieldsParams {
  templateId: string;
}

export const useGetCatalogFields = (params: CatalogFieldsParams) => {
  return useQuery({
    queryKey: ['catalogFields', params.templateId],
    queryFn: () => get(`${apiEndPoints.getCatalogFields}/${params.templateId}`),
    enabled: Boolean(params.templateId),
    retry: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};
