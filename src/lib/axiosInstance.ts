import { REFRESH_REQUEST_ROUTE } from '@/shared/_service/route.api';
import axios, { AxiosError } from 'axios';
import authService from './auth/authService';
import { notify } from './notification/notificationService';
export const UNKNOWN_ERROR = {
  message: 'خطایی رخ داده است.',
  statusCode: 410,
};

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  timeout: 5000,
});

instance.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach((p) => (token ? p.resolve(token) : p.reject(error)));
  failedQueue = [];
};

// Single shared refresh function — used by both the proactive timer (AuthContext)
// and the reactive 401 interceptor below. Guarantees only one refresh runs at a time.
export const refreshTokens = async (): Promise<string> => {
  if (isRefreshing) {
    // A refresh is already in flight — queue up and wait for it to finish
    return new Promise<string>((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  const refreshToken = authService.getRefreshToken();
  if (!refreshToken) {
    window.dispatchEvent(new Event('auth:error'));
    return Promise.reject(new Error('No refresh token'));
  }

  isRefreshing = true;
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}${REFRESH_REQUEST_ROUTE}`,
      { refresh: refreshToken }
    );
    const newAccessToken = response.data.access;
    const newRefreshToken = response.data.refresh ?? refreshToken;

    if (!newAccessToken) {
      const err = new Error('Refresh response missing access token');
      processQueue(err, null);
      authService.clearSession();
      window.dispatchEvent(new Event('auth:error'));
      return Promise.reject(err);
    }

    authService.setSession(newAccessToken, newRefreshToken);
    processQueue(null, newAccessToken);
    return newAccessToken;
  } catch (err) {
    processQueue(err, null);

    const status = (err as AxiosError).response?.status;
    const isAuthRejection = status === 401 || status === 403;

    if (isAuthRejection) {
      authService.clearSession();
      window.dispatchEvent(new Event('auth:error'));
    }

    return Promise.reject(err);
  } finally {
    isRefreshing = false;
  }
};

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !(REFRESH_REQUEST_ROUTE && originalRequest.url?.includes(REFRESH_REQUEST_ROUTE))
    ) {
      if (!authService.getRefreshToken()) {
        window.dispatchEvent(new Event('auth:error'));
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshTokens();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status !== 401) {
      const data = error.response?.data;

      let message = UNKNOWN_ERROR.message;

      if (typeof data === 'string') {
        message = data;
      } else if (data?.message) {
        message = data.message;
      } else if (typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        const val = data[firstKey];

        if (Array.isArray(val)) {
          message = val[0];
        } else if (typeof val === 'string') {
          message = val;
        }
      }

      notify.error(message);
    }

    return Promise.reject(error);
  }
);

const post = <T, O>(
  url: string,
  local2api: (local: T) => any = (local: T) => local,
  api2local: (api: any) => O = (api: any) => api
) => {
  return async (body: T) => {
    try {
      const response = await instance.post(url, local2api(body));
      return api2local(response.data) as O;
    } catch (e) {
      const error = e as AxiosError;
      return Promise.reject(error.response?.data ?? UNKNOWN_ERROR);
    }
  };
};

const get = <O>(url: string, api2local: (api: any) => O = (api) => api, queryParams: any = {}) => {
  return async () => {
    try {
      const response = await instance.get(url, { params: queryParams });
      return api2local(response.data) as O;
    } catch (e) {
      const error = e as AxiosError;
      return Promise.reject(error.response?.data ?? UNKNOWN_ERROR);
    }
  };
};

const _delete = (url: string) => {
  return async () => {
    try {
      const response = await instance.delete(url);
      return response.data;
    } catch (e) {
      const error = e as AxiosError;
      return Promise.reject(error.response?.data ?? UNKNOWN_ERROR);
    }
  };
};

const put = <T, O>(
  url: string,
  local2api: (local: T) => any = (local: T) => local,
  api2local: (api: any) => O = (api: any) => api
) => {
  return async (body: T) => {
    try {
      const response = await instance.put(url, local2api(body));
      return api2local(response.data) as O;
    } catch (e) {
      const error = e as AxiosError;
      return Promise.reject(error.response?.data ?? UNKNOWN_ERROR);
    }
  };
};

const patch = <T, O>(
  url: string,
  local2api: (local: T) => any = (local: T) => local,
  api2local: (api: any) => O = (api: any) => api
) => {
  return async (body: T) => {
    try {
      const response = await instance.patch(url, local2api(body));
      return api2local(response.data) as O;
    } catch (e) {
      const error = e as AxiosError;
      return Promise.reject(error.response?.data ?? UNKNOWN_ERROR);
    }
  };
};

// THIS API METHOD HAS NO TIMEOUT
const postFormData = <O>(url: string, api2local: (api: any) => O = (api: any) => api) => {
  return async (formData: FormData): Promise<O> => {
    try {
      const response = await instance.post(url, formData, { timeout: 0 });
      return api2local(response.data) as O;
    } catch (e) {
      const error = e as AxiosError;
      return Promise.reject(error.response?.data ?? UNKNOWN_ERROR);
    }
  };
};

const api = {
  get,
  post,
  patch,
  delete: _delete,
  put,
  postFormData,
};

export default api;
