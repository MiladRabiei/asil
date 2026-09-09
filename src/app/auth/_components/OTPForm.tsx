'use client';

import useCountdown from '@/app/auth/_hooks/useCountdown';
import { notify } from '@/lib/notification/notificationService';
import { usePostResendOtp, usePostVerifyOtp } from '@/shared/_service/hook.mutation';
import { AuthCreateVerifyOtpResponse } from '@/shared/_service/interface.response';
import { AuthFlowSchema } from '@/shared/_service/interface.schema';
import { OTPFormInitialValues } from '@/shared/_service/schema';
import { OTPFormValidation } from '@/shared/_service/validation';
import Button from '@/shared/UI/Button';
import NavBackButton from '@/shared/UI/NavBackButton';
import { convertToPersianDigits } from '@/shared/utils/digitConvertor.utils';
import { useFormik } from 'formik';
import { RotateCcw } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import OTPInput from './OTPInput';
interface OTPFormProps {
  phoneNumber: string;
  onPhoneNumberEditClick: () => void;
  onVerifyOtpSuccess: (data: AuthCreateVerifyOtpResponse) => void;
  flow: AuthFlowSchema;
  /** Optional — defaults per design. Pass to distinguish signup vs. forgot-password vs. login-OTP copy if you want it. */
  title?: string;
  description?: React.ReactNode;
}

// mm:ss, Persian digits, zero-padded — matches "۰۰:۴۵ تا ارسال مجدد"
const formatCountdown = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (totalSeconds % 60).toString().padStart(2, '0');
  return convertToPersianDigits(`${minutes}:${secs}`);
};

const OTPForm: React.FC<OTPFormProps> = ({
  phoneNumber,
  onVerifyOtpSuccess,
  flow,
  onPhoneNumberEditClick,
  title = 'کد تایید را وارد کنید.',
  description,
}) => {
  const { seconds, isExpired, reset } = useCountdown(120);

  const { mutate: postVerifyOtp, isPending: isVerifying } = usePostVerifyOtp(onVerifyOtpSuccess);

  const onResendOtpSuccess = () => {
    notify.success('کد تایید ارسال شد');
    reset();
  };
  const { mutate: postResendOtp, isPending: isResending } = usePostResendOtp(onResendOtpSuccess);

  const formik = useFormik({
    initialValues: OTPFormInitialValues,
    onSubmit: (values) => {
      postVerifyOtp({ phoneNumber, otpCode: values.OTPCode, flow });
    },
    validationSchema: OTPFormValidation,
    validateOnChange: true,
    validateOnMount: true,
  });

  return (
    <section className="flex flex-col w-full justify-start ">
      <NavBackButton
        pageTitle="بازگشت"
        onClick={onPhoneNumberEditClick}
        className="m-4 lg:m-12 max-w-max font-semibold"
      />

      <div className="flex items-center justify-center w-full gap-30 px-md py-6 lg:p-0 h-full">
        <div className="flex flex-1 flex-col items-start justify-between gap-8 px-4 lg:p-0 max-w-97.5 lg:max-w-118.5 h-full lg:h-110">
          <p className="hidden w-full text-right text-2xl font-bold leading-10.5 text-foreground lg:block">
            {title}
          </p>
          <div className="flex w-full flex-col justify-start items-start gap-8">
            <div className="flex w-full flex-col gap-md text-right text-primary">
              <p className="text-base font-semibold leading-6 lg:text-lg lg:leading-7">
                کد تایید را وارد کنید.
              </p>
              <p className="text-sm font-medium leading-7 lg:text-base lg:leading-8">
                {description}
              </p>
            </div>

            <form
              id="otp-form"
              onSubmit={formik.handleSubmit}
              className="flex w-full flex-col items-center gap-md"
            >
              <OTPInput
                value={formik.values.OTPCode}
                onChange={(value) => formik.setFieldValue('OTPCode', value)}
                error={formik.touched.OTPCode ? formik.errors.OTPCode : undefined}
              />

              {isExpired ? (
                <p className="flex items-center gap-1 text-sm text-primary font-bold">
                  کد را دریافت نکردید؟
                  <Button
                    type="button"
                    variant="plain"
                    isLoading={isResending}
                    onClick={() => postResendOtp({ phoneNumber, flow })}
                    className="h-auto gap-1 p-0 text-sm font-medium text-blue-500  bg-blue-100 min-w-14 rounded-3xl py-sm px-md hover:bg-blue-100 hover:text-blue-500"
                  >
                    <RotateCcw className="size-4" />
                    ارسال مجدد
                  </Button>
                </p>
              ) : (
                <div className="flex gap-sm text-sm text-primary font-bold">
                  کد را دریافت نکردید؟{' '}
                  <p className="text-blue-500 min-w-30">
                    <span className="font-semibold ">{formatCountdown(seconds)}</span> تا ارسال مجدد
                  </p>
                </div>
              )}
            </form>
          </div>

          <Button
            type="submit"
            form="otp-form"
            disabled={!formik.isValid || formik.values.OTPCode.length < 6}
            isLoading={isVerifying}
            className="h-12 w-full rounded-3xl bg-primary text-base font-medium text-primary-foreground hover:bg-primary/90 lg:mt-auto"
          >
            ادامه بعد
          </Button>
        </div>
        <div className="hidden shrink-0 items-center justify-center lg:flex ">
          <Image
            src="/img/phone-cover.png"
            alt="phone"
            loading="eager"
            width={474}
            height={568}
            className="block w-118.5 h-132.5"
          />
        </div>
      </div>
    </section>
  );
};

export default OTPForm;
