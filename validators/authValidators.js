const joi = require('joi');
const { respondError } = require('../controllers/utils/responders');

//=======================================================================================


module.exports.validateRegistrationData = async (req, res, next) => {

  const schema = joi.object({
      name: joi.string().min(3).max(32).required().regex(/^[a-zA-Z ]*$/),
      email: joi.string().min(3).max(64).required().email(),
      password: joi.string().min(6).max(32).required().regex(/^[^<>%$()]*$/),
      program: joi.string().required(),
      gender: joi.string().allow("Male", "Female", "Other", "Prefer not to say").required()
  }).required();

  const result = schema.validate(req.body);
  if(result.error) return respondError(res, result.error.details[0].message, 400);
  next();
}



module.exports.validateLoginData = async (req, res, next) => { 
    const schema = joi.object({
        email: joi.string().min(3).max(64).required().email(),
        password: joi.string().min(6).max(32).required().regex(/^[^<>%$()]*$/),
    }).required();

    const result = schema.validate(req.body);
    if(result.error) return respondError(res, result.error.details[0].message, 400);
    next();
}



module.exports.validateChangePasswordData = async (req, res, next) => {
    const schema = joi.object({
        email: joi.string().min(3).max(64).required().email(),
        currentPassword: joi.string().min(6).max(32).required().regex(/^[^<>%$()]*$/),
        newPassword: joi.string().min(6).max(32).required().regex(/^[^<>%$()]*$/),
    }).required();

    const result = schema.validate(req.body);
    if(result.error) return respondError(res, result.error.details[0].message, 400);
    next();
}

module.exports.validateProfileData = async (req, res, next) => {
    const schema = joi.object({
        name: joi.string().min(3).max(32).required().regex(/^[a-zA-Z ]*$/),
        phone: joi.string().min(3).max(32).required().regex(/^[0-9]*$/),
        gender: joi.string().valid("Male", "Female", "Other","Prefer not to say").required(),
        program: joi.string().required()
    }).required();

    const result = schema.validate(req.body);
    if(result.error) return respondError(res, result.error.details[0].message, 400);
    next();
}