import * as yup from 'yup';
import {appString} from '../constants';

const emailRegex =
  /^[a-zA-Z0-9](?!.*\.\.)[a-zA-Z0-9._%+-]{0,63}@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

const passwordRegex = /^(?!.*[<>])[A-Za-z0-9!@#$%^&*()_+=\-.,?/~`]{8,}$/;

export const ValidationSchemas = () => {
  return {
    loginValidation: yup.object({
      email: yup
        .string()
        .trim()
        .matches(emailRegex, appString.validationError.invalidEmail)
        .required(appString.validationError.emailRequired),

      password: yup
        .string()
        .required(appString.validationError.passwordRequired)
        .min(8, appString.validationError.passwordMin)
        .matches(/\S/, appString.validationError.passwordInvalid)
        .matches(/[A-Z]/, appString.validationError.passwordRule)
        .matches(/[a-z]/, appString.validationError.passwordRule)
        .matches(/[0-9]/, appString.validationError.passwordRule)
        .matches(/[@$!%*?&#^()_\-+=]/, appString.validationError.passwordRule),
    }),

    personalInformationValidation: yup.object({
      fullName: yup
        .string()
        .trim()
        .min(3, appString.validationError.nameMin)
        .matches(/^[a-zA-Z0-9.@ ]+$/, appString.validationError.nameInvalid)
        .required(appString.validationError.nameRequired),

      dob: yup.string().required(appString.validationError.dobRequired),

      phone: yup
        .string()
        .required(appString.validationError.phoneRequired)
        .matches(/^[0-9]+$/, appString.validationError.phoneInvalid)
        .min(6, appString.validationError.phoneMin),

      gender: yup.string().required(appString.validationError.genderRequired),
    }),
    editProfileValidation: yup.object({
      fullName: yup
        .string()
        .trim()
        .min(3, appString.validationError.nameMin)
        .matches(/^[a-zA-Z ]+$/, appString.validationError.nameInvalid)
        .required(appString.validationError.nameRequired),

      dob: yup.string().required(appString.validationError.dobRequired),
      gender: yup.string().required(appString.validationError.genderRequired),
    }),
    signUpValidation: yup.object({
      firstName: yup
        .string()
        .trim()
        .min(3, appString.validationError.nameMin)
        .matches(/^[a-zA-Z ]+$/, appString.validationError.nameInvalid)
        .required(appString.validationError.nameRequired),

      lastName: yup
        .string()
        .trim()
        .min(3, appString.validationError.nameMin)
        .matches(/^[a-zA-Z ]+$/, appString.validationError.nameInvalid)
        .required(appString.validationError.nameRequired),

      companyName: yup
        .string()
        .trim()
        .min(2, 'Company name must be at least 2 characters')
        .required('Company name is required'),

      email: yup
        .string()
        .trim()
        .matches(emailRegex, appString.validationError.invalidEmail)
        .required(appString.validationError.emailRequired),

      phone: yup
        .string()
        .required(appString.validationError.phoneRequired)
        .matches(/^[0-9]+$/, appString.validationError.phoneInvalid)
        .min(6, appString.validationError.phoneMin),

      password: yup
        .string()
        .required(appString.validationError.passwordRequired)
        .min(8, appString.validationError.passwordMin)
        .matches(/\S/, appString.validationError.passwordInvalid)
        .matches(/[A-Z]/, appString.validationError.passwordRule)
        .matches(/[a-z]/, appString.validationError.passwordRule)
        .matches(/[0-9]/, appString.validationError.passwordRule)
        .matches(/[@$!%*?&#^()_\-+=]/, appString.validationError.passwordRule),
    }),
    forgotPasswordValidation:yup.object({
      email: yup
        .string()
        .trim()
        .matches(emailRegex, appString.validationError.invalidEmail)
        .required(appString.validationError.emailRequired),
    }),

  };
};
