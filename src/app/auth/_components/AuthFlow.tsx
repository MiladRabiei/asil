'use client';
import { useAuth } from '@/context/AuthContext';
import { notify } from '@/lib/notification/notificationService';
import { usePostForgetPassword, usePostSendLoginOtp } from '@/shared/_service/hook.mutation';
import {
  AuthCreateLoginPasswordResponse,
  AuthCreateVerifyOtpResponse,
} from '@/shared/_service/interface.response';
import { AuthFlowSchema } from '@/shared/_service/interface.schema';
import Loading from '@/shared/UI/Loading';
import { convertToPersianDigits } from '@/shared/utils/digitConvertor.utils';
import { useState } from 'react';
import LoginMethodForm from './LoginMethodForm';
import LoginSuccession from './LoginSuccession';
import OTPForm from './OTPForm';
import PhoneNumberForm from './PhoneNumberForm';
import SetPasswordForm from './SetPasswordFrom';
type AuthStep =
  | 'INITATION'
  | 'LOGIN-METHOD'
  | 'LOGIN-OTP'
  | 'FORGET-PASSWORD'
  | 'SIGNUP-OTP'
  | 'SET-PASSWORD'
  | 'LOGGED-IN';

const AuthFlow = () => {
  const { login } = useAuth();
  const [step, setStep] = useState<AuthStep>('LOGGED-IN');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [flow, setFlow] = useState<AuthFlowSchema>('LOGIN');
  const [isSignupPasswordForm, setIsSignupPasswordForm] = useState<boolean>(false);
  /* ── Forget Password: send OTP ── */
  const onPostForgetPasswordSuccess = () => {
    notify.success('کد تایید برای بازیابی رمز ارسال شد');
    setStep('FORGET-PASSWORD');
  };
  const { mutate: postForgetPassword } = usePostForgetPassword(onPostForgetPasswordSuccess);

  /* ── Login with OTP: send OTP ── */
  const onPostLoginOtpSuccess = () => {
    notify.success('کد تایید برای ورود ارسال شد');
    setStep('LOGIN-OTP');
  };
  const { mutate: postSendLoginOtp } = usePostSendLoginOtp(onPostLoginOtpSuccess);

  /* ── Phone number check ── */
  const onInitiationSuccess = (phone: string, userFlow: AuthFlowSchema) => {
    setPhoneNumber(phone);
    setFlow(userFlow);
    setStep(userFlow === 'LOGIN' ? 'LOGIN-METHOD' : 'SIGNUP-OTP');
  };

  /* ── Success handlers ── */
  const onLoginWithPwdSuccess = (data: AuthCreateLoginPasswordResponse) => {
    notify.success('شما با موفقیت وارد شدید');
    login(data.accessToken);
    setStep('LOGGED-IN');
  };

  const onLoginOtpSuccess = (data: AuthCreateVerifyOtpResponse) => {
    notify.success('شما با موفقیت وارد شدید');
    login(data.accessToken);
    setStep('LOGGED-IN');
  };

  const onForgetPasswordOtpSuccess = (data: AuthCreateVerifyOtpResponse) => {
    login(data.accessToken);
    setStep('SET-PASSWORD');
    setIsSignupPasswordForm(false);
  };

  const onSignupOtpSuccess = (data: AuthCreateVerifyOtpResponse) => {
    notify.success('کد وارد شده صحیح است');
    login(data.accessToken as string);
    setStep('SET-PASSWORD');
    setIsSignupPasswordForm(true);
  };

  const onSettingPasswordSuccess = () => {
    notify.success('رمز عبور با موفقیت تنظیم شد');
    setStep('LOGGED-IN');
  };

  /* ── Navigation handlers ── */
  const handleForgetPassword = () => {
    setFlow('FORGET_PASSWORD');
    postForgetPassword({ phoneNumber });
  };

  const handleLoginWithOtp = () => {
    setFlow('LOGIN');
    postSendLoginOtp({ phoneNumber });
  };

  const handleBackToPhoneNumberForm = () => {
    setPhoneNumber('');
    setStep('INITATION');
  };

  /* ── Render ── */
  switch (step) {
    case 'INITATION':
      return <PhoneNumberForm key="phone-number-form" onSuccess={onInitiationSuccess} />;

    case 'LOGIN-METHOD':
      return (
        <LoginMethodForm
          key="login-method-form"
          phoneNumber={phoneNumber}
          onPasswordSuccess={onLoginWithPwdSuccess}
          onForgetPassword={handleForgetPassword}
          onLoginWithOtp={handleLoginWithOtp}
          onBack={handleBackToPhoneNumberForm}
        />
      );

    case 'LOGIN-OTP':
      return (
        <OTPForm
          key="otp-form-login"
          phoneNumber={phoneNumber}
          onVerifyOtpSuccess={onLoginOtpSuccess}
          flow={flow}
          onPhoneNumberEditClick={handleBackToPhoneNumberForm}
          title="ورود به شارژ من"
          description={
            <>
              برای ورود به حساب کاربری خود لطفا کد پیامک شده به شماره{' '}
              <strong className="font-bold">{convertToPersianDigits(phoneNumber)} </strong>
              را وارد کنید.
            </>
          }
        />
      );

    case 'FORGET-PASSWORD':
      return (
        <OTPForm
          key="otp-form-forget"
          phoneNumber={phoneNumber}
          onVerifyOtpSuccess={onForgetPasswordOtpSuccess}
          flow={flow}
          onPhoneNumberEditClick={handleBackToPhoneNumberForm}
          title="بازیابی رمز عبور"
          description={
            <>
              جهت بازیابی رمز عبور خود ابتدا کد پیامک شده به شمارهٔ{' '}
              <strong className="font-bold">{convertToPersianDigits(phoneNumber)}</strong> را وارد
              کنید.
            </>
          }
        />
      );

    case 'SIGNUP-OTP':
      return (
        <OTPForm
          key="otp-form-signup"
          phoneNumber={phoneNumber}
          onVerifyOtpSuccess={onSignupOtpSuccess}
          flow={flow}
          onPhoneNumberEditClick={handleBackToPhoneNumberForm}
          title="ثبت‌نام"
          description={
            <>
              برای ثبت‌نام لطفا کد پیامک شده به شمارهٔ{' '}
              <strong className="font-bold">{convertToPersianDigits(phoneNumber)}</strong> را وارد
              کنید.
            </>
          }
        />
      );

    case 'SET-PASSWORD':
      return (
        <SetPasswordForm
          key="set-password-form"
          phoneNumber={phoneNumber}
          onSuccess={onSettingPasswordSuccess}
          title={isSignupPasswordForm ? 'ثبت نام' : 'بازیابی رمز عبور'}
          buttonTitle={isSignupPasswordForm ? 'تایید و ادامه' : 'ذخیره و ورود'}
        />
      );

    case 'LOGGED-IN':
      return <LoginSuccession />;

    default:
      return (
        <div className="flex flex-col items-center justify-center h-[90vh]">
          <Loading size="lg" />
        </div>
      );
  }
};

export default AuthFlow;
