let db = [
  {
    name: '宋博'
  }
];

class User {
  getAllUser(ctx) {
    ctx.body = db;
  }
  createUser(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      age: { type: 'number', required: false }
    })
    db.push(ctx.request.body);
    ctx.body = ctx.request.body;
  }
  updateUser(ctx) {
    if (ctx.params.id * 1 >= db.length) {
      ctx.throw(412, '修改的数据不在数据库范围内');
    }
    ctx.verifyParams({
      name: { type: 'string', required: true },
      age: { type: 'number', required: false }
    })
    db[ctx.params.id * 1] = ctx.request.body;
    ctx.body = ctx.request.body;
  }
  deleteUser(ctx) {
    db.splice(ctx.params.id * 1, 1);
    ctx.status = 204;
  }
}

module.exports = new User