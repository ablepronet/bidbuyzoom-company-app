import { useQuery } from '@tanstack/react-query';
import { get } from '../../../api';
import apiEndPoints from '../../../../constants/apiConstant';

export const useGetDashBoardData = (year: number | string) => {
  return useQuery<any>({
    queryKey: ['dashboardData', year],
    queryFn: async () => {
      const res = await get(`${apiEndPoints.getDashboardData}?Year=${year}`);
      return res;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};
