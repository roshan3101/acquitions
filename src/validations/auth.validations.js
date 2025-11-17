import { z } from 'zod';

export const signUpSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .max(255, { message: 'Name must be less than 255 characters' })
    .trim(),
  email: z
    .email()
    .max(255, { message: 'Email must be less than 255 characters' })
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(128, { message: 'Password must be less than 255 characters' }),
  role: z.enum(['admin', 'user'], { message: 'Invalid role' }).default('user'),
});

export const signInSchema = z.object({
  email: z
    .email()
    .max(255, { message: 'Email must be less than 255 characters' })
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(128, { message: 'Password must be less than 255 characters' }),
});
