const jwt = require('jsonwebtoken');
const User = require('../models/User');

// protects any route it's attached to - only lets the request through if a valid, currently-logged-in user made it.
async function requireAuth(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // throws error if the signature doesn't match or the token expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // still hit the DB even though the token is valid - the token could
    // be valid for a user that was deleted after it was issued
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }
    
    // attaches that user to req.user so the actual route doesn't have to look it up again
    // req is the shared object passed to the next function in line 
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }
}

module.exports = { requireAuth };