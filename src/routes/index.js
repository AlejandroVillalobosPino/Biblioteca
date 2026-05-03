import clientRoutes from './client.routes.js';
import projectRoutes from './project.routes.js';

router.use('/client', clientRoutes);
router.use('/project', projectRoutes);