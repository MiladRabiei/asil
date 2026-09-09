import * as Yup from 'yup';

const AuthInitiationFormValidation = Yup.object().shape({
  phoneNumber: Yup.string()
    .required('این فیلد اجباری است.')
    .matches(/^\d+$/, 'فقط اعداد مجاز هستند.')
    .length(11, 'شماره باید ۱۱ رقم باشد.'),
});

const PasswordFormValidation = Yup.object().shape({
  password: Yup.string()
    .required('این فیلد اجباری است.')
    .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد.'),
});

// OTPInput.tsx defaults to length={6} — keep in sync if that default changes.
const OTPFormValidation = Yup.object().shape({
  OTPCode: Yup.string()
    .required('این فیلد اجباری است.')
    .matches(/^\d+$/, 'فقط اعداد مجاز هستند.')
    .length(6, 'کد تایید باید ۶ رقم باشد.'),
});

const SetPasswordFormValidation = Yup.object().shape({
  password: Yup.string()
    .required('این فیلد اجباری است.')
    .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد.'),
  passwordConfirmation: Yup.string()
    .required('این فیلد اجباری است.')
    .oneOf([Yup.ref('password')], 'رمزهای وارد شده یکسان نیستند.'),
});
export {
  AuthInitiationFormValidation,
  OTPFormValidation,
  PasswordFormValidation,
  SetPasswordFormValidation,
};
