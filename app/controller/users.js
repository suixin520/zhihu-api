const JWT = require('jsonwebtoken');
const User = require('../models/user');
const Question = require('../models/question');
const Answer = require('../models/answer');
const { secret } = require('../../config');

class UserController {
  // 查所有
  async getAllUser(ctx) {
    const { per_page = 10 } = ctx.query;
    const page = Math.max(ctx.query.page * 1, 1) - 1;
    const perPage = Math.max(per_page * 1, 1);
    const user = await User.find({ name: new RegExp(ctx.query.q) }).limit(perPage).skip(page * perPage);
    ctx.body = user;
  }
  // 查特定
  async getUserById(ctx) {
    const { fields = '' } = ctx.query;
    const fieldsSelect = fields.split(';').filter(p => p).map(p => ' +' + p).join('');
    const populateStr = fields.split(';').filter(p => p).map(f => {
      if (f === 'employments') {
        return 'employments.company employments.job';
      }
      if (f === 'educations') {
        return 'educations.school educations.major';
      }
      return f;
    })
    const user = await User.findById(ctx.params.id).select(fieldsSelect).populate(populateStr);
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
      employments: { type: 'array', itemType: 'object', required: false },
      educations: { type: 'array', itemType: 'object', required: false },
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
  // 获取关注者列表
  async listFollowing(ctx) {
    const user = await User.findById(ctx.params.id).select('+following').populate('following');
    if (!user) { ctx.throw(404, '用户不存在'); }
    ctx.body = user.following;
  }
  // 获取关注我（粉丝）列表
  async listFollowers(ctx) {
    const users = await User.find({ following: ctx.params.id });
    ctx.body = users;
  }
  // 验证用户是否存在的中间件
  async checkUserExist(ctx, next) {
    const user = await User.findById(ctx.params.id);
    if (!user) {
      ctx.throw(404, '用户不存在');
    }
    await next();
  }
  // 关注别人的接口
  async follow(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+following');
    if (!me.following.map(id => id.toString()).includes(ctx.params.id)) {
      me.following.push(ctx.params.id);
      me.save();
    }
    ctx.body = 204;
  }
  // 取消关注
  async unfollow(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+following');
    const index = me.following.map(id => id.toString()).indexOf(ctx.params.id);
    if (index > -1) {
      me.following.splice(index, 1);
      me.save();
    }
    ctx.status = 204;
  }
  // 获取关注话题列表
  async listFollowingTopic(ctx) {
    const user = await User.findById(ctx.params.id).select('+followingTopics').populate('followingTopics');
    if (!user) { ctx.throw(404, '用户不存在'); }
    ctx.body = user.followingTopics;
  }
  // 关注话题
  async followTopic(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+followingTopics');
    if (!me.followingTopics.map(id => id.toString()).includes(ctx.params.id)) {
      me.followingTopics.push(ctx.params.id);
      me.save();
    }
    ctx.body = 204;
  }
  // 取消关注话题
  async unfollowTopic(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+followingTopics');
    const index = me.followingTopics.map(id => id.toString()).indexOf(ctx.params.id);
    if (index > -1) {
      me.followingTopics.splice(index, 1);
      me.save();
    }
    ctx.status = 204;
  }
  // 列出当前用户的问题列表
  async listQuestions(ctx) {
    const questions = await Question.find({ questioner: ctx.params.id });
    ctx.body = questions;
  }
  // 列出赞的答案列表
  async listLikingAnswers(ctx) {
    const user = await User.findById(ctx.params.id).select('+likingAnswers').populate('likingAnswers');
    if (!user) { ctx.throw(404, '用户不存在'); }
    ctx.body = user.likingAnswers;
  }
  // 赞一个答案
  async likeAnswer(ctx, next) {
    const me = await User.findById(ctx.state.user._id).select('+likingAnswers');
    if (!me.likingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
      me.likingAnswers.push(ctx.params.id);
      me.save();
      await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: 1 } });
    }
    ctx.status = 204;
    await next();
  }
  // 取消赞
  async unlikeAnswer(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+likingAnswers');
    const index = me.likingAnswers.map(id => id.toString()).indexOf(ctx.params.id);
    if (index > -1) {
      me.likingAnswers.splice(index, 1);
      me.save();
      await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: -1 } });
    }
    ctx.status = 204;
  }
  // 列出踩得答案列表
  async listDislikingAnswers(ctx) {
    const user = await User.findById(ctx.params.id).select('+dislikingAnswers').populate('dislikingAnswers');
    if (!user) { ctx.throw(404, '用户不存在'); }
    ctx.body = user.dislikingAnswers;
  }
  // 踩一个答案
  async dislikeAnswer(ctx, next) {
    const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers');
    if (!me.dislikingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
      me.dislikingAnswers.push(ctx.params.id);
      me.save();
    }
    ctx.status = 204;
    await next();
  }
  // 取消踩一个答案
  async undislikeAnswer(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers');
    const index = me.dislikingAnswers.map(id => id.toString()).indexOf(ctx.params.id);
    if (index > -1) {
      me.dislikingAnswers.splice(index, 1);
      me.save();
    }
    ctx.status = 204;
  }
  // 获取用户收藏答案列表
  async listCollectingAnswers(ctx) {
    const user = await User.findById(ctx.params.id).select('+collectingAnswers').populate('collectingAnswers');
    if (!user) { ctx.throw(404, '用户不存在'); }
    ctx.body = user.collectingAnswers;
  }
  // 收藏答案
  async collectAnswer(ctx, next) {
    const me = await User.findById(ctx.state.user._id).select('+collectingAnswers');
    if (!me.collectingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
      me.collectingAnswers.push(ctx.params.id);
      me.save();
    }
    ctx.status = 204;
    await next();
  }
  // 取消收藏答案
  async uncollectAnswer(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+collectingAnswers');
    const index = me.collectingAnswers.map(id => id.toString()).indexOf(ctx.params.id);
    if (index > -1) {
      me.collectingAnswers.splice(index, 1);
      me.save();
    }
    ctx.status = 204;
  }
}

module.exports = new UserController