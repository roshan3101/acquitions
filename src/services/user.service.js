import logger from '#config/logger.js';
import bcrypt from 'bcrypt';
import { db } from '#config/database.js';
import { eq, and, like, or, desc, asc } from 'drizzle-orm';
import { users } from '#models/user.model.js';
import { hashPassword } from './auth.service.js';


export const getAllUsers = async ({ page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'desc' }) => {
  try {
    const offset = (page - 1) * limit;
    
    // Validate and map sortBy field
    const sortFieldMap = {
      'id': users.id,
      'name': users.name,
      'email': users.email,
      'role': users.role,
      'created_at': users.created_at,
      'updated_at': users.updated_at,
    };
    
    const sortField = sortFieldMap[sortBy] || users.created_at;
    const orderBy = sortOrder === 'asc' ? asc(sortField) : desc(sortField);

    // Build where condition
    let whereCondition = undefined;
    if (search) {
      whereCondition = or(
        like(users.name, `%${search}%`),
        like(users.email, `%${search}%`)
      );
    }

    // Get total count
    let countQuery = db.select().from(users);
    if (whereCondition) {
      countQuery = countQuery.where(whereCondition);
    }
    const allUsers = await countQuery;
    const total = allUsers.length;

    // Get paginated results
    let dataQuery = db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      created_at: users.created_at,
      updated_at: users.updated_at,
    }).from(users);

    if (whereCondition) {
      dataQuery = dataQuery.where(whereCondition);
    }

    const paginatedUsers = await dataQuery
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return {
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };
  } catch (error) {
    logger.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
};


export const getUserById = async (userId) => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    logger.error('Error fetching user:', error);
    if (error.message === 'User not found') {
      throw error;
    }
    throw new Error('Failed to fetch user');
  }
};

export const getUserByEmail = async (email) => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user || null;
  } catch (error) {
    logger.error('Error fetching user by email:', error);
    throw new Error('Failed to fetch user');
  }
};


export const updateUser = async (userId, updateData) => {
  try {
    const existingUser = await getUserById(userId);

    if (updateData.email && updateData.email !== existingUser.email) {
      const emailUser = await getUserByEmail(updateData.email);
      if (emailUser) {
        throw new Error('Email already exists');
      }
    }

    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    const { id, created_at, ...allowedUpdates } = updateData;
    const updatePayload = {
      ...allowedUpdates,
      updated_at: new Date(),
    };

    const [updatedUser] = await db
      .update(users)
      .set(updatePayload)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      });

    logger.info(`User ${userId} updated successfully`);
    return updatedUser;
  } catch (error) {
    logger.error('Error updating user:', error);
    if (error.message === 'User not found' || error.message === 'Email already exists') {
      throw error;
    }
    throw new Error('Failed to update user');
  }
};

export const deleteUser = async (userId) => {
  try {
    await getUserById(userId);

    await db
      .delete(users)
      .where(eq(users.id, userId));

    logger.info(`User ${userId} deleted successfully`);
    return { message: 'User deleted successfully' };
  } catch (error) {
    logger.error('Error deleting user:', error);
    if (error.message === 'User not found') {
      throw error;
    }
    throw new Error('Failed to delete user');
  }
};

export const getCurrentUser = async (userId) => {
  return getUserById(userId);
};


export const updateCurrentUser = async (userId, updateData) => {
  if (updateData.role) {
    delete updateData.role;
  }
  return updateUser(userId, updateData);
};

