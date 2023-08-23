import Joi from 'joi';

export const addCustomerSchema = Joi.object()
  .keys({
    first_name: Joi.string().required().messages({
      'string.empty': 'First name is required',
    }),
    last_name: Joi.string().allow(''),
    mobile: Joi.string().required().messages({
      'string.empty': 'Mobile number is required',
    }),
    city: Joi.string().allow(''),
    state: Joi.string().allow(''),
    country: Joi.string().allow(''),
    address_line_1: Joi.string().allow(''),
    address_line_2: Joi.string().allow(''),
    zip_code: Joi.string().allow(''),
    shipping_address: Joi.string().allow(''),
  })
  .unknown(true);
