// ---------------------------------以下为服务配置---------------------------------
const koa = require('koa')
const app = new koa()
const cors = require('@koa/cors')
const router = require('@koa/router')()
const create = require('./create.js')
const { verifyToken } = require('./lib/jwt.js')
const getProxy = require('./lib/proxy.js')


// ---------------------------------以下为服务启动---------------------------------
app.use(cors())
app.use(router.routes())
app.use(router.allowedMethods())
app.use(create.routes())
app.use(create.allowedMethods())
app.listen(8103, () => {
  console.log('服务在端口8103上启动成功!')
})

const baseURI = "https://sub.rfym.live"

// ---------------------------------以下为路由配置---------------------------------

router.get('/', verifyToken(), async ctx => {
  const proxy = await getProxy(ctx.rules, ctx.number, ctx.level)
  if (proxy === false) {
    ctx.header['Content-Type'] = 'text/html'
    ctx.body = '<h1 style="margin: 200px auto; width: 300px; text-align: center;font-size:48px;">请求参数错误</h1>'
  } else {
    ctx.body = proxy
  }
})
