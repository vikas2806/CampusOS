const Task = require('../models/Task');
const Event = require('../models/Event');
const asyncWrapper = require('../utils/asyncWrapper');
const AppError = require('../utils/AppError');

// GET /api/tasks?eventId=
const listTasks = asyncWrapper(async (req, res) => {
  const { eventId } = req.query;
  const filter = {};
  if (eventId) filter.event = eventId;

  // volunteers only see their own tasks
  if (req.user.role === 'volunteer') {
    filter.assignedTo = req.user._id;
  }

  const tasks = await Task.find(filter)
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.json({ success: true, tasks });
});

// POST /api/tasks
const createTask = asyncWrapper(async (req, res) => {
  const { eventId, title, description, assignedTo, deadline, priority } = req.body;
  if (!eventId || !title) throw new AppError('eventId and title are required', 400);

  const event = await Event.findById(eventId);
  if (!event) throw new AppError('Event not found', 404);

  const task = await Task.create({
    event: eventId,
    club: event.club,
    title,
    description,
    assignedTo: assignedTo || null,
    createdBy: req.user._id,
    deadline: deadline || null,
    priority: priority || 'medium',
  });

  res.status(201).json({ success: true, task });
});

// PATCH /api/tasks/:id
const updateTask = asyncWrapper(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new AppError('Task not found', 404);

  // volunteers can only update status of their own tasks
  if (req.user.role === 'volunteer') {
    if (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString()) {
      throw new AppError('Not your task', 403);
    }
    if (req.body.status) task.status = req.body.status;
  } else {
    const allowed = ['title', 'description', 'assignedTo', 'status', 'deadline', 'priority'];
    allowed.forEach((f) => { if (req.body[f] !== undefined) task[f] = req.body[f]; });
  }

  await task.save();
  res.json({ success: true, task });
});

// DELETE /api/tasks/:id
const deleteTask = asyncWrapper(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new AppError('Task not found', 404);
  await task.deleteOne();
  res.json({ success: true, message: 'Task deleted' });
});

module.exports = { listTasks, createTask, updateTask, deleteTask };
