'use client';

import { Slide, ToastContainer, ToastContainerProps } from 'react-toastify';

const DEFAULT_CONTAINER_PROPS: ToastContainerProps = {
  position: 'bottom-left',
  autoClose: 2000,
  limit: 5,
  hideProgressBar: false,
  newestOnTop: false,
  closeOnClick: true,
  rtl: true,
  pauseOnFocusLoss: false,
  draggable: false,
  pauseOnHover: true,
  theme: 'colored',
  transition: Slide,
};

interface NotificationProviderProps {
  children: React.ReactNode;
  containerProps?: Partial<ToastContainerProps>;
}

// containerProps lets each project override the app-wide look (position, theme, rtl...)
// in one place, without editing this file per project.
export const NotificationProvider = ({ children, containerProps }: NotificationProviderProps) => (
  <>
    {children}
    <ToastContainer {...DEFAULT_CONTAINER_PROPS} {...containerProps} />
  </>
);
