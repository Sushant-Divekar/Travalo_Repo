const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Authenticate = require("../middleware/authenticate");

require('../db/conn');
const User = require('../model/UserSchema');
const Trips = require('../model/TripSchema');
const Booking = require('../model/Booking');

const { checkout, paymentVerification } = require('../middleware/paymentController');


router.get('/' , (req , res) => {
    res.send('hello wordls router');
});


router.get('/destinations/:category', async (req, res) => {
    const { category } = req.params;
  
    try {
      const trips = await Trips.find({ categories: category });
      res.json(trips);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });


router.post('/register' , async (req , res) =>{
    // console.log(req.body);
    const {firstname , lastname , username , emailid , 
        password , cpassword}= req.body;

    if(!firstname || !lastname || !username || !emailid
        || !password || !cpassword){
            return res.status(422).json({error : "plz filled field properly"})
    }

    try{
        const userExist = await User.findOne({emailid:emailid});

        if(userExist){
            return res.status(422).json({error : "email already exist"});
        }
        else if(password != cpassword){
            return  res.status(422).json({error : 'password are not matching'})
        }

        const user = new User({firstname , lastname , username , emailid , 
            password , cpassword});

        const userRegister = await user.save();

        if(userRegister){
            const token = await userRegister.generateAuthToken();
            console.log(token);

            res.cookie("jwtoken", token, {
                expires: new Date(Date.now() + 25892000000),
                httpOnly: true
            });
            
            res.status(201).json({message : "user successfuly registered"});
        }

        

    }catch(err){
        console.log(err);
    }
})

router.post('/signin' , async (req , res) => {

    try {
        const { emailid, password } = req.body;

        if (!emailid || !password) {
            return res.status(400).json({ error: 'Please fill in all the data' });
        }

        const userLogin = await User.findOne({ emailid: emailid });
        
        if (userLogin) {
            const isMatch = await bcrypt.compare(password, userLogin.password);

            if (!isMatch) {
                return res.status(400).json({ error: "Invalid credentials" });
            }

            const token = await userLogin.generateAuthToken();
            console.log(token);

            res.cookie("jwtoken", token, {
                expires: new Date(Date.now() + 25892000000),
                httpOnly: true
            });

            return res.json({ message: 'User signed in successfully' });
        } else {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

    }catch(err){
        console.log(err);
    }
})

router.get('/getuser' , Authenticate , async(req, res) => {
    try{

        const user = await User.findById(req.userID).select('-password -cpassword -tokens');

        if(!user){
            return res.status(404).json({error : "User not found"});
        }

        res.status(200).json(user);

    }catch(err){
        console.log(err);
        res.status(500).json({error: "server error"});
    }
})

router.get('/about', Authenticate ,(req , res) => {
    console.log('hello wordls');
    res.send(req.rootUser);
});

router.patch('/updateuser' , Authenticate , async(req,res) => {
    const updates = req.body;

    const allowUpdates = ['firstname', 'lastname', 'username', 'emailid'];

    const isValidOperation = Object.keys(updates).every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates!' });
    }

    try {
        const user = await User.findById(req.userID);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        Object.keys(updates).forEach((update) => user[update] = updates[update]);

        await user.save();

        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
})

// router.get('/booknowpage', Authenticate ,(req , res) => {
//     console.log('hello wordls');
//     res.send(req.rootUser);
// });


router.get('/signout' ,(req , res) => {
    console.log('hello logout');
    res.clearCookie('jwtoken' , {path:'/'})
    res.status(200).send('logout');
});


//trips 
router.post('/addtrips', async (req, res) => {
    const { placename, address, countryname, rating, price, description, categories, placeimg } = req.body;

    // Check if all required fields are provided
    if (!placename || !address || !countryname || typeof rating !== 'number' || typeof price !== 'number' || !description || !Array.isArray(categories) || !placeimg) {
        return res.status(422).json({ error: "Please fill all fields properly" });
    }

    try {
        // Create a new trip instance
        const trip = new Trips({ placename, address, countryname, rating, price, description, categories, placeimg });

        // Save the trip to the database
        const tripAdd = await trip.save();

        // Check if the trip was added successfully
        if (tripAdd) {
            return res.status(201).json({ message: "Trip successfully added" });
        } else {
            return res.status(500).json({ error: "Failed to add trip" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "An error occurred while adding the trip" });
    }
});



// GET all trips
router.get('/gettrips', async (req, res) => {
    try {
        const trips = await Trips.find();
        res.status(200).json(trips);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch trips" });
    }
});



// Get all featured destinations
router.get('/featured-destinations', async (req, res) => {
    try {
      const trips = await Trips.find().limit(5); // Adjust the limit as per your requirements
      res.json(trips);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });


router.get('/:placename' , async(req,res) => {
    try{
        placename = req.params.placename;
        const place = await Trips.findOne({placename});

        if(!place){
            return res.status(404).json({message : 'place not found'});
        }

        res.json(place);

    }catch(error){
        res.status(500).json({message : "server error"});
    }
})



// Get destinations by category
// router.get('/destinations/:category', async (req, res) => {
//     try {
//       const category = req.params.category;
//       console.log(`Searching for trips in category: ${category}`);
      
//       // Fetch trips that include the specified category
//       const trips = await Trip.find({ categories: category });
//       res.json(trips);
//     } catch (err) {
//       console.error(`Error fetching trips for category ${req.params.category}:`, err);
//       res.status(500).json({ message: err.message });
//     }
//   });


  


//Booking routes
// Create a new booking
router.post('/addbookings', Authenticate ,async (req, res) => {
    try {
      const newBooking = new Booking(req.body);
      const savedBooking = await newBooking.save();
      res.status(201).json(savedBooking);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
});

// Get all bookings
router.get('/bookings', Authenticate ,async (req, res) => {
    try {
      const bookings = await Booking.find();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});
  
  // Get a single booking by ID
router.get('/bookings/:id', Authenticate , async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id);
      if (!booking) return res.status(404).json({ message: 'Booking not found' });
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});
  
  // Update a booking
router.put('/bookings/:id', Authenticate , async (req, res) => {
    try {
      const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedBooking) return res.status(404).json({ message: 'Booking not found' });
      res.json(updatedBooking);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
});
  
  // Delete a booking
  router.delete('/bookings/:id', Authenticate ,async (req, res) => {
    try {
      const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
      if (!deletedBooking) return res.status(404).json({ message: 'Booking not found' });
      res.json({ message: 'Booking deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


router.post('/checkout', Authenticate ,checkout);
router.post('/paymentverification', Authenticate , paymentVerification);
module.exports = router;