import { QueryController } from "../controllers/queryController.js";
import express from 'express';
import { auth } from "../middlewares/auth.js";
import { admin, superAdmin, writer } from "../middlewares/permission.js";

const router = express.Router();

router.post('/', QueryController.createQuery);
router.get('/', auth, admin, QueryController.getQueries);

export default router;