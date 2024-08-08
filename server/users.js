const users = require('@koa/router')()
const { login, register, findUser, insertToken } = require('./lib/mysql.js')
const { verifyToken, createToken, UserVerify } = require('./lib/jwt.js')

users.post('/login', async ctx => {
  const { username, password } = ctx.request.headers

  try {
    let data = await login(username, password)
    // console.log(data)

    if (data.length === 0) {
      ctx.body = {
        code: 8401,
        message: '登录失败,请检查用户名或密码！'
      }
      return
    } else {

      data = data[0]

      // 判断token是否存在,不存在则生成
      data.token = data.token_header + data.token_body
      let token_temp = await UserVerify(data.token)
      console.log(token_temp);

      if (data.token === null || !token_temp || token_temp === false) {
        // 生成token时间
        let time = ''
        switch (data.level) {
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

        const { token_header, token_body } = createToken({ id: data.id, username: data.username, nickname: data.nickname, rule: null, rules: null, number: 30, level: data.level }, time)
        data.token_body = token_body

        const temp = await insertToken(data.id, data.token_header, data.token_body)
        if (temp.affectedRows === 0) {
          ctx.body = ctx.body = {
            code: 8402,
            message: '登录失败,服务器错误！'
          }
        }

      } else {
        ctx.body = {
          code: 8200,
          data: {
            id: data.id,
            nickname: data.nickname,
            username: data.username,
            rule: data.rule,
            rules: data.rules,
            number: data.number,
            level: data.level,
            token: data.token_body
          }
        }
        console.log("用户: => ", data.username, " | 主观登录成功！")
      }
    }
  } catch (e) {
    ctx.body = ctx.body = {
      code: 8404,
      message: '登录失败,服务器错误！'
    }
  }

})


module.exports = users