import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, put } from '../../../api';
import apiEndPoints from '../../../../constants/apiConstant';
import HandleApiCatch from '../../../../helper/handleCatch';
import AppToast from '../../../../components/toaster';

export type NotificationItem = {
  _id: string;
  companyId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type NotificationResponse = {
  status: boolean;
  data: NotificationItem[];
  unreadCount: number;
};

export const useGetNotifications = () => {
  return useQuery<NotificationResponse>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await get(apiEndPoints.notifications);
      return res;
    },
    retry: false,
    staleTime: 1000 * 60 * 1, // 1 minute stale time
  });
};

export const useReadNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const endpoint = apiEndPoints.readNotification(id);
      const res = await put(endpoint, {});
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      try {
        const res = await put(apiEndPoints.markAllRead, {});
        return res;
      } catch (err) {
        throw err;
      }
    },
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      if (res?.status === false) {
        AppToast.error(res?.message || 'Failed to mark notifications as read');
      } else if (res?.message) {
        AppToast.success(res.message);
      }
    },
    onError: (err) => {
      HandleApiCatch(err);
    },
  });
};
