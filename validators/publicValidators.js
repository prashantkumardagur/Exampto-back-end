const joi = require('joi');
const { respondError } = require('../controllers/utils/responders');

//=======================================================================================

module.exports.validateNewsletterEmail = async (req, res, next) => {
  const schema = joi.object({
    email: joi.string().min(3).max(64).required().email(),
  }).required();

  const result = schema.validate(req.body);
  if(result.error) return respondError(res, result.error.details[0].message, 400);
  next();
}


module.exports.validateMessage = async (req, res, next) => {
  const schema = joi.object({
    email: joi.string().min(3).max(64).required().email(),
    message: joi.string().min(3).max(1024).required(),
  }).required();

  const result = schema.validate(req.body);
  if(result.error) return respondError(res, result.error.details[0].message, 400);
  next();
}