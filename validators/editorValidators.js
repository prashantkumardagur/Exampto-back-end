const joi = require('joi');
const { respondError } = require('../controllers/utils/responders');

//=======================================================================================

// For /editor/updateexamdetails
module.exports.validateUpdateExamData = async (req, res, next) => {
  const schema = joi.object({
    id: joi.string().required(),
    examData: joi.object({
      name: joi.string().min(3).max(64).required().regex(/^[\w\-\s]*$/),
      category: joi.array().items(joi.string().valid('JEE', 'NEET', 'SSC')).required(),
      price: joi.number().min(0).required(),
      duration: joi.number().min(10).max(60*24).required(),
      startTime: joi.number().min(0).required(),
      lastStartTime: joi.number().min(0).required(),
      marking: joi.object({
        positive: joi.number().min(1).max(1000).required(),
        negative: joi.number().min(0).max(1000).required(),
      }).required(),
      "meta.isPrivate": joi.boolean().required(),
    }).required()
  }).required();

  const result = schema.validate(req.body);
  if (result.error) return respondError(res, result.error.details[0].message, 400);
  next();
}


// For /editor/addquestion
module.exports.validateNewQuestionData = async (req, res, next) => {
  const schema = joi.object({
    id: joi.string().required(),
    data: joi.object({
      question: joi.string().min(3).max(4096).required(),
      questionImage: joi.string().allow('').max(256).required(),
      optionTypes: joi.array().items(joi.string().valid('text', 'image')).required(),
      options: joi.array().items(joi.string().min(1).max(1024).required()).required(),
      answer: joi.number().min(0).max(8).required(),
    }).required()
  }).required();

  const result = schema.validate(req.body);
  if (result.error) return respondError(res, result.error.details[0].message, 400);
  next();
}


// For /editor/updatequestion
module.exports.validateUpdateQuestionData = async (req, res, next) => {
  const schema = joi.object({
    id: joi.string().required(),
    index: joi.number().min(0).required(),
    content: joi.object({
      question: joi.string().min(3).max(4096).required(),
      options: joi.array().items(joi.string().min(1).max(1024).required()).required()
    }),
    answer: joi.number().min(0).max(8).required(),
  }).required();

  const result = schema.validate(req.body);
  if (result.error) return respondError(res, result.error.details[0].message, 400);
  next();
}
