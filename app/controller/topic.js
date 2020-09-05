const Topic = require('../models/topic');
const User = require('../models/user')

class TopicController {
  // 获取所有话题
  async getAllTopic(ctx) {
    const { per_page = 10 } = ctx.query;
    const page = Math.max(ctx.query.page * 1, 1) - 1;
    const perPage = Math.max(per_page * 1, 1);
    const topic = await Topic.find({ name: new RegExp(ctx.query.q) }).limit(perPage).skip(page * perPage);
    ctx.body = topic;
  }
  // 查找特定话题
  async getTopicById(ctx) {
    const { fields = '' } = ctx.query;
    const fieldsSelect = fields.split(';').filter(p => p).map(p => ' +' + p).join('');
    const topic = await Topic.findById(ctx.params.id).select(fieldsSelect);
    topic ? ctx.body = topic : ctx.throw(404, '用户不存在');
  }
  // 新增话题
  async createTopic(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      avatar_url: { type: 'string', required: false },
      introduction: { type: 'string', required: false },
    })
    const { name } = ctx.request.body;
    const verifyName = await Topic.findOne({ name });
    if (verifyName) { ctx.throw(409, '该话题已存在'); }
    const topic = await new Topic(ctx.request.body).save();
    ctx.body = topic;
  }
  async updateTopic(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: false },
      avatar_url: { type: 'string', required: false },
      introduction: { type: 'string', required: false },
    })
    const topic = await Topic.findByIdAndUpdate(ctx.params.id, ctx.request.body);
    topic ? ctx.body = topic : ctx.throw(404, '用户不存在');
  }
  // 验证话题是否存在
  async checkTopicExist(ctx, next) {
    const topic = await Topic.findById(ctx.params.id);
    if (!topic) {
      ctx.throw(404, '话题不存在');
    }
    await next();
  }
  // 获取关注某话题的列表
  async listTopicFollowers(ctx) {
    const users = await User.find({ followingTopics: ctx.params.id });
    ctx.body = users;
  }
}

module.exports = new TopicController