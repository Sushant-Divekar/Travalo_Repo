// models/Booking.js
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true 
    },
    phone: { 
        type: String, 
        required: true 
    },
    destination: { 
        type: String, 
        required: true 
    },
    departureDate: { 
        type: Date, 
        required: true 
    },
    returnDate: { 
        type: Date, 
        required: false 
    },
    adults: { 
        type: Number, 
        required: true, 
        min: 1 
    },
    children: { 
        type: Number, 
        required: false, 
        min: 0 
    },
    carRental: { 
        type: Boolean, 
        required: false 
    },
    insurance: { 
        type: Boolean, 
        required: false 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const Booking = mongoose.model('booking' , BookingSchema);

module.exports = Booking
