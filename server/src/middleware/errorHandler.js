// Central error handler — expanded in step 7
function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ success: false, message });
}

module.exports = errorHandler;
