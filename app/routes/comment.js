const jwt = require('koa-jwt');
const Router = require('koa-router');
const router = new Router({ prefix: '/questions/:questionId/answers/:answerId/comments' });
const { getAllComment,
  checkCommentExist,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  checkCommentator
} = require('../controller/commit');
const { secret } = require('../../config');

const auth = jwt({ secret });

router.get('/', getAllComment);
router.post('/', auth, createComment);
router.get('/:id', checkCommentExist, getCommentById);
router.patch('/:id', auth, checkCommentExist, checkCommentator, updateComment);
router.delete('/:id', auth, checkCommentExist, checkCommentator, deleteComment);

module.exports = router;