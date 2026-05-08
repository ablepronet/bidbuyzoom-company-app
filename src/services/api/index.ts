// import { store } from '../redux/store';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { store } from '../../redux/store';
import { logs } from '../../utils/metrics';
import instance from './axiosInterceptors';
import { setUserLogout } from '../../redux/slices/auth';
import { BASE_URL } from '../../constants/apiConstant';

const getRequestPreview = (payload: any) => {
  if (typeof FormData !== 'undefined' && payload instanceof FormData) {
    return '[FormData]';
  }

  return payload;
};

const getResponsePreview = (data: any) => ({
  status: data?.status,
  message: data?.message,
  dataType: Array.isArray(data?.data) ? 'array' : typeof data?.data,
  dataLength: Array.isArray(data?.data) ? data.data.length : undefined,
  datasType: Array.isArray(data?.datas) ? 'array' : typeof data?.datas,
  datasLength: Array.isArray(data?.datas) ? data.datas.length : undefined,
});

export const post = async (url: string, formData: any, type = 0) => {
  const token = store.getState().auth.token;

  logs('token', token ? '[available]' : '[missing]');
  const options: any = {
    headers: {
      Accept: type ? 'multipart/form-data' : 'application/json',
      'Content-Type': type ? 'multipart/form-data' : 'application/json',
      'Accept-Language': 'en',
    },
  };

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }
  logs('Request', BASE_URL + url, getRequestPreview(formData));
  return instance
    .post(url, formData, options)
    .then(function (response: AxiosResponse) {
      logs('Response ', url, getResponsePreview(response?.data));
      return response?.data;
    })
    .catch(function (error: any) {
      const status = error?.response?.status;
      if (status === 401) {
        store.dispatch(setUserLogout());
      }
      throw error;
    });
};

export const put = async (url: string, formData: any, type = 0) => {
  const options: any = {
    headers: {
      Accept: type ? 'multipart/form-data' : 'application/json',
      'Content-Type': type ? 'multipart/form-data' : 'application/json',
      'Accept-Language': 'en',
    },
  };

  const token = store.getState().auth.token;

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }
  logs('Request', BASE_URL + url, getRequestPreview(formData));
  return instance
    .put(url, formData, options)
    .then(function (response: any) {
      logs('Response ', url, getResponsePreview(response?.data));
      return response?.data;
    })
    .catch(function (error: any) {
      throw error;
    });
};

export const get = async (
  url: string,
  params?: AxiosRequestConfig['params'],
) => {
  const token = store.getState().auth.token;
  //   const lang = store.getState().languageSlice.appLanguage;
  logs('token==', token ? '[available]' : '[missing]');
  const options: AxiosRequestConfig = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token || ''}`,
      'Accept-Language': 'en',
    },
    params: params,
  };
  logs('Request', BASE_URL + url, params);
  return instance
    .get(url, options)
    .then(function (response) {
      logs('Response ', url, getResponsePreview(response?.data));
      return response?.data;
    })
    .catch(function (error: AxiosError) {
      if (error.code === 'ERR_BAD_REQUEST') {
      }
      const status = error?.response?.status;
      if (status === 401) {
        store.dispatch(setUserLogout());
      }
      throw error;
    });
};

export const deleteApi = async (url: string, _type = 0) => {
  const options: any = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Accept-Language': 'en',
    },
  };

  const token = store.getState().auth.token;

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  options.headers.demo = `Bearer`;
  logs('Request', BASE_URL + url);
  return instance
    .delete(url, options)
    .then(function (response: any) {
      return response?.data;
    })
    .catch(function (error: any) {
      throw error;
    });
};
