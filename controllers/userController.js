const Exam = require('../models/exam');
const Person = require('../models/person');
const Result = require('../models/result');

const path = require('path');

const { respondSuccess, respondError } = require('./utils/responders');

//=======================================================================================


// Gets a specific exam details
module.exports.getExam = async (req, res) => {
  const id = req.body.id;
  if(!id) return respondError(res, 'No exam id provided', 400);
  try{
    let exam = await Exam.findById(id, {contents: 0, solutions: 0});
    if(!exam) return respondError(res, 'Exam not found', 404);

    let isEnrolled = req.person.examsEnrolled.includes(id) ? true : false;

    let myExam = exam.toObject();
    myExam.totalQuestions = exam.answers.length;
    myExam.answers = undefined;

    let result = await Result.findOne({user: req.person._id, exam: id});
    if(!result) result = null;
    
    respondSuccess(res, 'Exam fetched', {isEnrolled, myExam, result});
  } catch(err) {
    respondError(res, 'Unable to fetch exam', 500);
  }
}


// Get exam with all details for results page
module.exports.getResult = async (req, res) => {
  const id = req.body.id;
  if(!id) return respondError(res, 'No exam id provided', 400);
  try{
    let exam = await Exam.findById(id);
    if(!exam) return respondError(res, 'Exam not found', 404);

    if(!exam.meta.resultDeclared) return respondError(res, 'Results not declared yet', 403);

    let result = await Result.findOne({exam: id, user: req.person._id});
    if(!result) return respondError(res, 'Results not found', 404);

    respondSuccess(res, 'Results fetched', {exam, result});

  } catch(err) {
    respondError(res, 'Unable to fetch exam', 500);
  }
}

// Get solution file of an exam
module.exports.downloadSolution = async (req, res) => {
  const id = req.body.examId;
  if(!id) return respondError(res, 'No exam id provided', 400);
  try{
    let exam = await Exam.findById(id);
    if(!exam) return respondError(res, 'Exam not found', 404);
    if(!exam.meta.resultDeclared) return respondError(res, 'Results not declared yet', 403);
    if(exam.solutions == 0) return respondError(res, 'No solution file available', 400);

    res.sendFile(path.join(__dirname, `../uploads/solutions/${id}.pdf`));
  } catch(err) {
    respondError(res, err.message, 500);
  }
}


//Enroll user in an exam
module.exports.enroll = async (req, res) => {
  const id = req.body.id;
  if(!id) return respondError(res, 'No exam id provided', 400);
  try{
    let exam = await Exam.findById(id);
    if(!exam) return respondError(res, 'Exam not found', 404);
    if(exam.startTime < Date.now()) return respondError(res, 'Exam has already started', 400);

    let person = await Person.findById(req.person._id);
    if(!person) return respondError(res, 'Unable to enroll', 500);
    if(person.examsEnrolled.includes(id)) return respondError(res, 'You are already enrolled in this exam', 400);

    person.examsEnrolled.push(id);
    await person.save();

    exam.meta.studentsEnrolled++;
    await exam.save();

    respondSuccess(res, 'Exam enrolled', true);

  } catch(err) {
    return respondError(res, 'Unable to enroll in exam', 500);
  }
}


// =========================================================================================

// Gets all exams of a user
module.exports.getExams = async (req, res) => {
  try{
    let myExam;
    let person = await Person.findById(req.person._id, {examsEnrolled: 1}).populate('examsEnrolled', {contents: 0, solutions: 0});
    let enrolledExams = [];
    person.examsEnrolled.forEach(exam => {
      myExam = exam.toObject();
      myExam.totalQuestions = exam.answers.length;
      myExam.answers = undefined;
      enrolledExams.push(myExam);
    });

    let exams = await Exam.find({'meta.isPublished': true, 'meta.isPrivate': false, startTime: {$gt: Date.now()} }, {contents: 0, solutions: 0});
    let availableExams = [];
    exams.forEach(exam => {
      myExam = exam.toObject();
      myExam.totalQuestions = exam.answers.length;
      myExam.answers = undefined;
      availableExams.push(myExam);
    });

    respondSuccess(res, 'Exams fetched', {availableExams, enrolledExams});

  } catch(err){
    return respondError(res, 'Unable to fetch exams', 500);
  }
}

// =========================================================================================

// Gets all declared results of a user
module.exports.getResults = async (req, res) => {
  try{
    let results = await Result.find({user: req.person._id}).populate('exam', {meta: 1, name: 1});

    let myResults = [];
    results.forEach(result => {
      if(result.exam.meta.resultDeclared) myResults.push(result.toObject());
    });

    respondSuccess(res, 'Results fetched', myResults);
  } catch(err) {
    return respondError(res, 'Unable to fetch results', 500);
  }
}
