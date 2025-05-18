import express from 'express'
import { AdminController, upload } from '../controllers/adminController.js'
import { auth } from '../middlewares/auth.js'
import { admin } from '../middlewares/permission.js';

const router = express.Router()

router.post('/', AdminController.createAdmin);
router.post('/login', AdminController.loginAdmin);
router.post('/upload/:id',auth,admin, upload, AdminController.uploadApprovedVisa);
router.get('/forms', auth, AdminController.getForms);
router.get('/forms/csv', auth,admin, AdminController.getFormsCsv);
router.get('/forms/:id', auth,admin, AdminController.getFormById);
router.put('/forms/:id', auth,admin, AdminController.updateFormById);

export default router;