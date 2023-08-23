import Joi from 'joi';
import { min } from 'moment';

export const addLocationSchema = Joi.object({
  name: Joi.string().required(),
  state: Joi.string().required(),
  decimal: Joi.number().min(0).required(),
  currency_id: Joi.number().min(0).required(),
  business_id: Joi.number().min(0).required(),
});
