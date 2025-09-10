const { forbidden } = require('../utils/responses');
// levels: 1 admin, 2 teacher, 3 student
module.exports = function requireLevel(maxLevelAllowed) {
  return function (req, res, next) {
    if (!req.user || typeof req.user.level !== 'number') {
      return forbidden(res, 'No role');
    }
    if (req.user.level > maxLevelAllowed) {
      return forbidden(res, 'Insufficient permissions');
    }
    next();
  };
};
