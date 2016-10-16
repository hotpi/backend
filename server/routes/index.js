import express from 'express';
import syncRoutes from './sync';

const router = express.Router();	// eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

router.use('/sync', syncRoutes)


export default router;
