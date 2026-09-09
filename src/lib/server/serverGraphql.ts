import { DocumentNode, print } from 'graphql';
import { serverFetch, ServerFetchOptions } from './serverFetch';

type GraphQLResponse<T> = {
  data: T;
  errors?: { message: string; locations?: any[]; path?: any[] }[];
};

export class GraphQLError extends Error {
  constructor(public errors: GraphQLResponse<unknown>['errors']) {
    super(errors?.[0]?.message ?? 'GraphQL Error');
    this.name = 'GraphQLError';
  }
}

type GraphQLRequestOptions = ServerFetchOptions & {
  next?: NextFetchRequestConfig; // revalidate or tags
};

export const serverGraphql = {
  query: <O>(
    query: DocumentNode,
    variables?: Record<string, any>,
    api2local: (data: any) => O = (data) => data,
    options?: GraphQLRequestOptions
  ) => {
    return async (): Promise<O> => {
      const { next, ...fetchOptions } = options ?? {};

      const res = await serverFetch('api/gql/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: print(query),
          variables,
        }),
        next, // ← Next.js cache config lives here
        ...fetchOptions,
      });

      const json: GraphQLResponse<O> = await res.json();

      // GraphQL spec — errors come as 200 with errors[]
      if (json.errors?.length) {
        throw new GraphQLError(json.errors);
      }

      return api2local(json.data);
    };
  },
};
