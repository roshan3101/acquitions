import express from 'express';
import {
  getUsers,
  getUser,
  getMe,
  updateMe,
  updateUserById,
  deleteUserById,
} from '#controllers/user.controller.js';
import { authenticate } from '#middleware/auth.middleware.js';
import { authorize } from '#middleware/authorize.middleware.js';
import { authorizeSelfOrAdmin } from '#middleware/authorize.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/me', getMe);
router.patch('/me', updateMe);

router.get('/', authorize('admin'), getUsers);
router.get('/:id', authorizeSelfOrAdmin('id'), getUser);
router.patch('/:id', authorize('admin'), updateUserById);
router.delete('/:id', authorize('admin'), deleteUserById);

export default router;
