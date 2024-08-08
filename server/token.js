const token = require('@koa/router')()
const { createToken, UserVerify } = require('./lib/jwt.js')
const { insertToken, findUser, findToken } = require('./lib/mysql.js')

token.get('/token', async ctx => {
  let token = ctx.query.token || null

  if (token && token === 'guest') {
    ctx.body = 'pBMWzcRAkfB2L2QIbeucd0N9JpPBQHFIrPATLiasb6aWX051_b5Sw9YeMWgMFoPH9zTg_QXvZOrFJaQElSWfq7XMsym32PmD8DLJAqPHj6dSlxwGMCkNzQEaQmz-Y0FFY6sxlV-fXQKRtJMvugAzCTXBqacQhRCIPZp9HEJnZDWUQ50dW-dV3RfOu7OmnH_g60anovOSNfuDNFvWozvxTAxEbTQvaJwwpk6gtawkDBTiUna9hFqdNn2pw6iG8s_iCIt9S3FyGArkr1840mJJKxEnCqkmpyp9bOYuBHVxm-xWnDgm9o9hfph0327xldzuyiwJ1Dss0MEJxKAoepi_qS1JtAoV48DciTKM96orqeFHFGEc3J1tNPFNHV0YSVNLuto6zRY0q31XTvtWr37pZE2C00dw7gE36ozU3E_QfTy66nTlhA-4ykC1DJHb5ZwnhhFr0EUJCV9VDXJvB1fifpFjf7cj0LCOnarRBzZEw18Au0PE7KiYAq8rImtmnjdeCgQdneABvFPgq2zicskZ3kt54ZCwt_n2UuiVnwmb_1UCHnFo10IC7jr70z0efXq-MGQlozU-epC5VygdYOy15rOTBGbykahLsUBfeQfy6UPRzFOp69FMfyFBp_-C-8W2IGSS_fOoZ5CUPuAu_JLU9cf0NU_BQAMKTcjph3WbxKo'
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
          const data = await insertToken(id, token_new.token_header, token_new.token_body)
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
              token: token_new.token_body
            }

          }
          console.log("用户: => ", username, " | 获取Token: => ", token_new)

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