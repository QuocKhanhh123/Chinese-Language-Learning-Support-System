const ApiRes = require('../res/ApiRes')

const handleRequest = async (res, serviceMethod, message) => {
  try {
    const data = await serviceMethod()
    return ApiRes.success(res, message, data)
  } catch (err) {
    return ApiRes.error(res, err.message || 'Lỗi hệ thống', err.status || 500)
  }
}

module.exports = handleRequest
