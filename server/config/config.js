const fs = require('fs')
const path = require('path')
const privateKeyFile = path.resolve(__dirname, 'v2api_privateKey.pem')
const publicKeyFile = path.resolve(__dirname, 'v2api_publicKey.pem')
const privateKey = fs.readFileSync(privateKeyFile, 'utf8')
const publicKey = fs.readFileSync(publicKeyFile, 'utf8')


const only = (files, rules) => {
  return files.filter(file => rules.includes(file))
}

const del = (files, rules) => {
  return files.filter(file => !rules.includes(file))
}

const config = {
  level: {
    M: ['Na', 'Ca', 'He'],
    Y: ['Zn', 'Si', 'Na', 'Ca', 'He'],
    F: ['Cu', 'Cl', 'Zn', 'Si', 'Na', 'Ca', 'He'],
    R: ['me', 'Fe', 'Cu', 'Cl', 'Zn', 'Si', 'Na', 'Ca', 'He']
  },
  rules: {
    del: del,
    only: only
  },
  files: {
    me: 'me.txt',
    Fe: 'Fe.txt',
    Cu: 'Cu.txt',
    Cl: 'Cl.txt',
    Zn: 'Zn.txt',
    Si: 'Si.txt',
    Ca: 'Ca.txt',
    Na: 'Na.txt',
    He: 'He.txt'
  },
  database: {
    host: '164.152.60.242',
    user: 'v2api',
    password: 'ShNHz2x3TbcLPnKw',
    database: 'v2api',
    port: 48036
  },
  privateKey,
  publicKey,
}

module.exports = config