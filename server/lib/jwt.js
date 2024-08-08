const jwt = require('jsonwebtoken')
const config = require('../config/config.js')
const { findToken } = require('./mysql.js')

const createToken = (data, time) => {
  let token = jwt.sign(data, config.privateKey, {
    algorithm: 'RS512',
    expiresIn: time
  })
  token = token.split('.')
  token = {
    token_header: `${token[0]}.${token[1]}.`,
    token_body: token[2]
  }
  return token
}
// console.log(createToken({ id: 1, username: "guest", nickname: "游客", rule: null, rules: null, number: 30, level: "M" }, '3d'))

const verifyToken = () => {
  return async (ctx, next) => {
    const token = ctx.query.token
    try {
      const verifyRes = await jwt.verify(token, config.privateKey, { algorithm: 'RS512' }, async (err, res) => {
        if (err) {
          return false
        } else {
          const temp = await findToken(res.id, token)

          if (temp.length === 0) {
            return false
          } else {
            ctx.id = res.id
            ctx.username = res.username
            ctx.nickname = res.nickname
            ctx.rule = res.rule
            ctx.rules = res.rules
            ctx.number = res.number
            ctx.level = res.level
            ctx.token = token
            await next()
            return true
          }
        }
      })

      if (verifyRes === false) {
        ctx.body = {
          code: 8402,
          message: '错误信息: 用户Token校验失败'
        }
        return
      }

      return
    } catch (e) {
      ctx.body = {
        code: 8401,
        message: '错误信息: 服务器异常！'
      }
    }
  }
}

const UserVerify = async (token) => {
  try {
    const data = await jwt.verify(token, config.privateKey, { algorithm: 'RS512' }, (err, res) => {
      if (err) {
        return false
      } else {
        return res
      }
    })

    return data
  } catch (e) {
    return false
  }

}

module.exports = {
  createToken,
  verifyToken,
  UserVerify
}