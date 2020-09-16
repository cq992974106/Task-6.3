const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')
SALT_WORK_FACTOR = 5;

const userSchema=new mongoose.Schema(
    {
    id: String,
    username: {
      type: String,
    },
    country: {
    type: String,
    
  },
 
    firstName: {
    type: String,
    
  },
    lastName: {
    type: String,
    
  },
    email: {
    type: String,
    
  },
    password: {
    type: String,
   
  },
    address1: {
    type: String,
   
  },
  address2: {
    type: String,
  
  },
    city: {
    type: String,
   
  },
    state: {
    type: String,
  
  },
    postalCode: {
    type: Number,
  },
    phoneNumber: {
    type: Number,
  }
    }
)


//userSchema.plugin(passportLocalMongoose);
userSchema.plugin(passportLocalMongoose, {
  usernameUnique: false})


module.exports = mongoose.model("User",userSchema)