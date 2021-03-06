const path = require('path');
const Koa = require('koa');
const app = new Koa();
const koaStatic = require('koa-static')
// const bodyParser = require('koa-body-parser');
const koaBody = require('koa-body');
const routing = require('./routes');
const error = require('koa-json-error');
const parameter = require('koa-parameter');
const mongoose = require('mongoose');
const { dbs } = require('../config.js')
mongoose.connect(dbs, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, () => console.log('MongoDB数据库连接成功！'));
mongoose.connection.on('error', console.error)

app.use(koaStatic(path.join(__dirname, 'public')))
app.use(error({
  postFormat: (e, { stack, ...rest }) => process.env.NODE_ENV === 'production' ? rest : { stack, ...rest }
}))
app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: path.join(__dirname, '/public/uploads'),
    keepExtensions: true
  }
}));
app.use(parameter(app))
routing(app);

app.listen(3000, () => console.log('请在3000端口打开'));