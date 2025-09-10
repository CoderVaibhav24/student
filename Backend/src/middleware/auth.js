const jwt = require('jsonwebtoken');
const { unauthorized } = require('../utils/responses');

module.exports = function auth(req, res, next) {
  const name = process.env.COOKIE_NAME || 'access_token';
  const token = req.cookies?.[name];
  if (!token) return unauthorized(res, 'Missing token');

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (e) {
    return unauthorized(res, 'Invalid or expired token');
  }
};
