// server/lib/asyncHandler.js
// Wrap async route handlers for Express to forward errors to next().
module.exports = function asyncHandler(fn) {
  return function asyncUtilWrap(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
