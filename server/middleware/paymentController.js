// // const instance = require('../index.js')
// const crypto = require("crypto")
// const dotenv = require('dotenv');
// const Payment = require('../model/paymentModel');
// dotenv.config({path : './config.env'});

// const Razorpay = require('razorpay');
// const instance = new Razorpay({
//     key_id: process.env.RAZORPAY_API_KEY,
//     key_secret: process.env.RAZORPAY_SECRET_KEY,
//   });
// // module.exports = instance;

// const checkout = async (req , res) =>{

//     const options = {
//         amount : Number(req.body.amount*100),
//         currency : "INR",
//     };
//     const order = await instance.orders.create(options);  

//     //console.log(order);
//     res.status(200).json({
//         success:true,
//         order,
//     });
// }

// const paymentVerification = async (req , res) =>{
//     // console.log(req.body);
//     const {razorpay_order_id , razorpay_payment_id , razorpay_signature} = req.body;

//     let body = razorpay_order_id + "|" + razorpay_payment_id;

    
//     const expectedSignature = crypto
//         .createHmac('sha256' , process.env.RAZORPAY_SECRET_KEY)
//         .update(body.toString())
//         .digest('hex');
//         console.log("sig received" ,razorpay_signature);
//         console.log("sig generated" , expectedSignature);

//         const isAuthenticate = expectedSignature == razorpay_signature;

//         if(isAuthenticate){
//             //database come here
//             await Payment.create({
//                 razorpay_order_id,
//                 razorpay_payment_id,
//                 razorpay_signature
//             });

//             res.redirect(`http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`)
//         }
//         else{
//             res.status(200).json({
//                 success:false,
//             });
//         }

    
// }

// module.exports = paymentVerification;
// module.exports = checkout;

const crypto = require("crypto");
const dotenv = require('dotenv');
const Payment = require('../model/paymentModel');
dotenv.config({ path: './config.env' });

const Razorpay = require('razorpay');
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
});

const checkout = async (req, res) => {
    try {

        console.log("checkout")
        const options = {
            amount: Number(req.body.amount * 100),
            currency: "INR",
        };
        const order = await instance.orders.create(options);

        res.status(200).json({
            success: true,
            order,
        });
        console.log("checkout finish")

    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to create order. Please try again later.',
        });
    }
};

const paymentVerification = async (req, res) => {
    try {

        console.log('Payment verification initiated');

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Log the incoming request body for debugging
        console.log('Request body:', req.body);

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
            .update(body.toString())
            .digest('hex');
        
        console.log("sig received", razorpay_signature);
        console.log("sig generated", expectedSignature);

        const isAuthenticate = expectedSignature === razorpay_signature;

        if (isAuthenticate) {
            console.log('Payment authenticated successfully');
            // Save the payment details in the database
            await Payment.create({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            });

            console.log('Payment details saved to database');

            res.redirect(`http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`);
        } else {
            console.log('Payment authentication failed');
            res.status(400).json({
                success: false,
                message: 'Payment verification failed.',
            });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error. Please try again later.',
        });
    }
};

module.exports = {
    checkout,
    paymentVerification
};
