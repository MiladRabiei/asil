import Loading from '@/shared/UI/Loading';
import React from 'react';

const withFallback = <T, P extends { data?: T }>(WrappedComponent: React.ComponentType<P>) => {
  const ComponentWithFallback: React.FC<P & { isLoading?: boolean; notFoundMessage?: string }> = ({
    data,
    isLoading,
    notFoundMessage = ' یافت نشد',
    ...rest
  }) => {
    if (isLoading) {
      return (
        <div className="w-full h-screen flex items-center justify-center">
          <Loading size="lg" />
        </div>
      );
    }

    if (!data) {
      return <div className="flex items-center justify-center">{notFoundMessage}</div>;
    }

    return <WrappedComponent {...(rest as P)} data={data} />;
  };

  return ComponentWithFallback;
};

export default withFallback;
