import { Router } from 'express';
import * as ctrl from '../controllers/user.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate, authorizeSelf } from '../middlewares/auth.middleware.js';
import { updateUserSchema } from '../validations/user.validation.js';

const router = Router();

router.use(authenticate); // everything below requires login

router.get('/', ctrl.getUsers);
router.get('/:id', ctrl.getUser);
router.patch('/:id', authorizeSelf, validate(updateUserSchema), ctrl.updateUser);
router.delete('/:id', authorizeSelf, ctrl.deleteUser);

export default router;