'use client';

import { ApolloProvider } from '@apollo/client/react';
import client from '@/lib/apollo/apollo-client';
import React from 'react';

export default function ClientApolloProvider({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
