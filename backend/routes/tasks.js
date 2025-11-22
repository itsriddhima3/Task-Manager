import express from 'express';
import { getTasks, createTask, getTask, updateTask, deleteTask } from '../controllers/taskController.js';
import auth from '../middleware/auth.js';

const router = express.Router();


router.use(auth);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

export default router;