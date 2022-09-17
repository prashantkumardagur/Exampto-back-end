const Person = require('../models/person');
const Exam = require('../models/exam');
const Public = require('../models/public');
const Transaction = require('../models/transaction');
const Result = require('../models/result');

const bcrypt = require('bcryptjs');

const { respondSuccess, respondError } = require('./utils/responders');

//=======================================================================================

// Get analytics
module.exports.getAnalytics = async (req, res) => {
  try{
    let liveExams = 0, completedExams = 0, practiceExams = 0;
    let enrolledStudents = 0, participation = 0, practiceAttmepts = 0;
    let moneyRecieved = 0, moneyCollected = 0, prizeDistributed = 0, prizePending = 0;


    let exams = await Exam.find({"meta.isPublished": true}, {meta: 1, price: 1});
    let students = await Person.find({role: 'user'}, {wallet: 1, meta: 1});
    let results = await Result.find({}, {examType: 1});
    let transactions = await Transaction.find({}, {amount: 1, meta: 1});

    exams.forEach(exam => {
      if(exam.meta.resultDeclared) {
        ++completedExams;
        if(exam.meta.availableForPractice) ++practiceExams;
        
        prizeDistributed += Math.floor(exam.meta.studentsEnrolled * exam.price * 0.667);
      }
      else ++liveExams;

      enrolledStudents += exam.meta.studentsEnrolled;
      moneyCollected += exam.meta.studentsEnrolled * exam.price;
      prizePending += Math.floor(exam.meta.studentsEnrolled * exam.price * 0.667);
    });

    results.forEach(result => {
      if(result.examType == 'practice') ++practiceAttmepts;
      else ++participation;
    });

    transactions.forEach(transaction => {
      if(transaction.meta.kind === 'deposit') moneyRecieved += transaction.amount;
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

    let MoneyAnalytics = {
      recieved: moneyRecieved,
      collected: moneyCollected,
      distributed: prizeDistributed,
      pending: prizePending,
      studentOwned: moneyRecieved - moneyCollected + prizeDistributed,
      profit: moneyCollected - prizeDistributed - prizePending
    }

    respondSuccess(res, 'Analytics fetched', {ExamAnalytics, StudentAnalytics, MoneyAnalytics});

  } catch(err) {
    return respondError(res, 'Unable to fetch analytics', 500);
  }
}


// Gets list of all coordinators
module.exports.getCoordinators = async (req, res) => {
  try{
    let coordinators = await Person.find({role: 'coordinator'}, {name: 1, email: 1, _id: 1, meta: 1});
    respondSuccess(res, 'Coordinators fetched', coordinators);
  } catch(err) {
    respondError(res, 'Unable to fetch coordinators', 500);
  }
}


// Gets list of all users
module.exports.getUsers = async (req, res) => {
  try{
    let users = await Person.find({role: 'user'}, {name: 1, phone: 1, email: 1, role: 1, _id: 1, meta: 1, 'wallet.coins': 1});
    respondSuccess(res, 'Users fetched', users);
  } catch(err) {
    respondError(res, 'Unable to fetch users', 500);
  }
}


// Creates a new coordinator
module.exports.createNewCoordinator = async (req, res) => {
  const { name, email, password } = req.body;

  const existingCoordinator = await Person.findOne({ email });
  if(existingCoordinator) return respondError(res, 'Coordinator already exists', 400);

  const hashedPassword = await bcrypt.hash(password, 12);


  const person = new Person({ name, email, password : hashedPassword, role: 'coordinator' });
  try {
    await person.save();
    person.password = undefined;
    respondSuccess(res, 'User registered', {registered: true});
  } catch (err) {
    respondError(res, 'Failed to register', 400);
  }
}




// Toggle user's ban status
module.exports.toggleBan = async (req, res) => {
  const { id } = req.body;
  if(!id) return respondError(res, 'No user id provided', 400);

  try {
    const person = await Person.findById(id);
    if(!person) return respondError(res, 'User not found', 404);

    person.meta.isBanned = !person.meta.isBanned;
    await person.save();

    let message = person.meta.isBanned ? 'User banned' : 'User unbanned';
    respondSuccess(res, message, true);
  } catch (err) {
    respondError(res, 'Failed to toggle user ban status', 400);
  }
}



// Search exams
module.exports.searchExams = async (req, res) => {
  const search = req.body.search;
  if(!search) return respondError(res, 'No search query provided', 400);
  try{
    let exams = await Exam.find(
      {$text: {$search: search}, 'meta.isPublished': true },
      {contents: 0, solutions: 0, answers: 0}
    ).limit(3);
    
    respondSuccess(res, 'Exams fetched', exams);

  } catch(err) {
    return respondError(res, 'Unable to search', 500);
  }
}


// Get messages for admin
module.exports.getMessages = async (req, res) => {
  try{
    let public = await Public.findOne({}, {messages: 1});
    if(!public) return respondError(res, 'No messages found', 404);

    respondSuccess(res, 'Messages fetched', public.messages);
  
  } catch(err) {
    return respondError(res, 'Unable to fetch messages', 500);
  }
}

// Toggle message resolve status
module.exports.toggleMessageResolve = async (req, res) => {
  const { id } = req.body;
  if(!id) return respondError(res, 'No message id provided', 400);

  try {
    const public = await Public.findOne({}, {messages: 1});
    if(!public) return respondError(res, 'No messages found', 404);

    const message = public.messages.find(message => message._id == id);
    if(!message) return respondError(res, 'Message not found', 404);

    message.isResolved = !message.isResolved;
    await public.save();

    respondSuccess(res, 'Message resolved toggled', true);
  } catch (err) {
    respondError(res, 'Failed to toggle message resolve status', 400);
  }
}

// Delete message
module.exports.deleteMessage = async (req, res) => {
  const { id } = req.body;
  if(!id) return respondError(res, 'No message id provided', 400);

  try {
    const public = await Public.findOne({}, {messages: 1});
    if(!public) return respondError(res, 'No messages found', 404);

    const message = public.messages.find(message => message._id == id);
    if(!message) return respondError(res, 'Message not found', 404);

    public.messages.pull(message);
    await public.save();

    respondSuccess(res, 'Message deleted', true);
  } catch (err) {
    respondError(res, 'Failed to delete message', 400);
  }
}



// Get peyments
module.exports.getPayments = async (req, res) => {
  try{
    let transactions = await Transaction.find({
      $or: [{"meta.kind": "withdraw"}, {"meta.kind": "deposit"}]
    }).populate('user');
    respondSuccess(res, 'Payments fetched', transactions);

  } catch(err) {
    return respondError(res, 'Unable to fetch payments', 500);
  }
}


// Get pending payments
module.exports.getPendingPayments = async (req, res) => {
  try{
    let transactions = await Transaction.find({status: 'pending'}).populate('user');
    respondSuccess(res, 'Payments fetched', transactions);

  } catch(err) {
    return respondError(res, 'Unable to fetch payments', 500);
  }
}

// Reject payment request
module.exports.rejectPayment = async (req, res) => {
  const { id } = req.body;
  if(!id) return respondError(res, 'No payment id provided', 400);

  try {
    const transaction = await Transaction.findById(id);
    if(!transaction) return respondError(res, 'Payment not found', 404);

    const user = await Person.findById(transaction.user);
    if(!user) return respondError(res, 'User not found', 404);

    transaction.status = 'failed';
    transaction.meta.description = 'Request rejected by admin. Contact support for more info.';
    await transaction.save();

    user.wallet.coins += transaction.amount;
    await user.save();

    respondSuccess(res, 'Payment rejected', true);
  } catch (err) {
    respondError(res, 'Failed to reject payment', 400);
  }
}

// Approve payment request
module.exports.approvePayment = async (req, res) => {
  const { tid, pid } = req.body;
  if(!tid || !pid) return respondError(res, 'Data not sufficient', 400);

  try {
    const transaction = await Transaction.findById(pid);
    if(!transaction) return respondError(res, 'Payment not found', 404);

    const user = await Person.findById(transaction.user);
    if(!user) return respondError(res, 'User not found', 404);

    transaction.status = 'success';
    transaction.paymentId = tid;
    transaction.meta.title = 'Withdrawal completed';
    transaction.meta.description = 'UPI Transaction ID: ' + tid;
    await transaction.save();

    respondSuccess(res, 'Payment approved', true);

  } catch (err) {
    respondError(res, 'Failed to approve payment', 400);
  }
}


// Change transaction email and related user
module.exports.changeTransactionEmail = async (req, res) => {
  const { id, email } = req.body;
  if(!id || !email) return respondError(res, 'Data not sufficient', 400);

  try {
    const transaction = await Transaction.findById(id);
    if(!transaction) return respondError(res, 'Payment not found', 404);

    const user = await Person.findOne({email});
    if(!user) return respondError(res, 'User not found', 404);

    transaction.user = user._id;
    transaction.status = 'success';
    await transaction.save();
    user.wallet.coins += transaction.amount;
    user.wallet.transactions.push(transaction._id);
    await user.save();

    respondSuccess(res, 'Payment email changed', true);

  } catch (err) {
    respondError(res, 'Failed to change payment email', 400);
  }
}


// Add transaction for a user
module.exports.addTransaction = async (req, res) => {
  const {uid, amount, type, description} = req.body;

  try{
    const person = await Person.findById(uid);
    if(!person) return respondError(res, 'User not found', 404);

    const transaction = new Transaction({
      user: uid,
      status: 'success',
      amount,
      meta: {
        kind: type,
        description,
        title: 'Transaction added by admin'
      }
    });


    type === 'credit' ? person.wallet.coins += parseInt(amount) : person.wallet.coins -= parseInt(amount);
    person.wallet.transactions.push(transaction._id);
    await person.save();
    await transaction.save();

    respondSuccess(res, 'Transaction added successfully', true);

  } catch(err) {
    respondError(res, err.message, 400);
  }
}

// Deny pending transaction
module.exports.denyTransaction = async (req, res) => {
  const { id } = req.body;
  if(!id) return respondError(res, 'No transaction id provided', 400);

  try {
    const transaction = await Transaction.findById(id);
    if(!transaction) return respondError(res, 'Transaction not found', 404);

    transaction.status = 'failed';
    transaction.meta.title = 'Transaction denied by admin';
    await transaction.save();

    respondSuccess(res, 'Transaction denied', true);
  } catch (err) {
    respondError(res, 'Something went wrong', 503);
  }
}