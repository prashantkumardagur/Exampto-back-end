const Exam = require('../models/exam');

const path = require('path');

const { respondSuccess, respondError } = require('./utils/responders');

//=======================================================================================


// Gets exam data for a given exam id
module.exports.getExam = async (req, res) => {
  const id = req.body.id;
  if(!id) respondError(res, 'Exam id not provided', 400);
  try{
    const exam = await Exam.findById(id);
    if(!exam) return respondError(res, 'Exam not found', 404);
    respondSuccess(res, 'Exam fetched', exam);
  } catch(err) {
    respondError(res, 'Failed to fetch exam', 500);
  }
}


// Publishes the exam
module.exports.publishExam = async (req, res) => {
  const id = req.body.id;
  if(!id) return respondError(res, 'Exam id not provided', 400);
  try{
    const exam = await Exam.findByIdAndUpdate(id, { 'meta.isPublished': true });
    if(!exam) return respondError(res, 'Exam not found', 404);
    respondSuccess(res, 'Exam published', true);
  } catch(err) {
    respondError(res, 'Failed to publish exam', 500);
  }
}


// Updates the details of the exam
module.exports.updateExamDetails = async (req, res) => {
  const id = req.body.id;
  const examData = req.body.examData;
  try{
    const exam = await Exam.findByIdAndUpdate(id, examData, { new: true });
    if(!exam) return respondError(res, 'Exam not found', 404);
    respondSuccess(res, 'Exam updated', true);
  } catch(err) {
    respondError(res, 'Failed to update exam', 500);
  }
}


// Add new question to the exam
module.exports.addQuestion = async (req, res) => {
  const id = req.body.id;
  const { question, options, answer } = req.body.data;
  try{
    const exam = await Exam.findById(id);
    if(!exam) return respondError(res, 'Exam not found', 404);
    exam.contents.push({ question, options });
    exam.answers.push(answer);
    await exam.save();
    respondSuccess(res, 'Question added', true);
  } catch(err) {
    respondError(res, 'Failed to add question', 500);
  }
}


// Updates a question at a given index in the exam
module.exports.updateQuestion = async (req, res) => {
  const id = req.body.id;
  const { index, content, answer } = req.body;
  try{
    const exam = await Exam.findById(id);
    if(!exam) return respondError(res, 'Exam not found', 404);
    exam.contents[index] = content;
    exam.answers[index] = answer;
    await exam.save();
    respondSuccess(res, 'Question updated', true);
  } catch(err) {
    respondError(res, 'Failed to update question', 500);
  }
}

// Deletes a question at a given index in the exam
module.exports.deleteQuestion = async (req, res) => {
  const id = req.body.id;
  const index = req.body.index;
  if(!index || !id) return respondError(res, 'Invalid request', 400);
  try{
    const exam = await Exam.findById(id);
    if(!exam) return respondError(res, 'Exam not found', 404);
    exam.contents.splice(index, 1);
    exam.answers.splice(index, 1);
    await exam.save();
    respondSuccess(res, 'Question deleted', true);
  } catch(err) {
    respondError(res, 'Failed to delete question', 500);
  }
}

// Solution upload
module.exports.solutionUpload = async (req, res) => {
  const id = req.body.examId;
  if(!id) return respondError(res, 'Exam id not provided', 400);
  try{
    let exam = await Exam.findByIdAndUpdate(id, { solutions: req.file.size });
    if(!exam) return respondError(res, 'Exam not found', 404);
    respondSuccess(res, 'Solution uploaded', true);
  } catch(err) {
    respondError(res, 'Failed to upload solution', 500);
  }
}
