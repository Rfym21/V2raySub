const jwt = require('jsonwebtoken')
const config = require('../config/config.js')
const { findToken, findToken_header } = require('./mysql.js')

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
// console.log(createToken({ id: 1, username: "guest", nickname: "游客", rule: null, rules: null, number: 30, level: "M" }, '3650d'))

const verifyToken = () => {
  return async (ctx, next) => {
    try {
      let token_body = ctx.query.token
      const data = await findToken_header(token_body)
      if (data.length === 0) {
        return false
      }
      token_header = data[0].token_header
      token = data[0].token_header + data[0].token_body

      const verifyRes = await jwt.verify(token, config.privateKey, { algorithm: 'RS512' }, async (err, res) => {
        if (err) {
          return false
        } else {
          const temp = await findToken(res.id, token_header, token_body)

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
            ctx.token_header = token_header
            ctx.token_body = token_body
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
    let token_new = token
    // console.log(token_new)
    const res = await findToken_header(token_new)
    if (res.length === 0) {
      return false
    }
    token_new = res[0].token_header + res[0].token_body
    // console.log(token_new)

    const data = await jwt.verify(token_new, config.privateKey, { algorithm: 'RS512' }, (err, res) => {
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