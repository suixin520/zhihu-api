const jwt = require('koa-jwt');
// const JWT = require('jsonwebtoken');
const Router = require('koa-router');
const router = new Router({ prefix: '/users' });
const { getAllUser, getUserById, createUser, updateUser, deleteUser, login, checkOwner } = require('../controller/users');
const { secret } = require('../../config');

const auth = jwt({ secret })
// const auth = async (ctx, next) => {
//   const {authorization=''} = ctx.request.header;
//   const token = authorization.replace('Bearer ', '');
//   try {
//     const user = JWT.verify(token, secret);
//     ctx.state.user = user;
//   } catch(e) {
//     ctx.throw(401, e.message)
//   }
//   await next();
// }

router.get('/', getAllUser)

router.get('/:id', getUserById)

router.post('/', createUser)

router.patch('/:id', auth, checkOwner, updateUser)

router.delete('/:id', auth, checkOwner, deleteUser)

router.post('/login', login)

module.exports = router;