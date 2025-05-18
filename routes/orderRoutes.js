import express from 'express'
import { auth } from '../middlewares/auth.js'
import { OrderController } from "../controllers/orderController.js";
const router = express.Router()

// router.get('/:id',auth, OrderController.createOrder);
router.get('/:id', OrderController.createOrder);
router.post('/validate-order/:id', OrderController.validateOrder);
router.post('/mark-paid/:id',auth, OrderController.markPaid);
router.get('/stripe/:id', OrderController.createStripeOrder)
router.post('/razorpay/:id',OrderController.createRazorpayOrder)
router.post('/verify-payment',OrderController.validateRazorpay)

export default router;