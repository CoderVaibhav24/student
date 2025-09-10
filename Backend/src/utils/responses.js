function ok(res, data = {}, message = 'OK') {
  return res.status(200).json({ success: true, message, data });
}
function created(res, data = {}, message = 'Created') {
  return res.status(201).json({ success: true, message, data });
}
function badRequest(res, message = 'Bad Request') {
  return res.status(400).json({ success: false, message });
}
function unauthorized(res, message = 'Unauthorized') {
  return res.status(401).json({ success: false, message });
}
function forbidden(res, message = 'Forbidden') {
  return res.status(403).json({ success: false, message });
}
function conflict(res, message = 'Conflict') {
  return res.status(409).json({ success: false, message });
}
function serverError(res, err) {
  console.error(err);
  return res.status(500).json({ success: false, message: 'Server Error' });
}

module.exports = { ok, created, badRequest, unauthorized, forbidden, conflict, serverError };
