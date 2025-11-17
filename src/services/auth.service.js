import logger from '#config/logger.js';
import bcrypt from 'bcrypt';
import { db } from '#config/database.js';
import { eq } from 'drizzle-orm';
import { users } from '#models/user.model.js';

export const hashPassword = async password => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    logger.error('Error hashing the password ', error);
    throw new Error('Error hashing the password');
  }
};

export const verifyPassword = async (password, password_hash) => {
  try {
    return await bcrypt.compare(password, password_hash);
  } catch (error) {
    logger.error('Error verifying the password ', error);
    throw new Error('Error verifying the password');
  }
};

export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0)
      throw new Error('User with this email already exists');

    const password_hash = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({ name, email, password: password_hash, role })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      });

    logger.info(`User created successfully: ${email}`);
    return newUser;
  } catch (error) {
    logger.error('Error creating the user ', error);
    if (error.message === 'User with this email already exists') {
      throw error;
    }
    throw new Error('Error creating the user');
  }
};

export const verifyUser = async (email, password) => {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) throw new Error('Invalid credentials');

    const isPasswordValid = await verifyPassword(password, user[0].password);

    if (!isPasswordValid) throw new Error('Invalid credentials');

    return {
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
      role: user[0].role,
    };
  } catch (error) {
    logger.error('Error verifying the user ', error);
    if (error.message === 'Invalid credentials') {
      throw error;
    }
    throw new Error('Error verifying the user');
  }
};
