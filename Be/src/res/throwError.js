const AppError = require('./AppError')

module.exports = (message, status = 400) => {
  throw new AppError(message, status)
}
