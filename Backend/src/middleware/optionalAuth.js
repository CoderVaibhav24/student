const jwt = require('jsonwebtoken');

module.exports = function optionalAuth(req, _res, next) {
  const name = process.env.COOKIE_NAME || 'access_token';
  const token = req.cookies?.[name];
  if (!token) return next();
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {}
  return next();
};
