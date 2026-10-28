import { Router } from 'express';
import * as ctrl from '../controllers/user.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createUserSchema, updateUserSchema } from '../validations/user.validation.js';

const router = Router();

router.get('/', ctrl.getUsers);
router.get('/:id', ctrl.getUser);
router.post('/', validate(createUserSchema), ctrl.createUser);
router.patch('/:id', validate(updateUserSchema), ctrl.updateUser);
router.delete('/:id', ctrl.deleteUser);

export default router;