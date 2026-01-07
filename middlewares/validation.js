const { celebrate, Joi } = require("celebrate");
const validator = require("validator");

// Custom URL validator using validator.isURL()
const validateURL = (value, helpers) => {
  if (validator.isURL(value)) {
    return value;
  }
  return helpers.error("string.uri"); // standardized Joi error
};

//

//
const validateCardBody = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30).messages({
      "string.min": 'The minimum length of the "name" field is 2',
      "string.max": 'The maximum length of the "name" field is 30',
      "string.empty": 'The "name" field must be filled in',
    }),

    imageUrl: Joi.string().required().custom(validateURL).messages({
      "string.empty": 'The "imageUrl" field must be filled in',
      "string.uri": 'The "imageUrl" field must be a valid url',
    }),
  }),
});

//

//
const validateUserBody = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).messages({
      "string.min": 'The minimum length of the "name" field is 2',
      "string.max": 'The maximum length of the "name" field is 30',
    }),

    avatar: Joi.string().required().custom(validateURL).messages({
      "string.empty": 'The "avatar" field must be filled in',
      "string.uri": 'The "avatar" field must be a valid url',
    }),

    email: Joi.string().email().required().messages({
      "string.email": 'The "email" field must be a valid email address',
      "string.empty": 'The "email" field must be filled in',
    }),

    password: Joi.string().required().messages({
      "string.empty": 'The "password" field must be filled in',
    }),
  }),
});

//
// 3. Validate authentication (login)
//
const validateLoginBody = celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required().messages({
      "string.email": 'The "email" field must be a valid email address',
      "string.empty": 'The "email" field must be filled in',
    }),
    password: Joi.string().required().messages({
      "string.empty": 'The "password" field must be filled in',
    }),
  }),
});

// ID param validator
const validateId = celebrate({
  params: Joi.object().keys({
    id: Joi.string().hex().length(24).required().messages({
      "string.hex": 'The "id" must be a valid hexadecimal value',
      "string.length": 'The "id" length must be exactly 24 characters',
      "string.empty": 'The "id" field must be filled in',
    }),
  }),
});

module.exports = {
  validateURL,
  validateCardBody,
  validateUserBody,
  validateLoginBody,
  validateId,
};
