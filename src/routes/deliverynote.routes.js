import { Router } from 'express';
import {
    createDeliveryNote, getDeliveryNotes, getDeliveryNoteById,
    deleteDeliveryNote, signDeliveryNote, downloadPDF
} from '../controllers/deliverynote.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { createDeliveryNoteValidator } from '../validators/deliverynote.validator.js';
import { uploadSignatureMiddleware } from '../middleware/upload.js';

const router = Router();

router.use(protect);

router.post('/', validate(createDeliveryNoteValidator), createDeliveryNote);
router.get('/', getDeliveryNotes);
router.get('/:id', getDeliveryNoteById);
router.delete('/:id', deleteDeliveryNote);

router.patch('/:id/sign', uploadSignatureMiddleware.single('signature'), signDeliveryNote);
router.get('/pdf/:id', downloadPDF);

export default router;