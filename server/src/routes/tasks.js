const express = require('express');
const protect = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { listTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');

const router = express.Router();

router.use(protect);

router.get('/', listTasks);
router.post('/', requireRole('admin', 'organiser'), createTask);
router.patch('/:id', updateTask);
router.delete('/:id', requireRole('admin', 'organiser'), deleteTask);

module.exports = router;
