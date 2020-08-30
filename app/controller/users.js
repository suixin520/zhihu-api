const JWT = require('jsonwebtoken');
const User = require('../models/user');
const { secret } = require('../../config');

class UserController {
  // 查所有
  async getAllUser(ctx) {
    const user = await User.find();
    ctx.body = user;
  }
  // 查特定
  async getUserById(ctx) {
    const { fields } = ctx.query;
    const fieldsSelect = fields.split(';').filter(p => p).map(p => ' +' + p).join('');
    const user = await User.findById(ctx.params.id).select(fieldsSelect);
    user ? ctx.body = user : ctx.throw(404, '用户不存在');
  }
  // 增加用户
  async createUser(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      password: { type: 'string', required: true }
    })
    const { name } = ctx.request.body;
    const verifyName = await User.findOne({ name });
    if (verifyName) { ctx.throw(409, '该用户已经存在'); }
    const user = await new User(ctx.request.body).save();
    ctx.body = user;
  }
  async checkOwner(ctx, next) {
    if (ctx.params.id !== ctx.state.user._id) {
      ctx.throw(403, '你无权限操作');
    }
    await next();
  }
  // 修改用户
  async updateUser(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: false },
      password: { type: 'string', required: false },
      avatar_url: { type: 'string', required: false },
      gender: { type: 'string', required: false },
      headline: { type: 'string', required: false },
      locations: { type: 'array', itemType: 'string', required: false },
      business: { type: 'string', required: false },
      employments: { type: 'array', itemType:'object', required: false },
      educations: { type: 'array', itemType:'object', required: false },
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
  // 登录
  async login(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      password: { type: 'string', required: true }
    });
    const user = await User.findOne(ctx.request.body);
    if (!user) { ctx.throw(401, '用户名或密码不正确'); }
    const { _id, name } = user;
    const token = JWT.sign({ _id, name }, secret, { expiresIn: '1d' });
    ctx.body = { token }
  }
}

module.exports = new UserController