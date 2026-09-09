import { SetPasswordFormSchema } from './interface.schema';

const authInitiationFormInitialValues = {
  phoneNumber: '',
};

const passwordFormInitialValues = {
  password: '',
};

const OTPFormInitialValues = {
  OTPCode: '',
};

const setPasswordFormInitialValues: SetPasswordFormSchema = {
  password: '',
  passwordConfirmation: '',
};

export {
  authInitiationFormInitialValues,
  OTPFormInitialValues,
  passwordFormInitialValues,
  setPasswordFormInitialValues,
};
