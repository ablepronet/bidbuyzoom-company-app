import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, put } from '../../../api';
import apiEndPoints from '../../../../constants/apiConstant';

export type MessageItem = {
  _id: string;
  companyId: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type MessageResponse = {
  status: boolean;
  data: MessageItem[];
  unreadCount: number;
};

export const useGetMessages = () => {
  return useQuery<MessageResponse>({
    queryKey: ['messages'],
    queryFn: async () => {
      const res = await get(apiEndPoints.messages);
      return res;
    },
    retry: false,
    staleTime: 1000 * 60 * 1, // 1 minute stale time
  });
};

export const useReadMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const endpoint = apiEndPoints.readMessage(id);
      const res = await put(endpoint, {});
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
};
