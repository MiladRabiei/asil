import { AuthFlowSchema } from './interface.schema';

interface AuthInitiatePayload {
  phoneNumber: string;
}

interface AuthLoginPasswordPayload {
  phoneNumber: string;
  password: string;
}

interface AuthSendLoginOtpPayload {
  phoneNumber: string;
}

interface AuthForgetPasswordPayload {
  phoneNumber: string;
}

interface AuthVerifyOtpPayload {
  phoneNumber: string;
  otpCode: string;
  flow: AuthFlowSchema;
}

interface AuthResendOtpPayload {
  phoneNumber: string;
  flow: AuthFlowSchema;
}

interface AuthSetPasswordPayload {
  phoneNumber: string;
  password: string;
  passwordConfirmation: string;
}

export type {
  AuthForgetPasswordPayload,
  AuthInitiatePayload,
  AuthLoginPasswordPayload,
  AuthResendOtpPayload,
  AuthSendLoginOtpPayload,
  AuthSetPasswordPayload,
  AuthVerifyOtpPayload,
};
