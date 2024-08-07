const fs = require('fs')
const path = require('path')
const { base64Encode } = require('./base64.js')


// ---------------------------------以下为处理规则---------------------------------

// ---------------------------------以下为配置---------------------------------

const config = {
  level: {
    M: ['Na', 'Ca', 'He'],
    Y: ['Zn', 'Si', 'Na', 'Ca', 'He'],
    F: ['Cu', 'Cl', 'Zn', 'Si', 'Na', 'Ca', 'He'],
    R: ['me', 'Fe', 'Cu', 'Cl', 'Zn', 'Si', 'Na', 'Ca', 'He']
  },
  rules: {
    better: (files) => { files.splice(6, files.length) },
    only: (files) => { files.splice(1, files.length) }
  },
  file: {
    me: 'me.txt',
    Fe: 'Fe.txt',
    Cu: 'Cu.txt',
    Cl: 'Cl.txt',
    Zn: 'Zn.txt',
    Si: 'Si.txt',
    Ca: 'Ca.txt',
    Na: 'Na.txt',
    He: 'He.txt'
  }
}

const getProxy = (rules, number, level) => {

  // 获取相应的文件内容,初始仓库  
  let content = []
  // 拿到对应等级的文件列表
  const files = config.level[level]
  // 判断是否有对应的规则
  if (config.rules[rules]) {
    config.rules[rules](files)
  }

  // 遍历列表拿到文件内容
  for (let item of files) {
    // 判断是否有对应的文件
    if (config.file[item]) {
      const temp = getFIle(`${config.file[item]}`)
      if (temp === false) {
        return false
      } else {
        content = [...content, ...temp]
      }

    }
  }


  // 用于存储随机节点
  let sub = []
  // 判断 number 参数为 all 或者数字
  if (number === 'all') {
    number = content.length
  } else if (Number(number) != NaN) {
    // 将 number 参数转为数字
    number = Number(number)
    // 如果 number 参数小于等于0，将 number 设置为1
    if (number <= 0) {
      number = 1
    }

    // 如果 number 大于节点数量，将 number 设置为节点数量
    if (number > content.length) {
      number = content.length
    }
  } else {
    number = 1
  }


  // 随机选取节点,组成最后的订阅
  if (number !== content.length) {
    // 只返回指定数量的节点
    for (let i = 0; i < number; i++) {
      sub.push(content.splice(Math.floor(Math.random() * content.length), 1)[0])
    }
  } else {
    sub = content
  }

  // 转为字符串，并对其进行 Base64 编码
  sub = base64Encode(sub.join('\n'))
  // 将编码后的字符串返回
  return sub

}


// ---------------------------------以下为获取文件---------------------------------
const getFIle = (fileName) => {  
  // 使用 path.resolve() 方法创建文件的绝对路径
  const File = path.resolve(__dirname, '..','data', fileName)
  try {
    const fileContent = fs.readFileSync(File, 'utf-8')
    const contentArray = fileContent.split(/\r?\n/).map(line => line.trim())
    return contentArray
  } catch (e) {
    // 如果读取文件时出错，返回一段 HTML 代码表示服务暂停
    return false
  }
}



module.exports = getProxy