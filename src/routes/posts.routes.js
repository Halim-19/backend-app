import { Router } from 'express';
import * as ctrl from '../controllers/posts.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {updatePostSchema , createPostSchema} from '../validations/posts.validation.js';

const router = Router();

router.get('/', ctrl.getPosts);
router.get('/:id', ctrl.getPost);
router.post('/', validate(createPostSchema), ctrl.createPost);
router.patch('/:id', validate(updatePostSchema), ctrl.updatePost);
router.delete('/:id', ctrl.deletePost);

export default router;