const Question = require('../models/question')

class QuestionController {

  // 获取所有问题
  async getAllQuestion(ctx) {
    const { per_page = 10 } = ctx.query;
    const page = Math.max(ctx.query.page * 1, 1) - 1;
    const perPage = Math.max(per_page * 1, 1);
    const reg = new RegExp(ctx.query.q);
    const question = await Question.find({ $or: [{ title: reg }, { description: reg }] }).limit(perPage).skip(page * perPage);
    ctx.body = question;
  }

  // 验证问题是否存在
  async checkQuestionExist(ctx, next) {
    const question = await Question.findById(ctx.params.id).select('+questioner');
    if (!question) {
      ctx.throw(404, '问题不存在');
    }
    ctx.state.question = question;
    await next();
  }

  // 获取特定问题
  async getQuestionById(ctx) {
    const { fields = '' } = ctx.query;
    const fieldsSelect = fields.split(';').filter(p => p).map(p => ' +' + p).join('');
    const question = await Question.findById(ctx.params.id).select(fieldsSelect).populate('questioner topics');
    ctx.body = question;
  }

  // 新增问题
  async createQuestion(ctx) {
    ctx.verifyParams({
      title: { type: 'string', required: true },
      description: { type: 'string', required: false }
    })
    console.log({...ctx.request.body, questioner: ctx.state.user._id});
    const question = await new Question({...ctx.request.body, questioner: ctx.state.user._id}).save();
    ctx.body = question;
  }
  // 更新问题
  async updateQuestion(ctx) {
    ctx.verifyParams({
      title: { type: 'string', required: false },
      description: { type: 'string', required: false }
    })
    await ctx.state.question.update(ctx.request.body);
    ctx.body = ctx.state.question;
  }
  // 删除问题
  async deleteQuestion(ctx) {
    await Question.findByIdAndRemove(ctx.params.id);
    ctx.body = 204;
  }
  // 验证当前问题是否是当前的用户
  async checkQuestioner(ctx, next) {
    const {question} = ctx.state;
    if (question.questioner.toString() !== ctx.state.user._id) {
      ctx.throw(403, '你无权限操作');
    }
    await next();
  }
}

module.exports = new QuestionController