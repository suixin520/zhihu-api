const jwt = require('koa-jwt');
const Router = require('koa-router');
const router = new Router({ prefix: '/questions/:questionId/answers' });
const { getAllAnswer,
  checkAnswerExist,
  getAnswerById,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  checkAnswerer
} = require('../controller/answer');
const { secret } = require('../../config');

const auth = jwt({ secret })


router.get('/', getAllAnswer)

router.get('/:id', auth, checkAnswerExist, getAnswerById)

router.post('/', auth, createAnswer)

router.patch('/:id', auth, checkAnswerExist, checkAnswerer, updateAnswer)

router.delete('/:id', auth, checkAnswerExist, checkAnswerer, deleteAnswer)

module.exports = router;