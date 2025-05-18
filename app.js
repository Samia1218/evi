//all imports
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import connectDB from './config/connect.js';
dotenv.config();

//all consts
const app = express();
const port = process.env.PORT;  //deploying to render

//middlewares
app.use(express.json());
app.use(cors());

//routes
import adminRoutes from './routes/adminRoutes.js';
import visaRoutes from './routes/visaRoutes.js';
import queryRoutes from './routes/queryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import footerRoutes from './routes/footerRoutes.js';
import {createAdmin } from './helper/createSuperAdmin.js';
import blogRoutes from './routes/blogRoutes.js'

//mount routes
app.use('/admin', adminRoutes);
app.use('/visa', visaRoutes);
app.use('/query', queryRoutes);
app.use('/order', orderRoutes);
app.use('/blog', blogRoutes);
app.use('/footer', footerRoutes);

app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.send(`<h1>E-visa app</h1>`);
});

//connect to database
connectDB();

// create a super admin if not exist 
createAdmin();


app.listen(port, () => {
  console.log(`E-visa app started at http://localhost:${port}`);
});