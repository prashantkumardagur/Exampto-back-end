const jwt = require('jsonwebtoken');

const Person = require('../models/person');
const { respondError } = require('../controllers/utils/responders');

const jwtSecret = process.env.JWT_SECRET || 'server_secret';

// ========================================================================================================

// Get current loggedin user
const authCheck = async (req, res, next) => {
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

module.exports = authCheck;