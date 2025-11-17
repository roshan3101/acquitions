import { z } from 'zod';


export const createUserSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }).max(255, { message: 'Name must be less than 255 characters' }).trim(),
  email: z.string().email({ message: 'Invalid email format' }).max(255, { message: 'Email must be less than 255 characters' }).toLowerCase().trim(),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }).max(128, { message: 'Password must be less than 128 characters' }),
  role: z.enum(['admin', 'user'], { message: 'Invalid role' }).default('user'),
});


export const updateUserSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }).max(255, { message: 'Name must be less than 255 characters' }).trim().optional(),
  email: z.string().email({ message: 'Invalid email format' }).max(255, { message: 'Email must be less than 255 characters' }).toLowerCase().trim().optional(),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }).max(128, { message: 'Password must be less than 128 characters' }).optional(),
  role: z.enum(['admin', 'user'], { message: 'Invalid role' }).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});


export const updateCurrentUserSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }).max(255, { message: 'Name must be less than 255 characters' }).trim().optional(),
  email: z.string().email({ message: 'Invalid email format' }).max(255, { message: 'Email must be less than 255 characters' }).toLowerCase().trim().optional(),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }).max(128, { message: 'Password must be less than 128 characters' }).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});


export const getUserQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive().max(100)).default('10'),
  search: z.string().optional().default(''),
  sortBy: z.enum(['id', 'name', 'email', 'role', 'created_at', 'updated_at']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

