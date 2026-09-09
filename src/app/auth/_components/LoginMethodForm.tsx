'use client';

import { usePostLoginPassword } from '@/shared/_service/hook.mutation';
import { AuthCreateLoginPasswordResponse } from '@/shared/_service/interface.response';
import { ErrorResponseSchema } from '@/shared/_service/interface.schema';
import { passwordFormInitialValues } from '@/shared/_service/schema';
import { PasswordFormValidation } from '@/shared/_service/validation';
import Button from '@/shared/UI/Button';
import NavBackButton from '@/shared/UI/NavBackButton';
import TextInput from '@/shared/UI/TextInput';
import { useFormik } from 'formik';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
interface LoginMethodFormProps {
  phoneNumber: string;
  onPasswordSuccess: (data: AuthCreateLoginPasswordResponse) => void;
  onForgetPassword: () => void;
  onLoginWithOtp: () => void;
  onBack: () => void;
}

const LoginMethodForm: React.FC<LoginMethodFormProps> = ({
  phoneNumber,
  onPasswordSuccess,
  onForgetPassword,
  onLoginWithOtp,
  onBack,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const onPostLoginPasswordError = (error: ErrorResponseSchema) => {
    if (error.statusCode === 404) {
      formik.setFieldError('password', 'کاربر یافت نشد.');
      setTimeout(() => formik.resetForm(), 5000);
    }
  };
  const { mutate: postLoginPassword, isPending } = usePostLoginPassword(
    onPasswordSuccess,
    onPostLoginPasswordError
  );

  const formik = useFormik({
    initialValues: passwordFormInitialValues,
    onSubmit: (values) => postLoginPassword({ phoneNumber, password: values.password }),
    validationSchema: PasswordFormValidation,
    validateOnChange: false,
  });

  return (
    <section className="flex flex-col w-full justify-start ">
      <NavBackButton
        pageTitle="بازگشت"
        onClick={onBack}
        className="m-4 lg:m-12 max-w-max font-semibold"
      />

      <div className="flex items-center justify-center gap-30 px-md py-6 lg:p-0 h-full">
        <div className="flex flex-1 flex-col items-start justify-between gap-8 px-4 lg:p-0 max-w-97.5 lg:max-w-118.5 h-full lg:h-110">
          <p className="hidden w-full text-right text-2xl font-bold leading-10.5 text-foreground lg:block">
            ورود به پنل فروشگاه
          </p>
          <div className="flex w-full flex-col justify-start items-start gap-8 ">
            <div className="flex w-full flex-col gap-md text-right text-primary">
              <p className="text-base font-semibold leading-6 lg:text-lg lg:leading-7">
                رمز عبور خود را وارد کنید.
              </p>
              <p className="text-sm font-medium leading-7 lg:text-base lg:leading-8 ">
                برای ورود به پنل فروشگاه خود لطفا رمز عبور را وارد کنید.
              </p>
            </div>

            <div className="flex w-full flex-col items-start gap-2">
              <form
                id="login-password-form"
                onSubmit={formik.handleSubmit}
                className="flex w-full flex-col items-end gap-1"
              >
                <TextInput
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  dir="ltr"
                  label="رمز عبور"
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'مخفی کردن رمز عبور' : 'نمایش رمز عبور'}
                    >
                      {showPassword ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                    </button>
                  }
                  onChange={formik.handleChange}
                  value={formik.values.password}
                  error={formik.errors.password}
                  containerClassName="flex w-full flex-col items-start gap-1"
                  className="h-12 rounded-xl border-0 bg-surface-neutral text-xs text-foreground focus-visible:ring-1 focus-visible:ring-ring"
                />
              </form>

              <Button
                type="button"
                variant="plain"
                onClick={onForgetPassword}
                className=" h-auto p-0 text-xs font-semibold text-primary hover:bg-transparent hover:underline"
              >
                رمز عبور خود را فراموش کردید؟
              </Button>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={onLoginWithOtp}
              className=" h-auto rounded-3xl bg-overlay-black-8 px-3 py-1.5 text-xs font-semibold
               text-primary hover:bg-overlay-black-8/150"
            >
              ورود با رمز یکبار مصرف
            </Button>
          </div>

          <Button
            type="submit"
            form="login-password-form"
            disabled={!formik.isValid || !formik.values.password}
            isLoading={isPending}
            className="h-12 w-full rounded-3xl bg-primary text-base font-medium text-primary-foreground hover:bg-primary/90 lg:mt-auto"
          >
            ورود
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

export default LoginMethodForm;
