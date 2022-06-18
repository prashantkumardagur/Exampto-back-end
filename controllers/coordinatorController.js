const Exam = require('../models/exam');
const Result = require('../models/result');

const { respondSuccess, respondError } = require('./utils/responders');

//=======================================================================================

module.exports.initializeTest = async (req, res) => {
  const newExam = new Exam({
    name : 'New Test Name',
    category : 'JEE',
    marking : {
        positive : 4,
        negative : 1,
    },
    duration : 180,
    startTime : Date.now() + 604800000,
    lastStartTime : Date.now() + 605400000,
    price : 0,
    solutions : '',
    contents : [],
    answers : [],
    meta : {
        studentsEnrolled : 0,
        resultDeclared : false,
        isPublished : false,
        isPrivate : false,
        createdOn : Date.now(),
        creater : req.person
    }
  });
  try {
    await newExam.save();
    respondSuccess(res, 'Test initialized', newExam._id);
  } catch (err) {
    respondError(res, 'Failed to initialize test', 500);
  }
}

//=======================================================================================

// Get list of all unpublished exams
module.exports.getUnpublishedExams = async (req, res) => {
  const id = req.person._id;
  try {
    let exams = await Exam.find(
      {'meta.isPublished': false, 'meta.creater': id}, 
      {name: 1, _id: 1, meta: 1, category: 1, price: 1, answers: 1, startTime: 1}
    );

    let myExams = [];
    exams.forEach(exam => {
      let myExam = exam.toObject();
      myExam.totalQuestions = exam.answers.length;
      myExam.answers = undefined;
      myExams.push(myExam);
    });

    respondSuccess(res, 'Unpublished exams fetched', myExams);
  } catch (err) {
    respondError(res, err.message, 500);
  }
}


// Get list of coordinator's exams
module.exports.getAllExams = async (req, res) => {
  const id = req.person._id;
  try {
    let allExams = await Exam.find({'meta.isPublished': true, 'meta.creater': id},
    {name: 1, _id: 1, meta: 1, category: 1, price: 1, answers: 1, startTime: 1});
    let myExams = [];
    allExams.forEach(exam => {
      let myExam = exam.toObject();
      myExam.totalQuestions = exam.answers.length;
      myExam.answers = undefined;
      myExams.push(myExam);
    });

    respondSuccess(res, 'Exams fetched', myExams);
  } catch (err) {
    respondError(res, 'Unable to fetch exams', 500);
  }
}


// Get complete exam
module.exports.getExam = async (req, res) => {
  const id = req.body.id;
  if(!id) return respondError(res, 'Exam id not provided', 400);
  try {
    let exam = await Exam.findById(id, {contents: 0, solutions: 0});
    if (!exam) { return respondError(res, 'Exam not found', 404); }

    let myExam = exam.toObject();
    myExam.totalQuestions = exam.answers.length;
    myExam.answers = undefined;
    
    respondSuccess(res, 'Exam fetched', myExam);
  } catch (err) {
    respondError(res, 'Unable to fetch exam', 500);
  }
}


// Declare result of an exam
module.exports.declareResult = async (req, res) => {
  const id = req.body.id;
  if(!id) return respondError(res, 'Exam id not provided', 400);

  try {
    let exam = await Exam.findByIdAndUpdate(id, 
        { $set: { 'meta.resultDeclared': true, 'meta.resultDeclaredOn': Date.now() } }
      );

    if (!exam) { return respondError(res, 'Exam not found', 404); }

    await Result.updateMany({ exam: id },{ $set: { 'meta.ended': true, 'meta.endedOn': Date.now() } } );

    respondSuccess(res, 'Result declared', true);
  } catch (err) {
    respondError(res, err.message, 500);
  }
}