import { Router } from 'express';
import * as ctrl from '../controllers/posts.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createPostSchema, updatePostSchema } from '../validations/posts.validation.js';

const router = Router();

router.get('/', ctrl.getPosts);       // public
router.get('/:id', ctrl.getPost);     // public
router.post('/', authenticate, validate(createPostSchema), ctrl.createPost);
router.patch('/:id', authenticate, validate(updatePostSchema), ctrl.updatePost);
router.delete('/:id', authenticate, ctrl.deletePost);

export default router;