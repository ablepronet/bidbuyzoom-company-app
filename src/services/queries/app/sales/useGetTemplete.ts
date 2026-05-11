import {useMutation, useQuery} from '@tanstack/react-query';
import {get, post} from '../../../api';
import apiEndPoints from '../../../../constants/apiConstant';
import AppToast from '../../../../components/toaster';

export type TemplateListItem = {
  _id: string;
  templateName: string;
};

type UpdateSaleTemplatePayload = {
  saleId: string;
  templateId: string;
};

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

const getErrorMessage = (error: any) =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.message ||
  'Something went wrong please try after sometime';

export const useUpdateSaleTemplate = () => {
  return useMutation({
    mutationFn: (payload: UpdateSaleTemplatePayload) => {
      return post(apiEndPoints.updateSaleTemplate, payload);
    },
    onError: (error: any) => {
      AppToast.error(getErrorMessage(error));
    },
    onSuccess:(res) =>{
      AppToast.success(res?.message || 'template id add successfully');
    }
  });
};
