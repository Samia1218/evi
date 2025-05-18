import express from 'express';
import { FooterController } from '../controllers/footerController.js';

const router = express.Router();

router.get('/', FooterController.getFooter);
router.post('/', FooterController.postFooter);
router.put('/:id', FooterController.updateFooter);
router.delete('/:id', FooterController.deleteFooter);

export default router;