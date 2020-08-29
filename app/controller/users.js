const User = require('../models/user');

class UserController {
  // 查所有
  async getAllUser(ctx) {
    const user = await User.find();
    ctx.body = user;
  }
  // 查特定
  async getUserById(ctx) {
    const user = await User.findById(ctx.params.id);
    user ? ctx.body = user : ctx.throw(404, '用户不存在');
  }
  // 增加用户
  async createUser(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true }
    })
    const user = await new User(ctx.request.body).save();
    ctx.body = user;
  }
  // 修改用户
  async updateUser(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true }
    })
    const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body)
    user ? ctx.body = user : ctx.throw(404, '用户不存在');
  }
  // 删除用户
  async deleteUser(ctx) {
    const user = await User.findByIdAndRemove(ctx.params.id);
    user ? ctx.body = user : ctx.throw(404, '用户不存在');
    ctx.status = 204;
  }
}

module.exports = new UserController