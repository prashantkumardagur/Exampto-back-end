const Exam = require('../models/exam');
const Result = require('../models/result');
const Transaction = require('../models/transaction');
const Person = require('../models/person');

const { respondSuccess, respondError } = require('./utils/responders');

//=======================================================================================

// Get analytics
module.exports.getAnalytics = async (req, res) => {
  try{
    let liveExams = 0, completedExams = 0, practiceExams = 0;
    let enrolledStudents = 0, participation = 0, practiceAttmepts = 0;


    let exams = await Exam.find({"meta.isPublished": true, "meta.creater": req.person}, {meta: 1, price: 1});
    let students = await Person.find({role: 'user'}, {wallet: 1, meta: 1});
    let results = await Result.find({exam: {$in: exams}}, {examType: 1});

    exams.forEach(exam => {
      if(exam.meta.resultDeclared) {
        ++completedExams;
        if(exam.meta.availableForPractice) ++practiceExams;
      }
      else ++liveExams;

      enrolledStudents += exam.meta.studentsEnrolled;
    });

    results.forEach(result => {
      if(result.examType == 'practice') ++practiceAttmepts;
      else ++participation;
    });
    


    let ExamAnalytics = {
      total: exams.length,
      live: liveExams,
      completed: completedExams,
      practice: practiceExams
    };

    let StudentAnalytics = {
      total: students.length,
      enrolled: enrolledStudents,
      participated: participation,
      practice: practiceAttmepts
    }

    respondSuccess(res, 'Analytics fetched', {ExamAnalytics, StudentAnalytics});

  } catch(err) {
    return respondError(res, 'Unable to fetch analytics', 500);
  }
}



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


    let marksScored = 0;
    let totalQuestions = exam.contents.length;
    let results = await Result.find({ exam: id }).populate('user');

    results.forEach((result) => {
      for(let i=0; i<totalQuestions; i++) {
        if(result.responses[i] === exam.answers[i]) marksScored += exam.marking.positive;
        else if(result.responses[i] === 0 ) marksScored += 0;
        else marksScored -= exam.marking.negative;
      }
      result.marksAllocated = marksScored;

      result.meta.ended = true;
      if(result.meta.endedOn === undefined) result.meta.endedOn = Date.now();
      marksScored = 0;
    })

    results.sort((a, b) => {
      return b.marksAllocated - a.marksAllocated;
    })

    let rank = 0;
    let percentileGap = ( 100 / (exam.meta.studentsEnrolled -1) ).toFixed(2);
    let percentile = 100;
    results.forEach((result) => {
      result.rank = ++rank;
      result.percentile = percentile.toFixed(2);
      percentile -= percentileGap;
    });

    
    let prize10 = Math.floor(exam.price * 2.2);
    let prize15 = Math.floor(exam.price * 1.46);
    let prize25 = Math.floor(exam.price * 0.88);

    let awardMoney;
    let transaction;
    results.forEach((result) => {
      if(result.percentile > 90) awardMoney = prize10; 
      else if(result.percentile > 75) awardMoney = prize15;
      else if(result.percentile > 50) awardMoney = prize25;
      else return;

      transaction = new Transaction({
        user: result.user._id,
        amount: awardMoney,
        status: 'success',
        meta: {
          title: 'Prize money awarded',
          description: `Exam: ${exam.name}`,
          kind: 'credit',
        }
      });
      transaction.save();
      result.user.wallet.coins += awardMoney;
      result.user.wallet.transactions.push(transaction._id);
      result.user.save();
      result.save();      
    });    



    respondSuccess(res, 'Result declared', true);
  } catch (err) {
    respondError(res, err.message, 500);
  }
}



// Search for exams
module.exports.searchExams = async (req, res) => {
  const search = req.body.search;
  if(!search) return respondError(res, 'No search query provided', 400);
  try{
    let exams = await Exam.find(
      {$text: {$search: search}, 'meta.isPublished': true, 'meta.isPrivate': false, 'meta.creater': req.person._id},
      {contents: 0, solutions: 0, answers: 0}
    ).limit(3);
    
    respondSuccess(res, 'Exams fetched', exams);

  } catch(err) {
    return respondError(res, 'Unable to search', 500);
  }
}