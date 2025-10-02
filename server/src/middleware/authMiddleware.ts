import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import User from '../models/User';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: User | false) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Authentication error' });
    }
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    req.user = user;
    next();
  })(req, res, next);
};

export const requireApprovedProvider = (req: Request, res: Response, next: NextFunction) => {
  requireAuth(req, res, () => {
    if (!req.user?.is_service_provider || req.user?.provider_status !== 'approved') {
      return res.status(403).json({ 
        success: false, 
        message: 'Approved service provider access required' 
      });
    }
    next();
  });
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  requireAuth(req, res, () => {
    if (!req.user?.is_admin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }
    next();
  });
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: User | false) => {
    if (!err && user) {
      req.user = user;
    }
    next();
  })(req, res, next);
};
