const { Types } = require('mongoose')
const _ = require('lodash')
const moment = require('moment')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const winston = require('winston')
//moment().format() // 2024-05-20T00:00:00+07:00(moment) === 2024-05-20T17:00:00.000+00:00(mongodb)

const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields)
}

const removeUnderfinedObjectKey = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] == null) delete obj[key]
  })

  return obj
}

const updateNestedObjectParser = (obj) => {
  const final = {}
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'Object' && !Array.isArray(obj[key])) {
      const res = updateNestedObjectParser(obj[key])
      Object.keys(res).forEach((a) => {
        final[`${key}.${a}`] = res[a]
      })
    } else {
      final[key] = obj[key]
    }
  })
  //console.log(final)
  return final
}

const convert2ObjectId = (id) => {
  if (!Types.ObjectId.isValid(id)) {
    console.log('🚨 Invalid ObjectId:', id)
    return id
  }
  return new Types.ObjectId(id)
}

const replacePlaceholder = (template, params) => {
  Object.keys(params).forEach((key) => {
    const placeholder = `{{${key}}}`
    template = template.replace(new RegExp(placeholder, 'g'), params[key])
  })

  return template
}

//filterField update specific field
const filterFieldToUpdate = (update, field_name, name) => {
  const result = {}

  if (update.quiz) {
    result[`${field_name}.$[${name}].quiz`] = update.quiz
  }

  for (const key in update) {
    if (!Array.isArray(update[key])) {
      result[`${field_name}.$[${name}].${key}`] = update[key]
    }
  }
  return result
}

const filterFieldToUpdateNestedObject = (update, field_name, name, nested_field, nested_name) => {
  const result = {}

  for (const key in update) {
    if (key == 'quiz') {
      result[`${field_name}.$[${name}].${nested_field}.$[${nested_name}].${key}`] = update[key]
    } else {
      if (!Array.isArray(update[key])) {
        result[`${field_name}.$[${name}].${nested_field}.$[${nested_name}].${key}`] = update[key]
      }
    }
  }
  return result
}

/**
 *
 * @param {*} reviewDate //ngay review gan nhat
 * @param {*} interval  //so ngay tinh tu ngay review gan nhat
 * @param {*} level //cap do danh gia
 * level 0->5 tuong ung voi 5 cap do
 * level 0: (da thuoc, random)
 * level 1: (1 ngay)
 * level 2: (3 ngay)
 * level 3: (7 ngay)
 * level 4: (14 ngay)
 * level 5: (30 ngay)
 */
const nextReviewDate = (level) => {
  const levelObj = {
    0: 0,
    1: 1,
    2: 3,
    3: 7,
    4: 14,
    5: 30
  }

  let newInterval = levelObj[level] || 1
  const nextReviewDate = moment().startOf('day').add(newInterval, 'days')

  return { date: nextReviewDate.toDate(), interval: newInterval }
}

const generateToken = (user) => {
  if (!user || !user._id) {
    throw new Error('Invalid user data for token generation')
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      roles: user.roles
    },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '7d' }
  )
}

const generateRandomPassword = (length = 10) => {
  return crypto.randomBytes(length).toString('hex').slice(0, length)
}

const customLevels = {
  levels: {
    executive: 0, // Cấp cao nhất (ưu tiên cao nhất)
    error: 1,
    warn: 2,
    info: 3,
    debug: 4
  },
  colors: {
    executive: 'magenta', // Màu cho log executive
    error: 'red',
    warn: 'yellow',
    info: 'blue',
    debug: 'green'
  }
}

const logger = winston.createLogger({
  levels: customLevels.levels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/executive.log' })
  ]
})

module.exports = {
  nextReviewDate,
  getInfoData,
  removeUnderfinedObjectKey,
  updateNestedObjectParser,
  convert2ObjectId,
  replacePlaceholder,
  filterFieldToUpdate,
  filterFieldToUpdateNestedObject,
  generateToken,
  generateRandomPassword,
  logger
}
