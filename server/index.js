const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const Authenticate = require('./middleware/authenticate');
// const Razorpay = require('razorpay');

// import Razorpay from "razorpay"
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:3000', // replace with your frontend URL
    credentials: true
}));

//const port = 5000;

dotenv.config({path : './config.env'});
require('./db/conn');
// const User = require('./model/UserSchema')
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

// Serve images from a directory
app.use('/images', express.static(path.join(__dirname, 'images')));
const PORT = process.env.PORT;


// //Middleware
// const middleware = (req , res , next)=> {
//     console.log(`hello from middleware`);
//     next();
// }

// app.get('/about' , middleware ,(req , res) => {
//     res.send('hello wordls');
// });


// app.route("/checkout").post(checkout);
// app.route("/paymentverification").post(paymentVerification);

app.get("/getkey", Authenticate , (req, res) => {
    console.log(process.env.RAZORPAY_API_KEY); // Check if the key is being logged correctly
    res.status(200).json({ key:  process.env.RAZORPAY_API_KEY});
});

app.use(require('./router/auth'));

app.listen(PORT , () => {
    console.log(`Server is running at http://localhost:${PORT}`)
})