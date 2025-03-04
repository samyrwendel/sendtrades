import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../../lib/types';
import { AuthUser } from '../../lib/auth/types';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-here';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Token not provided' });
      return;
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
        name: string;
        plan: string;
      };

      console.log('🔑 Decoded token:', decoded);

      // Find user in database
      const { data: userData, error: userError } = await supabaseAdmin
        .from('User')
        .select('*')
        .eq('id', decoded.id)
        .single();

      console.log('👤 User found:', userData);
      if (userError) {
        console.log('❌ Error finding user:', userError);
      }

      if (userError) {
        console.error('Error validating user:', userError);
        res.status(401).json({ error: 'Error validating user' });
        return;
      }

      if (!userData || !userData.active) {
        res.status(401).json({ error: 'User not found or inactive' });
        return;
      }

      (req as AuthenticatedRequest).user = userData;
      next();
    } catch (jwtError) {
      console.error('Error verifying token:', jwtError);
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const adminMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (req.user.plan !== 'admin') {
      res.status(403).json({ error: 'Unauthorized access' });
      return;
    }

    next();
  } catch (error) {
    console.error('Error in admin verification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 