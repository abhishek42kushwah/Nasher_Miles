const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todo.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.post('/', todoController.createTodo);
router.get('/:id', todoController.getTodosByUserId);
router.patch('/:id/status', todoController.updateTodoStatus);
router.delete('/:id', todoController.deleteTodo);

module.exports = router;
