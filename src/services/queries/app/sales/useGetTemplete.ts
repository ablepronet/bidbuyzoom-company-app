import {useQuery} from '@tanstack/react-query';
import {get} from '../../../api';
import apiEndPoints from '../../../../constants/apiConstant';

export const useGetTemplete = (editId?: string) => {
  return useQuery({
    queryKey: ['templateList', editId],
    queryFn: async () => {
      const res = await get(`${apiEndPoints.templateList}/${editId}`);
      return res;
    },
    enabled: Boolean(editId),
    retry: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};
