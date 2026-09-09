import getQueryParams from '@/shared/utils/getQueryParams';
import { serverFetch, ServerFetchOptions } from './serverFetch';

export const serverApi = {
  get: <O>(
    url: string,

    api2local: (api: any) => O = (api) => api,
    queryParams: any = {},
    options?: ServerFetchOptions
  ) => {
    return async (): Promise<O> => {
      const query = new URLSearchParams(getQueryParams(queryParams)).toString();
      const res = await serverFetch(`${url}${query ? `?${query}` : ''}`, options);
      return api2local(await res.json());
    };
  },
};
