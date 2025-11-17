import logger from '#config/logger.js';
import { formatValidationError } from '#utils/format.js';
import { signUpSchema, signInSchema } from '#validations/auth.validations.js';
import { createUser, verifyUser } from '#services/auth.service.js';
import { jwttoken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';

export const signup = async(req, res, next) => {
  try {
    if(!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        error: 'Validation failed',
        details: 'Request body is required and must be a valid JSON object',
      });
    }

    const validationResult = signUpSchema.safeParse(req.body);

    if(!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { name, email, password, role } = validationResult.data;

    const user = await createUser({ name, email, password, role });

    const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });

    cookies.set(res, 'token', token);

    logger.info(`User registered successfully: ${email}`);
    return res.status(201).json({ 
      message: 'User registered successfully',
      user: { 
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    logger.error('Failed to sign up user ', error);

    if(error.message === 'User with this email already exists') {
      return res.status(400).json({ error: 'Email already exists' });
    }

    next(error);
  }
};

export const signin = async(req, res, next) => {
    try {
        if(!req.body || typeof req.body !== 'object') {
            return res.status(400).json({
                error: 'Validation failed',
                details: 'Request body is required and must be a valid JSON object',
            });
        }

        const validationResult = signInSchema.safeParse(req.body);

        if(!validationResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: formatValidationError(validationResult.error),
            });
        }

        const { email, password } = validationResult.data;

        const user = await verifyUser(email, password);

        const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });

        cookies.set(res, 'token', token);

        logger.info(`User signed in successfully: ${email}`);
        return res.status(200).json({ 
            message: 'User signed in successfully',
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });

    } catch (error) {
        logger.error('Failed to sign in user ', error);

        if(error.message === 'Invalid credentials') {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        next(error);
    }
}

export const signout = async(req, res, next) => {
    try {
        cookies.clear(res, 'token');

        logger.info('User signed out successfully');
        return res.status(200).json({ message: 'User signed out successfully' });

    } catch (error) {
        logger.error('Failed to sign out user ', error);
        next(error);
    }
};
