import * as yup from 'yup';
import {appString} from '../constants';

const emailRegex =
  /^[a-zA-Z0-9](?!.*\.\.)[a-zA-Z0-9._%+-]{0,63}@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

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

    // Catalog validation schemas
    addNewLotValidation: yup.object({
      lotNumber: yup
        .string()
        .required('Lot number is required')
        .matches(/^\d+$/, 'Lot number must contain only digits'),
      
      title: yup
        .string()
        .required('Title is required')
        .min(3, 'Title must be at least 3 characters long')
        .max(200, 'Title must not exceed 200 characters'),
      
      description: yup
        .string()
        .max(1000, 'Description must not exceed 1000 characters'),
      
      quantity: yup
        .string()
        .required('Quantity is required')
        .matches(/^\d+$/, 'Quantity must be a valid number')
        .test('min-quantity', 'Quantity must be at least 1', value => {
          const num = parseInt(value, 10);
          return !isNaN(num) && num >= 1;
        })
        .test('max-quantity', 'Quantity must not exceed 9999', value => {
          const num = parseInt(value, 10);
          return !isNaN(num) && num <= 9999;
        }),
      
      startPrice: yup
        .string()
        .required('Start price is required')
        .matches(/^\d+(\.\d{1,2})?$/, 'Start price must be a valid number')
        .test('min-price', 'Start price cannot be negative', value => {
          const num = parseFloat(value);
          return !isNaN(num) && num >= 0;
        }),
      
      buyNowPrice: yup
        .string()
        .optional()
        .matches(/^\d+(\.\d{1,2})?$/, 'Buy now price must be a valid number')
        .test('min-price', 'Buy now price cannot be negative', value => {
          if (!value) return true;
          const num = parseFloat(value);
          return !isNaN(num) && num >= 0;
        }),
      
      reserve: yup
        .string()
        .optional()
        .matches(/^\d+(\.\d{1,2})?$/, 'Reserve price must be a valid number')
        .test('min-price', 'Reserve price cannot be negative', value => {
          if (!value) return true;
          const num = parseFloat(value);
          return !isNaN(num) && num >= 0;
        }),
    }),

    lotDetailsValidation: yup.object({
      lotNumber: yup
        .string()
        .required('Lot number is required')
        .matches(/^\d+$/, 'Lot number must contain only digits'),
      
      title: yup
        .string()
        .required('Title is required')
        .min(3, 'Title must be at least 3 characters long')
        .max(200, 'Title must not exceed 200 characters'),
      
      description: yup
        .string()
        .max(1000, 'Description must not exceed 1000 characters'),
      
      startPrice: yup
        .string()
        .required('Start price is required')
        .matches(/^\d+(\.\d{1,2})?$/, 'Start price must be a valid number')
        .test('min-price', 'Start price cannot be negative', value => {
          const num = parseFloat(value);
          return !isNaN(num) && num >= 0;
        }),
      
      buyNowPrice: yup
        .string()
        .optional()
        .matches(/^\d+(\.\d{1,2})?$/, 'Buy now price must be a valid number')
        .test('min-price', 'Buy now price cannot be negative', value => {
          if (!value) return true;
          const num = parseFloat(value);
          return !isNaN(num) && num >= 0;
        }),
      
      reserve: yup
        .string()
        .optional()
        .matches(/^\d+(\.\d{1,2})?$/, 'Reserve price must be a valid number')
        .test('min-price', 'Reserve price cannot be negative', value => {
          if (!value) return true;
          const num = parseFloat(value);
          return !isNaN(num) && num >= 0;
        }),
      
      lowEstimate: yup
        .string()
        .optional()
        .matches(/^\d+(\.\d{1,2})?$/, 'Low estimate must be a valid number'),
      
      highEstimate: yup
        .string()
        .optional()
        .matches(/^\d+(\.\d{1,2})?$/, 'High estimate must be a valid number'),
      
      mainCategory: yup
        .string()
        .required('Category is required'),
      
      subCategory: yup
        .string()
        .required('Sub-category is required'),
    }),

    lotImagesValidation: yup.object({
      images: yup
        .array()
        .of(yup.object().shape({
          uri: yup.string().nullable().required('Image is required'),
          id: yup.string().required(),
        }))
        .min(1, 'At least one image is required'),
    }),

    addNewSaleValidation: yup.object({
      sale: yup.string().required('Please select sale'),
      businessName: yup.string().required('Business name is required'),
      title: yup
        .string()
        .trim()
        .required('Title is required')
        .max(200, 'Title must not exceed 200 characters'),
      saleType: yup.string().required('Sale type is required'),
      categories: yup
        .array()
        .of(yup.string())
        .min(1, 'Please select at least one category'),
      shortDescription: yup
        .string()
        .trim()
        .required('Short description is required')
        .max(350, 'Short description must not exceed 350 characters'),
      fullDescription: yup
        .string()
        .trim()
        .required('Full description is required')
        .max(4500, 'Full description must not exceed 4500 characters'),
      dateMode: yup.string().required('Sale type is required'),
      saleDate: yup.string().when('dateMode', {
        is: 'One day sale',
        then: schema => schema.required('Sale date is required'),
        otherwise: schema => schema.optional(),
      }),
      startTime: yup.string().required('Start time is required'),
      endTime: yup.string().required('End time is required'),
      userTimeZone: yup.string().required('Your time zone is required'),
      saleTimeZone: yup.string().required('Sale time zone is required'),
      uploadTitle: yup.string().optional(),
      sameAsCompanyAddress: yup.boolean().optional(),
      address: yup.string().trim().required('Address is required'),
      state: yup.string().required('State is required'),
      city: yup.string().required('City is required'),
      zipCode: yup.string().trim().required('Zip code is required'),
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
        .min(3, appString.validationError.firstNameMin)
        .matches(/^[a-zA-Z ]+$/, appString.validationError.firstNameInvalid)
        .required(appString.validationError.firstNameRequired),

      lastName: yup
        .string()
        .trim()
        .min(3, appString.validationError.lastNameMin)
        .matches(/^[a-zA-Z ]+$/, appString.validationError.lastNameInvalid)
        .required(appString.validationError.lastNameRequired),

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
