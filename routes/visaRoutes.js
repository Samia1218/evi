import express from 'express';
import { FormController, upload } from '../controllers/visaController.js';

const router = express.Router();

router.post('/apply', FormController.fillForm);
router.post('/complete/:id/:stage', FormController.completeStage);
router.get('/status/:id', FormController.getStatus);
// router.post('/upload/:id', upload.single('file'), FormController.uploadFile);
router.post('/uploads/:id', upload, FormController.uploadFiles);
router.get('/file/list/:id', FormController.FileList);
router.get('/pdf/visa/:id', FormController.generatePdf);

export default router;