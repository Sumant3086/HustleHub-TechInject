import { Router } from 'express';
import { TaskController } from './task.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const controller = new TaskController();

router.use(authMiddleware);

router.get('/', controller.findAll);
router.post('/', controller.create);
router.get('/:id', controller.findById);
router.patch('/:id', controller.update);
router.patch('/:id/move', controller.move);
router.delete('/:id', controller.delete);

export { router as taskRouter };
