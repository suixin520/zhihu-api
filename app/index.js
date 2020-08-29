const Koa = require('koa');
const app = new Koa();
const bodyParser = require('koa-body-parser');
const routing = require('./routes');
const error = require('koa-json-error');
const parameter = require('koa-parameter');
//mongodb+srv://suixin:<password>@zhihu.q9lcl.mongodb.net/<dbname>?retryWrites=true&w=majority
// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://suixin:<password>@zhihu.q9lcl.mongodb.net/<dbname>?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });
app.use(error({
  postFormat: (e, { stack, ...rest }) => process.env.NODE_ENV === 'production' ? rest : { stack, ...rest }
}))
app.use(bodyParser());
app.use(parameter(app))
routing(app);

app.listen(3000, () => console.log('请在3000端口打开'));