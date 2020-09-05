const jwt = require('koa-jwt');
// const JWT = require('jsonwebtoken');
const Router = require('koa-router');
const router = new Router({ prefix: '/topic' });
const { getAllTopic,
  getTopicById,
  createTopic,
  updateTopic,
  checkTopicExist,
  listTopicFollowers,
  listQuestion
} = require('../controller/topic');
const { secret } = require('../../config');
const { listQuestions } = require('../controller/users');

const auth = jwt({ secret })


router.get('/', getAllTopic)

router.get('/:id', auth, checkTopicExist, getTopicById)

router.post('/', createTopic)

router.patch('/:id', auth, checkTopicExist, updateTopic)

router.get('/:id/topicFollowers', checkTopicExist, listTopicFollowers)

router.get('/:id/questions', checkTopicExist, listQuestion)

module.exports = router;