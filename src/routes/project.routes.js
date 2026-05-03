import { Router } from 'express';
import {
    createProject, getProjects, getProjectById,
    updateProject, deleteProject, getArchivedProjects, restoreProject
} from '../controllers/project.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { createProjectValidator, updateProjectValidator } from '../validators/project.validator.js';

const router = Router();

router.use(protect);

router.get('/archived', getArchivedProjects);
router.patch('/:id/restore', restoreProject);

router.post('/', validate(createProjectValidator), createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.put('/:id', validate(updateProjectValidator), updateProject);
router.delete('/:id', deleteProject);

export default router;