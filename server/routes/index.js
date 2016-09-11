import express from 'express';

import syncRoutes from './sync';
//import authRoutes from './auth'; /* Not needed */

const router = express.Router();	// eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

router.use('/sync', syncRoutes)

// mount user routes at /users
//router.use('/users', userRoutes);

// mount auth routes at /auth
//router.use('/auth', authRoutes);

export default router;
