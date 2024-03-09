import Joi from "joi";
import { validSubscriptions } from "../models/users.js";

export const userSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

export const subscriptionUpdateSchema = Joi.object({
  subscription: Joi.string()
    .valid(...validSubscriptions)
    .required(),
});
