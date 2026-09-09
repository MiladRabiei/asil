import { AuthFlowSchema } from './interface.schema';

// Whether the phone number is already registered — this is the "check user"
// endpoint the whole flow branches on. `flow: 'LOGIN'` = existing user,
// `flow: 'SIGNUP'` = new user (see PhoneNumberForm -> AuthFlow.onInitiationSuccess).
interface AuthCreateInitiateResponse {
  flow: AuthFlowSchema;
}

interface AuthCreateLoginPasswordResponse {
  accessToken: string;
  refreshToken?: string;
}

interface AuthCreateSendLoginOtpResponse {}

interface AuthCreateForgetPasswordResponse {}

interface AuthCreateVerifyOtpResponse {
  accessToken: string;
  refreshToken?: string;
}

interface AuthCreateResendOtpResponse {}

interface AuthCreateSetPasswordResponse {}

export type {
  AuthCreateForgetPasswordResponse,
  AuthCreateInitiateResponse,
  AuthCreateLoginPasswordResponse,
  AuthCreateResendOtpResponse,
  AuthCreateSendLoginOtpResponse,
  AuthCreateSetPasswordResponse,
  AuthCreateVerifyOtpResponse,
};
