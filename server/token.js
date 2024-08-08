const token = require('@koa/router')()
const { createToken, UserVerify } = require('./lib/jwt.js')
const { insertToken, findUser } = require('./lib/mysql.js')
const config = require('./config/config.js')

token.get('/token', async ctx => {
  const token = ctx.query.token || null
  console.log(token)


  if (token && token === 'guest') {
    // 生成 Token
    const tokenGuest = createToken({ id: 1, username: "guest", nickname: "游客", rule: null, rules: null, number: 30, level: "M" }, '3d')
    console.log("用户: => ", token, " | 获取Token: => ", tokenGuest)
    // 返回 Token
    ctx.body = tokenGuest
  } else if (token) {
    // 验证用户 Token
    const UserInfo = await UserVerify(token)
    if (UserInfo === false) {
      ctx.body = {
        code: 8400,
        message: '错误信息: 用户Token解析失败'
      }
    } else {
      const { id, username, nickname, rule, rules, number, level } = UserInfo

      const userToken = findToken(id, token)
      if (userToken.length === 0) {
        ctx.body = {
          code: 8401,
          message: '错误信息: 用户Token不存在'
        }
        return
      }

      const rule_new = ctx.query.rule || rule
      const rules_new = ctx.query.rules || rules
      const number_new = ctx.query.number || number

      let time = ''
      switch (level) {
        case "R":
          time = '365d'
          break
        case "F":
          time = '120d'
          break
        case "Y":
          time = '30d'
          break
        case "M":
          time = '3d'
          break
        default:
          time = '3d'
      }
      try {
        const info = await findUser(id)

        if (info.length === 0) {
          ctx.body = {
            code: 8401,
            message: '错误信息: 用户不存在'
          }
        } else {
          level_new = info[0].level || level
          const token_new = await createToken({ id, username, nickname, rule: rule_new, rules: rules_new, number: number_new, level: level_new }, time)
          const data = await insertToken(id, token_new)
          if (data.affectedRows === 0) {
            ctx.body = ctx.body = {
              code: 8402,
              message: '创建失败,服务器错误！'
            }
            return
          }

          ctx.body = {
            code: 8200,
            data: {
              id,
              nickname,
              username,
              rule: rule_new,
              rules: rules_new,
              number: number_new,
              level: level_new,
              token: token_new
            }

          }
          console.log("用户: => ", token, " | 获取Token: => ", token_new)

        }

      } catch (e) {
        ctx.body = {
          code: 8402,
          message: '错误信息: 服务器异常！'
        }
      }

    }
  }
})

module.exports = token