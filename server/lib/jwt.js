const jwt = require('jsonwebtoken')

const key = `Rfym2_${new Date("2019-11-8").getTime()}_v2ray`

const createToken = (data, time) => {
  return jwt.sign(data, key, { expiresIn: time })
}

const verifyToken = () => {
  return (ctx, next) => {
    const token = ctx.query.token
    try {
      jwt.verify(token, key, async (err, res) => {
        if (err) {
          ctx.header['Content-Type'] = 'text/html'
          ctx.body = '<h1 style="margin: 200px auto; width: 300px; text-align: center;font-size:48px;">无效Token</h1>'
        } else {
          ctx.rules = res.rules
          ctx.number = res.number
          ctx.level = res.level
          ctx.token = token
          await next()
        }
      })
    } catch (e) {
      ctx.header['Content-Type'] = 'text/html'
      ctx.body = '<h1 style="margin: 200px auto; width: 300px; text-align: center;font-size:48px;">无效Token</h1>'
    }
  }
}

module.exports = {
  createToken,
  verifyToken
}