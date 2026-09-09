import authService from '@/lib/auth/authService';
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';

const authLink = new ApolloLink((operation, forward) => {
  const token = authService.getToken();

  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : '',
    },
  });

  return forward(operation);
});

const httpLink = new HttpLink({
  uri: `${process.env.NEXT_PUBLIC_BASE_URL}api/gql/`,
  fetchOptions: {
    method: 'POST',
  },
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
