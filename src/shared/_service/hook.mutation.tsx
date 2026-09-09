import api from '@/lib/axiosInstance';
import { useMutation } from '@tanstack/react-query';
import { runtimeConfig } from '@/config/runtime.config';
import {
  AuthForgetPasswordPayload,
  AuthInitiatePayload,
  AuthLoginPasswordPayload,
  AuthResendOtpPayload,
  AuthSendLoginOtpPayload,
  AuthSetPasswordPayload,
  AuthVerifyOtpPayload,
} from './interface.payload';
import {
  CreatePushSubscribePayload,
  CreatePushSubscribeResponse,
  CreatePushUnsubscribePayload,
  CreatePushUnsubscribeResponse,
  UpdatePushTopicsPayload,
  UpdatePushTopicsResponse,
} from './interface.push';
import {
  AuthCreateForgetPasswordResponse,
  AuthCreateInitiateResponse,
  AuthCreateLoginPasswordResponse,
  AuthCreateResendOtpResponse,
  AuthCreateSendLoginOtpResponse,
  AuthCreateSetPasswordResponse,
  AuthCreateVerifyOtpResponse,
} from './interface.response';
import { ErrorResponseSchema } from './interface.schema';
import {
  AUTH_FORGET_PASSWORD_ROUTE,
  AUTH_INITIATE_ROUTE,
  AUTH_LOGIN_PASSWORD_ROUTE,
  AUTH_RESEND_OTP_ROUTE,
  AUTH_SEND_LOGIN_OTP_ROUTE,
  AUTH_SET_PASSWORD_ROUTE,
  AUTH_VERIFY_OTP_ROUTE,
  PUSH_SUBSCRIBE_ROUTE,
  PUSH_UNSUBSCRIBE_ROUTE,
  PUSH_UPDATE_TOPICS_ROUTE,
} from './route.api';

// NEXT_PUBLIC_PUSH_MOCK=true routes these three calls to this same Next
// app's local mock endpoints (src/app/api/v1/push/client/*) via a plain
// relative fetch — lets frontend push testing work end-to-end today while
// only push testing is mocked. Flip the env var back to false/unset once a
// real backend exists; ported as-is from the exchange-confirmation app.
const PUSH_MOCK = runtimeConfig.useMockPush;

// STUB — mutationFn bodies point at routes that don't exist on any backend
// yet (see route.api.ts). Swap these out once real endpoints exist; call
// sites (PhoneNumberForm, LoginMethodForm, OTPForm, SetPasswordFrom,
// AuthFlow) shouldn't need to change.

const usePostAuthInitation = (onSuccess: (data: AuthCreateInitiateResponse) => void) => {
  return useMutation({
    mutationKey: ['post-auth-initiate'],
    mutationFn: (payload: AuthInitiatePayload) =>
      api.post<AuthInitiatePayload, AuthCreateInitiateResponse>(AUTH_INITIATE_ROUTE)(payload),
    onSuccess,
  });
};

const usePostLoginPassword = (
  onSuccess: (data: AuthCreateLoginPasswordResponse) => void,
  onError?: (error: ErrorResponseSchema) => void
) => {
  return useMutation({
    mutationKey: ['post-login-password'],
    mutationFn: (payload: AuthLoginPasswordPayload) =>
      api.post<AuthLoginPasswordPayload, AuthCreateLoginPasswordResponse>(
        AUTH_LOGIN_PASSWORD_ROUTE
      )(payload),
    onSuccess,
    onError: onError as (error: unknown) => void,
  });
};

const usePostSendLoginOtp = (onSuccess: (data: AuthCreateSendLoginOtpResponse) => void) => {
  return useMutation({
    mutationKey: ['post-send-login-otp'],
    mutationFn: (payload: AuthSendLoginOtpPayload) =>
      api.post<AuthSendLoginOtpPayload, AuthCreateSendLoginOtpResponse>(AUTH_SEND_LOGIN_OTP_ROUTE)(
        payload
      ),
    onSuccess,
  });
};

const usePostForgetPassword = (onSuccess: (data: AuthCreateForgetPasswordResponse) => void) => {
  return useMutation({
    mutationKey: ['post-forget-password'],
    mutationFn: (payload: AuthForgetPasswordPayload) =>
      api.post<AuthForgetPasswordPayload, AuthCreateForgetPasswordResponse>(
        AUTH_FORGET_PASSWORD_ROUTE
      )(payload),
    onSuccess,
  });
};

const usePostVerifyOtp = (onSuccess: (data: AuthCreateVerifyOtpResponse) => void) => {
  return useMutation({
    mutationKey: ['post-verify-otp'],
    mutationFn: (payload: AuthVerifyOtpPayload) =>
      api.post<AuthVerifyOtpPayload, AuthCreateVerifyOtpResponse>(AUTH_VERIFY_OTP_ROUTE)(payload),
    onSuccess,
  });
};

const usePostResendOtp = (onSuccess: (data: AuthCreateResendOtpResponse) => void) => {
  return useMutation({
    mutationKey: ['post-resend-otp'],
    mutationFn: (payload: AuthResendOtpPayload) =>
      api.post<AuthResendOtpPayload, AuthCreateResendOtpResponse>(AUTH_RESEND_OTP_ROUTE)(payload),
    onSuccess,
  });
};

const usePostSetPassword = (
  onSuccess: (data: AuthCreateSetPasswordResponse) => void,
  onError?: (error: ErrorResponseSchema) => void
) => {
  return useMutation({
    mutationKey: ['post-set-password'],
    mutationFn: (payload: AuthSetPasswordPayload) =>
      api.post<AuthSetPasswordPayload, AuthCreateSetPasswordResponse>(AUTH_SET_PASSWORD_ROUTE)(
        payload
      ),
    onSuccess,
    onError: onError as (error: unknown) => void,
  });
};

const usePostPushSubscribe = (onSuccess: (data: CreatePushSubscribeResponse) => void) => {
  return useMutation({
    mutationKey: ['post-push-subscribe'],
    mutationFn: async (payload: CreatePushSubscribePayload) => {
      if (PUSH_MOCK) {
        const res = await fetch(`/${PUSH_SUBSCRIBE_ROUTE}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        return res.json() as Promise<CreatePushSubscribeResponse>;
      }
      return api.post<CreatePushSubscribePayload, CreatePushSubscribeResponse>(
        PUSH_SUBSCRIBE_ROUTE
      )(payload);
    },
    onSuccess,
  });
};

const usePostPushUnsubscribe = (onSuccess: (data: CreatePushUnsubscribeResponse) => void) => {
  return useMutation({
    mutationKey: ['post-push-unsubscribe'],
    mutationFn: async (payload: CreatePushUnsubscribePayload) => {
      if (PUSH_MOCK) {
        const res = await fetch(`/${PUSH_UNSUBSCRIBE_ROUTE}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        return res.json() as Promise<CreatePushUnsubscribeResponse>;
      }
      return api.post<CreatePushUnsubscribePayload, CreatePushUnsubscribeResponse>(
        PUSH_UNSUBSCRIBE_ROUTE
      )(payload);
    },
    onSuccess,
  });
};

const usePostPushUpdateTopics = (onSuccess: (data: UpdatePushTopicsResponse) => void) => {
  return useMutation({
    mutationKey: ['post-push-update-topics'],
    mutationFn: async (payload: UpdatePushTopicsPayload) => {
      if (PUSH_MOCK) {
        const res = await fetch(`/${PUSH_UPDATE_TOPICS_ROUTE}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        return res.json() as Promise<UpdatePushTopicsResponse>;
      }
      return api.post<UpdatePushTopicsPayload, UpdatePushTopicsResponse>(PUSH_UPDATE_TOPICS_ROUTE)(
        payload
      );
    },
    onSuccess,
  });
};

export {
  usePostAuthInitation,
  usePostForgetPassword,
  usePostLoginPassword,
  usePostPushSubscribe,
  usePostPushUnsubscribe,
  usePostPushUpdateTopics,
  usePostResendOtp,
  usePostSendLoginOtp,
  usePostSetPassword,
  usePostVerifyOtp,
};
