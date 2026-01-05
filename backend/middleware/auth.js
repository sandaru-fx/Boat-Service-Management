import jwt from 'jsonwebtoken';

// Basic authentication middleware
const authMiddleware = (req, res, next) => {
  // get token from headers -- 
  // req.headers.authorization contains bearer token - .split(' ') splits the string into an array of substrings - [0] is bearer and [1] is token- have to take the second element.. ?. prevents errors if auth header is not present
  
  const token = req.headers.authorization?.split(' ')[1];

  if(!token){
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    })
  }

  // verify token
  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // add user info to request object

    next(); // move to next middleware/ controller

  }catch(error){
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    })
  }
}

// Protect routes - requires authentication
export const protect = authMiddleware;

// Restrict routes to specific roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user role is allowed
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

export default authMiddleware;
