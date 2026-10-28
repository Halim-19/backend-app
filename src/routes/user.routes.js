import { Router } from 'express';
import * as ctrl from '../controllers/user.controller.js';
import { authenticate, authorizeSelf } from '../middlewares/auth.middleware.js';
import { updateUserSchema } from '../validations/user.validation.js';
import { validateQuery, validate } from '../middlewares/validate.middleware.js';
import { usersQuerySchema, } from '../validations/query.validation.js';

const router = Router();

router.use(authenticate); // everything below requires login

router.get('/', validateQuery(usersQuerySchema), ctrl.getUsers);
router.get('/:id', ctrl.getUser);
router.patch('/:id', authorizeSelf, validate(updateUserSchema), ctrl.updateUser);
router.delete('/:id', authorizeSelf, ctrl.deleteUser);

export default router;