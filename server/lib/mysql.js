// 导入模块
const mysql = require('mysql2/promise')
// 导入配置文件
const config = require('../config/config.js')

// 创建一个数据库连接
const v2apiPool = mysql.createPool(config.database)

// 封装线程池
const v2api = {
  // 接受一条sql语句
  async query(sql) {
    try {
      // 通过连接池连接数据库
      const conn = await v2apiPool.getConnection()
      const [rows] = await conn.query(sql)
      v2apiPool.releaseConnection(conn)
      return Promise.resolve(rows)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}

// 登录
const login = (username, password) => {
  const _sql = `select * from users where username="${username}" and password="${password}"`
  return v2api.query(_sql)
}

// 注册
const register = (values) => {
  const { username, password, nickname } = values
  const _sql = `insert into users (username, password, nickname) values ("${username}", "${password}", "${nickname}")`
  return v2api.query(_sql)
}

// 查找账号
const findUser = (id) => {
  const _sql = `select * from users where id="${id}"`
  return v2api.query(_sql)
}

// 给用户注入一个token
const insertToken = (id, token) => {
  const _sql = `update users set token="${token}" where id="${id}"`
  return v2api.query(_sql)
}

// token唯一性验证
const findToken = (id, token) => {
  const _sql = `select * from users where id="${id}" and token="${token}"`
  return v2api.query(_sql)
}

v2api.login = login
v2api.register = register
v2api.findUser = findUser
v2api.insertToken = insertToken
v2api.findToken = findToken

module.exports = {
  v2api,
  login,
  register,
  findUser,
  insertToken,
  findToken
}