const joi = require('joi');
const { respondError } = require('../controllers/utils/responders');

// ========================================================================================================

// For /exam/mark-answer
module.exports.validateAnswer = async (req, res, next) => {
  const schema = joi.object({
    resultId: joi.string().required(),
    answer: joi.number().min(0).max(4).required(),
    index: joi.number().min(0).required(),
  }).required();

  const result = schema.validate(req.body);
  if (result.error) return respondError(res, result.error.details[0].message, 400);
  next();
}