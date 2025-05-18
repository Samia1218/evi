import { checkPrice } from "../helper/calculatePrice.js";
import { FormData } from "../models/FormData.js";
import paypal from "paypal-rest-sdk"
import { Order } from "../models/Order.js";
import Stripe from 'stripe';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'crypto'

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_TEST_KEY,
  key_secret: process.env.RAZORPAY_LIVE_KEY,
});

paypal.configure({
  'mode': process.env.PAYPAL_MODE,
  'client_id': process.env.PAYPAL_KEY,
  'client_secret': process.env.PAYPAL_SECRET_KEY
});


export class OrderController {
  static createOrder = async (req, res) => {
    const { id } = req.params;
    try {
      let application = await FormData.findOne({ application_id: id })
      if (!application) return res.status(400).json({ message: "application not exist" })
      if (application.paid) return res.status(400).json({ message: "application is already paid" })
      // if(application.currentTab!=5) return res.status(400).json({message:"please complete application"})
      let price = checkPrice(application.tabOne.visa_service, application?.tabOne?.visa_service_for_eTourist)
      const create_payment_json = {
        "intent": "sale",
        "payer": {
          "payment_method": "paypal"
        },
        "redirect_urls": {
          "return_url": "https://indianevisa.info/success",
          "cancel_url": "https://indianevisa.info/cancel"
        },
        "transactions": [{
          "item_list": {
            "items": [{
              "name": application.tabOne.visa_service,
              "price": price,
              "currency": "USD",
              "quantity": 1
            }]
          },
          "amount": {
            "currency": "USD",
            "total": price
          },
          "description": "eVisa"
        }]
      };
      paypal.payment.create(create_payment_json, async function (error, payment) {
        if (error) {
          console.log("error", error)
          return res.status(500).json({ error })
        } else {
          let index = payment.links.findIndex(el => el.rel == "approval_url")
          let url = payment.links[index].href
          let order = {
            transactionAmount: price,
            transactionType: "online",
            transactionStatus: false,
            gatewayName: "paypal",
            transactionBy: id,
            transactionDate: new Date(),
            approverUrl: url
          }
          let newOrder = new Order(order)
          let result = await newOrder.save()
          let application = await FormData.findOneAndUpdate({ application_id: id }, { orderId: result._id })
          return res.status(200).json(result)
        }
      });
    } catch (error) {
      res.status(500).json({ error })
    }
  }
  static validateOrder = async (req, res) => {
    let { id } = req.params;
    let body = req.body;

    try {
      let application = await FormData.findOne({ application_id: id });

      if (!application) return res.status(400).json({ message: "Application not exist" });
      if (application.paid) return res.status(400).json({ message: "Application is already paid" });
      if (application.currentTab != 5) return res.status(400).json({ message: "Please complete the application" });

      if (body.payment_method === "stripe") {
        // Handle Stripe payment validation
        if (!body.paymentIntent) return res.status(400).json({ message: "payment_intent is required" });

        let order = await Order.findById(application.orderId);
        if (!order) return res.status(400).json({ message: "Order not exist" });

        if (body.paymentIntent.status === 'succeeded') {
          // Payment succeeded
          let result = await Order.findByIdAndUpdate(order._id, { approvedObject: body.paymentIntent, transactionStatus: true });
          let FormResult = await FormData.findOneAndUpdate({ application_id: id }, { paid: true, status: "pending" });
          return res.status(200).json({ message: "Payment validated!" });
        } else {
          let result = await Order.findByIdAndUpdate(order._id, { rejectionObject: body.paymentIntent });
          return res.status(400).json({ message: "Payment not validated" });
        }
      } else {
        // Handle PayPal payment validation
        if (!body.payer_id) return res.status(400).json({ message: "payer_id is required" });
        if (!body.payment_id) return res.status(400).json({ message: "payment_id is required" });

        let order = await Order.findById(application.orderId);
        if (!order) return res.status(400).json({ message: "Order not exist" });

        const execute_payment_json = {
          payer_id: body.payer_id,
          transactions: [{
            amount: {
              currency: "USD",
              total: order.transactionAmount
            }
          }]
        };

        paypal.payment.execute(body.payment_id, execute_payment_json, async function (error, payment) {
          if (error) {
            let result = await Order.findByIdAndUpdate(order._id, { rejectionObject: error.response });
            return res.status(400).json({ message: "Payment not validated" });
          } else {
            let result = await Order.findByIdAndUpdate(order._id, { approvedObject: payment, transactionStatus: true });
            let FormResult = await FormData.findOneAndUpdate({ application_id: id }, { paid: true, status: "pending" });
            return res.status(200).json({ message: "Payment validated!" });
          }
        });
      }

    } catch (error) {
      console.log(error)
      res.status(500).json({ error });
    }
  }
  static markPaid = async (req, res) => {
    const { id } = req.params
    const { transactionId } = req.body
    try {
      let application = await FormData.findOne({ application_id: id })
      if (!application) return res.status(400).json({ message: "application not exist" })
      if (application.paid) return res.status(400).json({ message: "application is already paid" })
      if (application.currentTab != 5) return res.status(400).json({ message: "please complete application" })
      let price = checkPrice(application.tabOne.visa_service, application?.tabOne?.visa_service_for_eTourist)
      let body = {
        transactionAmount: price,
        transactionType: "manual",
        transactionStatus: true,
        transactionId: transactionId,
        transactionBy: id
      }
      let newOrder = new Order(body)
      await newOrder.save()
      let FormResult = await FormData.findOneAndUpdate({ application_id: id }, { paid: true, status: "pending" })
      return res.status(200).json({ message: "Payment validated!" })
    } catch (error) {
      res.status(500).json({ error })
    }
  }
  static createStripeOrder = async (req, res) => {
    const { id } = req.params;
    try {
      // Retrieve application data
      let application = await FormData.findOne({ application_id: id });
      if (!application) return res.status(400).json({ message: "Application not exist" });
      if (application.paid) return res.status(400).json({ message: "Application is already paid" });

      // Calculate the price as needed
      let price = checkPrice(application.tabOne.visa_service, application?.tabOne?.visa_service_for_eTourist);

      // Create a PaymentIntent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: price, // Amount should be in cents
        currency: 'usd',
        description: "eVisa",
        shipping: {
          name: 'Jenny Rosen',
          address: {
            line1: '510 Townsend St',
            postal_code: '98140',
            city: 'San Francisco',
            state: 'CA',
            country: 'US',
          },
        },
      });

      // Create a new order
      const order = {
        transactionAmount: price,
        transactionType: 'online',
        transactionStatus: false,
        gatewayName: 'stripe',
        transactionBy: id,
        transactionDate: new Date(),
        stripePaymentIntentId: paymentIntent.id,
      };

      const newOrder = new Order(order);
      const result = await newOrder.save();
      const updatedApplication = await FormData.findOneAndUpdate({ application_id: id }, { orderId: result._id });

      // Return the PaymentIntent client secret to the client-side
      return res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error });
    }
  }
  static markPaid = async (req, res) => {
    const { id } = req.params
    const { transactionId } = req.body
    try {
      let application = await FormData.findOne({ application_id: id })
      if (!application) return res.status(400).json({ message: "application not exist" })
      if (application.paid) return res.status(400).json({ message: "application is already paid" })
      if (application.currentTab != 5) return res.status(400).json({ message: "please complete application" })
      let price = checkPrice(application.tabOne.visa_service, application?.tabOne?.visa_service_for_eTourist)
      let body = {
        transactionAmount: price * 100,
        transactionType: "manual",
        transactionStatus: true,
        transactionId: transactionId,
        transactionBy: id
      }
      let newOrder = new Order(body)
      await newOrder.save()
      let FormResult = await FormData.findOneAndUpdate({ application_id: id }, { paid: true, status: "pending" })
      return res.status(200).json({ message: "Payment validated!" })
    } catch (error) {
      res.status(500).json({ error })
    }
  }
  static createStripeOrder = async (req, res) => {
    const { id } = req.params;
    try {
      // Retrieve application data
      let application = await FormData.findOne({ application_id: id });
      if (!application) return res.status(400).json({ message: "Application not exist" });
      if (application.paid) return res.status(400).json({ message: "Application is already paid" });

      // Calculate the price as needed
      let price = checkPrice(application.tabOne.visa_service, application?.tabOne?.visa_service_for_eTourist);

      // Create a PaymentIntent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: price * 100, // Amount should be in cents
        currency: 'usd',
        description: "eVisa",
        shipping: {
          name: 'Jenny Rosen',
          address: {
            line1: '510 Townsend St',
            postal_code: '98140',
            city: 'San Francisco',
            state: 'CA',
            country: 'US',
          },
        },
      });

      // Create a new order
      const order = {
        transactionAmount: price,
        transactionType: 'online',
        transactionStatus: false,
        gatewayName: 'stripe',
        transactionBy: id,
        transactionDate: new Date(),
        stripePaymentIntentId: paymentIntent.id,
      };

      const newOrder = new Order(order);
      const result = await newOrder.save();
      const updatedApplication = await FormData.findOneAndUpdate({ application_id: id }, { orderId: result._id });

      // Return the PaymentIntent client secret to the client-side
      return res.status(200).json({ clientSecret: paymentIntent.client_secret, price: price });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error });
    }
  }

  static createRazorpayOrder = async (req, res) => {
    const { id } = req.params;
    try {
      let application = await FormData.findOne({ application_id: id })
      if (!application) return res.status(400).json({ message: "application not exist" })
      if (application.paid) return res.status(400).json({ message: "application is already paid" })
      // if(application.currentTab!=5) return res.status(400).json({message:"please complete application"})
      let price = checkPrice(application.tabOne.visa_service, application?.tabOne?.visa_service_for_eTourist)

      var options = {
        amount: price * 100,  // amount in the smallest currency unit
        currency: "USD",
        receipt: String(new Date().valueOf())
      };
      instance.orders.create(options, async function (err, order) {
        if (err) {
          console.error(err);
          return res.status(500).send(err);
        }

        // Create a new order
        const orderBody = {
          transactionAmount: price,
          transactionType: 'online',
          transactionStatus: false,
          gatewayName: 'razorpay',
          transactionBy: id,
          transactionDate: new Date(),
          razorpayId: order.id,
        }

        const newOrder = new Order(orderBody);
        const result = await newOrder.save();
        const updatedApplication = await FormData.findOneAndUpdate({ application_id: id }, { orderId: result._id }); 
        res.send(order);
      });
    } catch (error) {
      res.status(500).json({ error })
    }
  }


  static validateRazorpay = async (req, res) => {
    // The body should contain `orderCreationId`, `razorpayPaymentId`, and `razorpaySignature`
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    // `orderCreationId` is the `order_id` of the order you created
    // `razorpayPaymentId` is the payment ID generated by Razorpay
    // `razorpaySignature` is the signature generated by Razorpay

    //Find Order
    let orderDetails = await Order.findOne({razorpayId:razorpay_order_id})
    if(!orderDetails) return es.status(400).json({ status: true, message: 'Order does not exist' });
    // Create a hash using the same algorithm and key used by Razorpay
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_LIVE_KEY); // Replace with your `key_secret`
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    // Check if the created hash matches the Razorpay signature
    if (digest === razorpay_signature) {
      // Payment is legitimate
      let FormResult = await FormData.findOneAndUpdate({ application_id: orderDetails.transactionBy }, { paid: true, status: "pending" })
      res.status(200).json({ status: true, message: 'Payment verified successfully' });
      // Further business logic here (e.g., updating order status, sending confirmation email)
    } else {
      // Payment is not legitimate
      res.status(200).json({ status: false, message: 'Payment verification failed' });
    }
  }
}