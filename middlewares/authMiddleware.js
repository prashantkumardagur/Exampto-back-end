const jwt = require('jsonwebtoken');

const Person = require('../models/person');
const { respondError } = require('../controllers/utils/responders');

const jwtSecret = process.env.JWT_SECRET;

// ========================================================================================================

// Get current loggedin user
module.exports.authCheck = async (req, res, next) => {
  try{
    const token = req.headers.authorization.split(' ')[1];
    if(!token) throw new Error('No token provided');
    const decoded = jwt.verify(token, jwtSecret);
    req.role = decoded.role;
    req.person = await Person.findById(decoded._id, { password: 0 });
    next();
  } catch (err) {
    return respondError(res, 'Authentication failed', 401);
  }
}

// Checks if person is coordinator
module.exports.coordinatorCheck = async (req, res, next) => {
  if(req.role !== 'coordinator') return respondError(res, 'Unauthorized access', 403);
  next();
}

// Checks if person is user
module.exports.userCheck = async (req, res, next) => {
  if(req.role !== 'user') return respondError(res, 'Unauthorized access', 403);
  next();
}

// Checks if person is admin
module.exports.adminCheck = async (req, res, next) => {
  if(req.role !== 'admin') return respondError(res, 'Unauthorized access', 403);
  next();
}