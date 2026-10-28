import { Router } from 'express';
import userRoutes from './user.routes.js';
import postsRoutes from './posts.routes.js';
import authRoutes from './auth.routes.js';

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.use('/users', userRoutes);
router.use('/posts', postsRoutes);
router.use('/auth', authRoutes);
// router.use('/posts', postRoutes);  ← future resources go here

export default router;