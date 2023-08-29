import Joi from 'joi';
export default Joi.object({
  first_name: Joi.string().required().messages({
    'string.empty': 'First name is required',
    'any.required': 'First name is required',
  }),
  last_name: Joi.string().optional().allow(''),
  number: Joi.string().required().messages({
    'string.empty': 'Phone number is required',
    'any.required': 'Phone number is required',
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Email must be a valid email',
      'string.empty': 'Email is required',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .required()
    // .pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/)
    .messages({
      'string.empty': 'Password is required',
      'string.pattern.base':
        'Password must contain at least 6 characters, 1 uppercase letter, 1 lowercase letter and 1 number',
      'any.required': 'Password is required',
    }),
  repeat_password: Joi.string().valid(Joi.ref('password')).required().messages({
    'string.empty': 'Repeat password is required',
    'any.only': 'Passwords must match',
    'any.required': 'Repeat password is required',
  }),
});
