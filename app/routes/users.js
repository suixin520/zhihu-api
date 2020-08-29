const Router = require('koa-router');
const router = new Router({ prefix: '/users' });
const { getAllUser, getUserById, createUser, updateUser, deleteUser } = require('../controller/users')

router.get('/', getAllUser)

router.get('/:id', getUserById)

router.post('/', createUser)

router.put('/:id', updateUser)

router.delete('/:id', deleteUser)

module.exports = router;