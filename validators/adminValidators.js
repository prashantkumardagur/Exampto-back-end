const joi = require('joi');
const { respondError } = require('../controllers/utils/responders');

//=======================================================================================


module.exports.validateNewCoordinatorData = async (req, res, next) => {
  
  const schema = joi.object({
    name: joi.string().min(3).max(32).required().regex(/^[a-zA-Z ]*$/),
    email: joi.string().min(3).max(64).required().email(),
    password: joi.string().min(6).max(32).required().regex(/^[^<>%$()]*$/),
  }).required();

  const result = schema.validate(req.body);
  if(result.error) return respondError(res, result.error.details[0].message, 400);
  next();
  
}