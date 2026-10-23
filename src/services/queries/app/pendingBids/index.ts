import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { post } from '../../../api';
import apiEndPoints from '../../../../constants/apiConstant';

export type PendingBid = {
  _id: string;
  amount: number;
  isAutoBid?: boolean;
  createdAt: string;
  bidderId?: { _id: string; firstName?: string; lastName?: string; email?: string; cellPhone?: string } | null;
  catalogId?: { _id: string; title?: string; catalogData?: string[] } | null;
  saleId?: { _id: string; title?: string; name?: string } | string | null;
};

/** Bids waiting for approval, for one sale or for all of the company's sales. */
export const useGetPendingBids = (saleId?: string) => {
  return useQuery<PendingBid[]>({
    queryKey: ['pendingBids', saleId || 'all'],
    queryFn: async () => {
      const res = await post(apiEndPoints.pendingBids, saleId ? { saleId } : {});
      return Array.isArray(res?.data) ? res.data : [];
    },
    refetchInterval: 30000, // new pending bids show up without pulling to refresh
  });
};

/** Approve or reject one pending bid. The bidder is notified by the server. */
export const useDecideBid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ transactionId, action }: { transactionId: string; action: 'approve' | 'reject' }) => {
      const res = await post(apiEndPoints.approveBid, { transactionId, action });
      if (res?.status === false) throw new Error(res?.message || 'Could not update the bid.');
      return res;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingBids'] });
    },
  });
};

/** Lot number and title from the lot's catalog fields. */
export const lotLabel = (lot?: PendingBid['catalogId']) => {
  let title = lot?.title || '';
  let number = '';
  try {
    const fields = JSON.parse(lot?.catalogData?.[0] || '[]');
    title = fields.find((f: any) => String(f?.label || '').toLowerCase() === 'title')?.value || title;
    number = fields.find((f: any) => String(f?.label || '').toLowerCase() === 'lot')?.value || '';
  } catch {
    // keep defaults
  }
  return `${number ? `Lot ${number}` : 'Lot'}${title ? ` · ${title}` : ''}`;
};
