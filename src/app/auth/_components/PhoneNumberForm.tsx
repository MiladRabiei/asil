'use client';

import { usePostAuthInitation } from '@/shared/_service/hook.mutation';
import { AuthCreateInitiateResponse } from '@/shared/_service/interface.response';
import { AuthFlowSchema } from '@/shared/_service/interface.schema';
import { authInitiationFormInitialValues } from '@/shared/_service/schema';
import { AuthInitiationFormValidation } from '@/shared/_service/validation';
import Button from '@/shared/UI/Button';
import NavBackButton from '@/shared/UI/NavBackButton';
import TextInput from '@/shared/UI/TextInput';
import { createLatinDigitChangeHandler } from '@/shared/utils/digitConvertor.utils';
import { useFormik } from 'formik';
import { Phone } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
interface PhoneNumberFormProps {
  onSuccess: (phoneNumber: string, flow: AuthFlowSchema) => void;
}

const PhoneNumberForm: React.FC<PhoneNumberFormProps> = ({ onSuccess }) => {
  const onPostAuthInitationSuccess = (data: AuthCreateInitiateResponse) => {
    onSuccess(formik.values.phoneNumber, data.flow);
  };
  const { mutate: postAuthInitation, isPending } = usePostAuthInitation(onPostAuthInitationSuccess);

  const formik = useFormik({
    initialValues: authInitiationFormInitialValues,
    onSubmit: (values) => postAuthInitation(values),
    validationSchema: AuthInitiationFormValidation,
    validateOnChange: true,
  });

  return (
    <section className="flex flex-col w-full justify-start ">
      <NavBackButton
        pageTitle="بازگشت"
        onClick={() => window.history.back()}
        className="m-4 lg:m-12 max-w-max font-semibold"
      />

      <div className="flex items-center justify-center  gap-30 px-md py-6 lg:p-0 h-full">
        <div className="flex flex-1 flex-col items-start justify-between gap-8 px-4 lg:p-0 max-w-97.5 lg:max-w-118.5 h-full lg:h-110">
          <p className="hidden w-full text-right text-2xl font-bold leading-10.5 text-foreground lg:block">
            ورود | ثبت‌نام
          </p>

          <div className="flex w-full flex-col justify-start items-start gap-8 ">
            <div className="flex w-full flex-col  gap-md text-right text-primary ">
              <p className="text-base  font-semibold leading-6 lg:text-lg lg:leading-7">
                شماره موبایل خود را وارد کنید.
              </p>
              <p className="text-sm font-medium leading-7 lg:text-base lg:leading-8">
                برای ورود یا ثبت‌نام شماره موبایل خود را وارد کنید.
                <br />
                کد تأیید به این شماره ارسال خواهد شد.
              </p>
            </div>

            <form
              id="phone-number-form"
              onSubmit={formik.handleSubmit}
              className="flex w-full flex-col items-end gap-3"
            >
              <TextInput
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                dir="ltr"
                label="شماره موبایل"
                placeholder="۰۹---------"
                leftIcon={<Phone className="size-4" />}
                onChange={createLatinDigitChangeHandler(formik.setFieldValue, 'phoneNumber')}
                value={formik.values.phoneNumber}
                error={formik.errors.phoneNumber}
                containerClassName="flex w-full flex-col items-start gap-1"
                className="h-12 rounded-xl border-0 bg-surface-neutral text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
              />
            </form>
          </div>

          <Button
            type="submit"
            form="phone-number-form"
            disabled={!formik.isValid}
            isLoading={isPending}
            className="h-12 w-full rounded-3xl bg-primary text-base font-medium text-primary-foreground hover:bg-primary/90 lg:mt-auto"
          >
            مرحله بعد
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

export default PhoneNumberForm;
