'use client';

import { usePostLoginPassword } from '@/shared/_service/hook.mutation';
import { AuthCreateLoginPasswordResponse } from '@/shared/_service/interface.response';
import { passwordFormInitialValues } from '@/shared/_service/schema';
import { PasswordFormValidation } from '@/shared/_service/validation';
import Button from '@/shared/UI/Button';
import NavBackButton from '@/shared/UI/NavBackButton';
import TextInput from '@/shared/UI/TextInput';
import { useFormik } from 'formik';
import React from 'react';
interface PasswordFormProps {
  phoneNumber: string;
  onSuccess: (data: AuthCreateLoginPasswordResponse) => void;
  onForgetPassword: () => void;
}

const PasswordForm: React.FC<PasswordFormProps> = ({
  onSuccess,
  phoneNumber,
  onForgetPassword,
}) => {
  const formik = useFormik({
    initialValues: passwordFormInitialValues,
    onSubmit: (values) => postLoginPassword({ phoneNumber, password: values.password }),
    validationSchema: PasswordFormValidation,
    validateOnChange: false,
  });
  const { mutate: postLoginPassword } = usePostLoginPassword(onSuccess, (error) => {
    if (error.statusCode == 404) {
      formik.setFieldError('password', 'کاربر یافت نشد.');

      setTimeout(() => {
        formik.resetForm();
      }, 5000);
    }
  });

  return (
    <section className="mobile-screen">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="flex flex-col p-md gap-md bg-base-300 w-full rounded-lg">
          <h3 className="text-neutral-content text-base font-semibold text-center">
            رمز عبور را وارد نمایید
          </h3>
          <form id="phone-number-form" onSubmit={formik.handleSubmit}>
            <TextInput
              id="password"
              name="password"
              label="رمز عبور"
              placeholder="رمز عبور خود را وارد نمایید"
              type="password"
              onChange={formik.handleChange}
              error={formik.errors.password}
              value={formik.values.password}
            />
          </form>
          <Button
            variant="secondary"
            className="text-info text-xs font-semibold mb-1 mx-auto border-2 bg-transparent border-none"
            onClick={onForgetPassword}
          >
            فراموشی رمز (ورود با رمز یکبار مصرف)
          </Button>
          <div className="flex-center">
            <NavBackButton
              pageTitle="بازگشت"
              onClick={() => window.history.back()}
              className="m-4 lg:m-12 max-w-max font-semibold"
            />
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col">
        <Button
          className="w-full"
          variant="default"
          disabled={!formik.isValid || !formik.values.password}
          type="submit"
          form="phone-number-form"
        >
          ادامه دادن
        </Button>
      </div>
    </section>
  );
};

export default PasswordForm;
