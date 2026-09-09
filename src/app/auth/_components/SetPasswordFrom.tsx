'use client';

import { notify } from '@/lib/notification/notificationService';
import { usePostSetPassword } from '@/shared/_service/hook.mutation';
import { ErrorResponseSchema, SetPasswordFormSchema } from '@/shared/_service/interface.schema';
import { setPasswordFormInitialValues } from '@/shared/_service/schema';
import { SetPasswordFormValidation } from '@/shared/_service/validation';
import Button from '@/shared/UI/Button';
import TextInput from '@/shared/UI/TextInput';
import { useFormik } from 'formik';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
interface SetPasswordFormProps {
  phoneNumber: string;
  onSuccess: () => void;
  title: string;
  buttonTitle: string;
}

const SetPasswordForm: React.FC<SetPasswordFormProps> = ({
  onSuccess,
  phoneNumber,
  title,
  buttonTitle,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onPostSetPasswordError = (error: ErrorResponseSchema) => {
    if (error.statusCode === 400 && error.message === 'Password same as previous ones') {
      notify.error('رمز عبور جدید با رمز عبور قبلی یکسان است');
      formik.resetForm();
    }
  };
  const { mutate: postSetPassword, isPending } = usePostSetPassword(
    onSuccess,
    onPostSetPasswordError
  );

  const formik = useFormik({
    initialValues: setPasswordFormInitialValues,
    onSubmit: (values: SetPasswordFormSchema) => postSetPassword({ ...values, phoneNumber }),
    validationSchema: SetPasswordFormValidation,
    validateOnChange: false,
  });

  const fieldClassName =
    'h-12 rounded-xl border-0 bg-surface-neutral text-xs text-foreground focus-visible:ring-1 focus-visible:ring-ring';

  return (
    <section className="flex flex-col w-full justify-start ">
      <div className="flex items-center justify-center gap-30 px-md py-6 lg:p-0 h-full">
        <div className="flex flex-1 flex-col items-start justify-between gap-8 px-4 lg:p-0 max-w-97.5 lg:max-w-118.5 h-full lg:h-110">
          <p className="hidden w-full text-right text-2xl font-bold leading-10.5 text-foreground lg:block">
            {title}
          </p>
          <div className="flex w-full flex-col justify-start items-start gap-8">
            <p className="w-full text-right text-base font-semibold leading-6 text-primary lg:text-lg lg:leading-7">
              انتخاب رمز عبور جدید
            </p>

            <form
              id="set-password-form"
              onSubmit={formik.handleSubmit}
              className="flex w-full flex-col items-end gap-5"
            >
              <TextInput
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="رمز عبور جدید"
                leftIcon={
                  <Button
                    type="button"
                    variant={'plain'}
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'مخفی کردن رمز عبور' : 'نمایش رمز عبور'}
                  >
                    {showPassword ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  </Button>
                }
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.errors.password}
                containerClassName="flex w-full flex-col items-start gap-1"
                className={fieldClassName}
              />

              <TextInput
                id="passwordConfirmation"
                name="passwordConfirmation"
                type={showConfirmPassword ? 'text' : 'password'}
                label="تکرار رمز عبور جدید"
                leftIcon={
                  <Button
                    type="button"
                    variant={'plain'}
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? 'مخفی کردن رمز عبور' : 'نمایش رمز عبور'}
                  >
                    {showConfirmPassword ? (
                      <Eye className="size-4" />
                    ) : (
                      <EyeOff className="size-4" />
                    )}
                  </Button>
                }
                value={formik.values.passwordConfirmation}
                onChange={formik.handleChange}
                error={formik.errors.passwordConfirmation}
                containerClassName="flex w-full flex-col items-start gap-1"
                className={fieldClassName}
              />
            </form>
          </div>

          <Button
            type="submit"
            form="set-password-form"
            disabled={
              !formik.isValid || !formik.values.password || !formik.values.passwordConfirmation
            }
            isLoading={isPending}
            className="h-12 w-full rounded-3xl bg-primary text-base font-medium text-primary-foreground hover:bg-primary/90 lg:mt-auto"
          >
            {buttonTitle}
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

export default SetPasswordForm;
