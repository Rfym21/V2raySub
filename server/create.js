const create = require('@koa/router')()
const { createToken } = require('./lib/jwt.js')

create.get('/guest', async ctx => {
  // 生成 Token
  const token = createToken({ rules: null, number: 30, level: "M" }, '3d')
  console.log(token)
  // 返回 Token
  ctx.body = token
})

console.log(createToken({ rules: "better", number: "all", level: "R" }, '365d'))

module.exports = create