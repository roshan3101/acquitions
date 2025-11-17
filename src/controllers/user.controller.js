import logger from '#config/logger.js';
import { formatValidationError } from '#utils/format.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getCurrentUser,
  updateCurrentUser,
} from '#services/user.service.js';
import {
  getUserQuerySchema,
  updateUserSchema,
  updateCurrentUserSchema,
} from '#validations/user.validations.js';

export const getUsers = async (req, res, next) => {
  try {
    const queryResult = getUserQuerySchema.safeParse(req.query);

    if (!queryResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(queryResult.error),
      });
    }

    const result = await getAllUsers(queryResult.data);

    logger.info(
      `Users fetched: page ${queryResult.data.page}, total: ${result.pagination.total}`
    );
    return res.status(200).json({
      message: 'Users fetched successfully',
      ...result,
    });
  } catch (error) {
    logger.error('Failed to fetch users:', error);
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.user.id);

    return res.status(200).json({
      message: 'User profile fetched successfully',
      user,
    });
  } catch (error) {
    logger.error('Failed to fetch user profile:', error);
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'User ID must be a valid number',
      });
    }

    const user = await getUserById(userId);

    return res.status(200).json({
      message: 'User fetched successfully',
      user,
    });
  } catch (error) {
    logger.error('Failed to fetch user:', error);
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        error: 'Validation failed',
        details: 'Request body is required and must be a valid JSON object',
      });
    }

    const validationResult = updateCurrentUserSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const updatedUser = await updateCurrentUser(
      req.user.id,
      validationResult.data
    );

    logger.info(`User ${req.user.id} updated their profile`);
    return res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    logger.error('Failed to update profile:', error);
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    if (error.message === 'Email already exists') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    next(error);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'User ID must be a valid number',
      });
    }

    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        error: 'Validation failed',
        details: 'Request body is required and must be a valid JSON object',
      });
    }

    const validationResult = updateUserSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const updatedUser = await updateUser(userId, validationResult.data);

    logger.info(`User ${userId} updated by admin ${req.user.id}`);
    return res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    logger.error('Failed to update user:', error);
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    if (error.message === 'Email already exists') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    next(error);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'User ID must be a valid number',
      });
    }

    if (userId === req.user.id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'You cannot delete your own account',
      });
    }

    await deleteUser(userId);

    logger.info(`User ${userId} deleted by admin ${req.user.id}`);
    return res.status(200).json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    logger.error('Failed to delete user:', error);
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    next(error);
  }
};
