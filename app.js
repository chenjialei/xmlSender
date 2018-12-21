const Koa = require('koa');
const app = new Koa();
const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const staticFiles = require("koa-static");

const router = require('./routes/router');
const httpClient = require("./bin/com/bohui/protocol/HttpClient");


// error handler
onerror(app);

// middlewares
app.use(bodyparser({
    enableTypes: ['json', 'form', 'text']
}));
app.use(json());
app.use(logger());
app.use(require('koa-static')(__dirname + '/public'));

/*app.use(views(__dirname + '/views', {
 extension: 'pug'
 }));*/

// logger
app.use(async (ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
});

// routes
app.use(router());

// error-handling
app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
});

//调用初始方法
httpClient.init();


module.exports = app;
