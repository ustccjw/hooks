'use strict'

var koa = require('koa')
var json = require('koa-json')
var compress = require('koa-compress')
var conditional = require('koa-conditional-get')
var logger = require('koa-logger')
var reponseTime = require('koa-response-time')

var app = module.exports = koa()

app.use(reponseTime())
if (app.env !== 'production' && app.env !== 'test') {
    app.use(logger())
}
app.use(conditional())
app.use(compress())
app.use(json())
