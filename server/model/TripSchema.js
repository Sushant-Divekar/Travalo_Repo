const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    placename:{
        type : String,
        required : true,
    },
    address:{
        type : String,
        required : true,
    },
    countryname:{
        type : String,
        required : true,
    },
    rating:{
        type : Number,
        required : true,
    },
    price:{
        type : Number,
        required :true,
    },
    description:{
        type : String,
        requires : true,
    },
    categories: [
        {
            type: String,
            required: true,
        }
    ],
    placeimg: [
        {
            type: String,
            required: true,
        }
    ]


});

const Trip = mongoose.model('trip' , tripSchema);
module.exports = Trip;