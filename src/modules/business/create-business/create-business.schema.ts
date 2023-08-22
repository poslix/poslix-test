import Joi from 'joi';
// {
//   name: '',
//   mobile: '',
//   mobile: '',
//   email: '',
//   business_type_id: '',
// }

// create validation schema for the previous object

export const createBusinessSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Name is required',
    'any.required': 'Name is required',
  }),
  mobile: Joi.string().required().messages({
    'string.empty': 'Mobile is required',
    'any.required': 'Mobile is required',
  }),
  email: Joi.string()
    .email({
      tlds: { allow: false },
    })
    .required()
    .messages({
      'string.email': 'Email must be a valid email',
      'string.empty': 'Email is required',
      'any.required': 'Email is required',
    }),
  // decimal: Joi.number().required().min(0).messages({
  //   'number.min': 'Decimal must be greater than 0',
  //   'any.required': 'Decimal is required',
  // }),
  business_type_id: Joi.number().required(),
  // country_id: Joi.number().required(),
});
