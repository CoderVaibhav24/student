const pool = require('../db');
const { forbidden, badRequest, serverError } = require('../utils/responses');

module.exports = function ownsStudent(param = 'studentId') {
  return async function (req, res, next) {
    const sid = Number(req.params[param] || req.body[param] || req.query[param]);
    if (!sid) return badRequest(res, 'studentId required');

    try {
      if (req.user.level === 1) return next();

      if (req.user.level === 3) {
        const [rows] = await pool.query('SELECT user_id FROM students WHERE id=?', [sid]);
        if (!rows.length) return forbidden(res, 'Student not found');
        if (rows[0].user_id !== req.user.id) return forbidden(res, 'Not your record');
        return next();
      }

      if (req.user.level === 2) {
        const [rows] = await pool.query(
          'SELECT 1 FROM teacher_student_map WHERE teacher_user_id=? AND student_id=? LIMIT 1',
          [req.user.id, sid]
        );
        if (!rows.length) return forbidden(res, 'Student not assigned to you');
        return next();
      }

      return forbidden(res, 'Insufficient permissions');
    } catch (err) {
      return serverError(res, err);
    }
  };
};
