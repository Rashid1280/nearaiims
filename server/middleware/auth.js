const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// protects any route it's attached to - only lets the request through if a valid, currently-logged-in user made it.
async function requireAuth(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return next( new AppError('Not authenticated',401))
    }

    // throws error if the signature doesn't match or the token expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // still hit the DB even though the token is valid - the token could
    // be valid for a user that was deleted after it was issued
    const user = await User.findById(decoded.id);
    if (!user) {
      return next( new AppError('User no longer exists',401))
    }
    
    // attaches that user to req.user so the actual route doesn't have to look it up again
    // req is the shared object passed to the next function in line 
    req.user = user;
    next();
  } catch (error) {
    if(error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError'){
      return next( new AppError('Invalid or expired session',401))
    }
    return next( new AppError('Something went wrong on our side', 500));
  }
}

module.exports = { requireAuth };