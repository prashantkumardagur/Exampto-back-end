const Exam = require('../models/exam');
const Result = require('../models/result');

const { respondSuccess, respondError } = require('./utils/responders');

//=======================================================================================


// Gets a specific exam details
module.exports.initializeExam = async (req, res) => {
  const id = req.body.id;
  if(!id) return respondError(res, 'No exam id provided', 400);

  try{
    const exam = await Exam.findById(id, {solutions: 0, answers: 0});
    if(!exam) return respondError(res, 'Exam not found', 404);

    if(exam.startTime > Date.now()) return respondError(res, 'Exam not started yet', 400);
    else if(exam.lastStartTime + exam.duration * 60 * 1000 < Date.now()) return respondError(res, 'Exam has ended', 400);


    let result = await Result.findOne({user: req.person._id, exam: id});

    if(result){
      if(result.meta.ended) return respondError(res, 'Exam already ended', 400);
      else if(result.meta.startedOn + exam.duration * 60 * 1000 < Date.now()) return respondError(res, 'Exam has ended', 400);

      return respondSuccess(res, 'Exam fetched successfully', {
        exam, 
        responses: result.responses, 
        startedOn: result.meta.startedOn,
        resultId: result._id
      });
    } 

    result = new Result({
      user: req.person._id,
      exam: id,
      responses: Array(exam.contents.length).fill(0),
      meta: {
        startedOn: Date.now(),
        isValid: true,
        disconnections: 0,
        ended: false
      }
    });
    await result.save();

    return respondSuccess(res, 'Exam initialized successfully', {
      exam, 
      responses: result.responses, 
      startedOn: result.meta.startedOn,
      resultId: result._id
    });

  } catch(err) {
    return respondError(res, err.message, 500);
  }

}



// Mark an answer for a question
module.exports.markAnswer = async (req, res) => {
  const { resultId, index, answer } = req.body;

  try{
    const result = await Result.findById(resultId);
    if(!result) return respondError(res, 'Result not found', 404);

    if(result.meta.ended) return respondError(res, 'Exam already ended', 400);
    else if(result.meta.startedOn + result.exam.duration * 60 * 1000 < Date.now()) return respondError(res, 'Exam has ended', 400);

    result.responses[index] = answer;
    await result.save();

    return respondSuccess(res, 'Answer marked successfully', true);
  
  } catch(err) {
    return respondError(res, 'Error in marking answers', 500);
  }

}


// Submit the exam
module.exports.submitExam = async (req, res) => {
  const { resultId } = req.body;
  if(!resultId) return respondError(res, 'No result id provided', 400);

  try{
    const result = await Result.findByIdAndUpdate(resultId, { $set: { "meta.ended": true, "meta.endedOn": Date.now() } });
    if(!result) return respondError(res, 'Result not found', 404);

    return respondSuccess(res, 'Exam submitted successfully', true);
  } catch(err) {
    return respondError(res, 'Error in submitting exam', 500);
  }
}