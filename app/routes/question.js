const jwt = require('koa-jwt');
const Router = require('koa-router');
const router = new Router({ prefix: '/question' });
const { getAllQuestion,
  checkQuestionExist,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  checkQuestioner
} = require('../controller/question');
const { secret } = require('../../config');

const auth = jwt({ secret })


router.get('/', getAllQuestion)

router.get('/:id', auth, checkQuestionExist, getQuestionById)

router.post('/', auth, createQuestion)

router.patch('/:id', auth, checkQuestionExist, checkQuestioner, updateQuestion)

router.delete('/:id', auth, checkQuestionExist, checkQuestioner, deleteQuestion)

module.exports = router;