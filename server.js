const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const User = require('./models/User')
const mongoose = require("mongoose")
const validator = require("validator")
const https = require("https")
var crypto = require("crypto");
var path = require('path')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
const session = require('express-session')
var LocalStrategy = require('passport-local').Strategy;
var nodemailer = require("nodemailer");
SALT_WORK_FACTOR = 5;

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true})

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}))


app.engine('html', require('express-art-template'))
app.use('/public/', express.static(path.join(__dirname, './public/')))
app.use('/node_modules/', express.static(path.join(__dirname, './node_modules/')))

//session
app.use(session({
  cookie:{maxAge: 120000},
  resave:false,
  saveUninitialized:false,
  secret:'$$$DeakinSecret'
}))
app.use(passport.initialize())
app.use(passport.session());

//passport config
passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//route
app.get('/', function (req, res){
  res.render('login.html', { user : req.user })
})


app.get('/register', function (req, res){
  res.render('register.html')
})

app.get('/iCrowdTask',(req, res)=>{
  
  if(req.isAuthenticated()
    )
    { res.render('iCrowdTask.html')
    console.log('success!')
  }
    else
    {res.redirect('/')}
  })

app.post('/iCrowdTask', function (req, res){
})

app.get('/googleLog', function (req, res){
  res.render('googleSignIn.html')
})
//forget password
app.get('/forgetPwd', function (req, res){
  res.render('forgetPwd.html')
})

app.post('/forgetPwd', function (req, res){
  var email = req.body.email;
  User.findOne({
    email: email},function (err, user){

      if(err) { 
        console.log('err')
        return res.status(500).json({
            err_code:500,
            message: 'err'
        })
    }
    
     if(!user) {
      return res.status(200).json({
          err_code: 1,
          message: 'email not existed'
      })
  }
  //send reset email
  var smtpTransport = nodemailer.createTransport({
    host: 'smtp.qq.com',//qq email server
    port: 465,
    secure: true, // use SSL
    auth: {
    user: '992974106@qq.com',
    pass: 'djzwqsmcfdlvbeji'
    }
    });
    
    var mailOptions = {
    　　from: "992974106@qq.com",
    　　to: email,
    　　subject: "iCrowdTask password reset",
    　　html:"<h1>Hi,"+email+"</h1><br> <p>click <a href="+'"http://localhost:5000/forgetPwd/resetPwd"'+">here</a> to reset your password</p>"
    }

    smtpTransport.sendMail(mailOptions, function(err, resp){
      　　if(err){
      　　　　console.log(err)
      　　}
      console.log("send successfully")
      　　smtpTransport.close();//close connect
      });
  return res.status(200).json({
    err_code: 0,
    message: 'send reset email successfully'
})
    })


})


//reset password
app.get('/forgetPwd/resetPwd', function (req, res){
  res.render('resetPwd.html')
})
app.post('/forgetPwd/resetPwd', function (req, res){
  var email = req.body.email;
  var psw = req.body.password;


  User.findOne({
    email: email},function (err, user){

      if(err) { 
        return res.status(500).json({
            err_code:500,
            message: 'err'
        })
    }
    
     if(!user) {
      return res.status(200).json({
          err_code: 1,
          message: 'email not existed'
      })
  }

  user.setPassword(psw,  function(){
    user.save();
    return res.status(200).json({
      err_code: 0,
      message: 'reset password successfully'
  })
  })
  
    })

})


//insert function
function insert(id,username,country,fName,lName,email,psw,adress1,adress2,city,state,zip,pNumber){

var user =  new User({
  id: id,
  username:username,
  country: country,
    firstName: fName,
    lastName: lName,
    email: email,
    password: psw,
    address1:adress1,
    address2:adress2,
    city: city,
    state: state,
    postalCode: zip,
    phoneNumber: pNumber
  }
        );
user.save(function(err,res){
    if(err){
        console.log(err);
    }
    else{
        console.log(res);
    }
})
}

app.post('/register', function (req, res) {

  res.setHeader('Content-type','application/json;charset=utf-8');
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By",' 3.2.1');
  
  var id = req.body.first_name+req.body.email;
  var country = req.body.country;
  var username = req.body.email;
  var fName = req.body.first_name;
  var lName = req.body.last_name;
  var email = req.body.email;
  var psw = req.body.password;
  var c_psw = req.body.confirm_password;
  var adress1 = req.body.address1;
  var adress2 = req.body.address2;
  var city = req.body.city;
  var state = req.body.state;
  var zip = req.body.zip;
  var pNumber = req.body.phone_number;
  
  var updatestr = {email: email};
  
  var md5 = crypto.createHash("md5");
  var newPas = md5.update(psw).digest("hex");


  User.find(updatestr, function(err, obj){
      if (err) {
        return res.status(500).json({
          success: false,
          message: "err"
        })
      }
      
      if(psw.length < 8)
      {
        return res.status(200).json({
          err_code: 2,
          message:"Password can not be less than 8 letters"
         })
        
      }
      
     if(psw != c_psw)
         {
           return res.status(200).json({
             err_code: 3,
             message:"The two password inputs are inconsistent"
            })
         }

         if(obj.length != 0)
      {
        return res.status(200).json({
          err_code: 1,
          message:"email existed"
         })
        
      }
      else
      {
        User.register(new User({id:id,username: username,
          country : req.body.country,
          firstName : req.body.first_name,
          lastName : req.body.last_name,
          email : req.body.email,
          adress1 : req.body.address1,
          adress2 : req.body.address2,
          city : req.body.city,
          state : req.body.state,
          postalCode : req.body.zip,
          phoneNumber : req.body.phone_number }), req.body.password, function(err, User) {
          if (err) {
            console.log("err")
              return res.render('/register', { User : User });
          }
  
          passport.authenticate('local')(req, res, function () {
            res.redirect('/');
          });
      });

        //insert(id,username,country,fName,lName,email,newPas,adress1,adress2,city,state,zip,pNumber); 
            //send email
     const data = {
       members:[{
       email_address:email,
       status:"subscribed",
       merge_fields:{
          FNAME: fName,
         LNAME: lName
      }
    }]
  }
   jsonData = JSON.stringify(data);

      const url = "https://us17.api.mailchimp.com/3.0/lists/8ce1e9593c";
      const options = {
      method:"POST",
      auth:"azi:6f8c2444e057e16d929df98325e3b4b3-us17"
  }

      const request = https.request(url, options, (response)=>{
        response.on("data", (data)=>{
        console.log(JSON.parse(data))
    })
  })

        request.write(jsonData)
        request.end();


        return res.status(200).json({
          err_code:0,
         message: 'registered successfully'
        })
      }

})  
});



app.post('/', passport.authenticate('local'), function(req, res) {
  res.redirect('/iCrowdTask');
});




/*
app.post('/',function (req, res, next) {

  
  
  res.setHeader('Content-type','application/json;charset=utf-8')
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By",' 3.2.1')

  var email = req.body.username;
  var UserPsw = req.body.password;

  var md5 = crypto.createHash("md5");
  var newPas = md5.update(UserPsw).digest("hex");

 


  User.findOne({
      email: email,password:newPas},function (err, user){
        console.log(email+" "+newPas)
    if(err) { 
        console.log('err')
        return res.status(500).json({
            err_code:500,
            message: 'err'
        })
    }
    
     if(!user) {
      return res.status(200).json({
          err_code: 1,
          message: 'email or password err'
      })
  }
   return res.status(200).json({
    err_code: 0,
    message: 'registered successfully'
})
    })
  

}); 
 
*/
// Crowd REST APIs
//workers
app.route('/workers')
.get( (req, res)=>{
    User.find((err, userList)=>{
        if (err) {res.send(err)}
        else {res.send(userList)}
    })
})
.post( (req,res)=>{
    const user = new User({
        id : req.body.first_name+req.body.email,
        username:req.body.email,
        country : req.body.country,
        firstName : req.body.first_name,
        lastName : req.body.last_name,
        email : req.body.email,
        adress1 : req.body.address1,
        adress2 : req.body.address2,
        city : req.body.city,
        state : req.body.state,
        postalCode : req.body.zip,
        phoneNumber : req.body.phone_number
    })
    user.save((err) =>{
        if (err) {res.send(err)}
        else res.send ('Successfully added a new user!')
    }
    )
})
.delete((req,res) =>{
    User.deleteMany((err) =>{
        if (err) {res.send(err)}
        else {res.send('Successfully deleted all users!')}
    })
})

//workers/:id
app.route('/workers/:id')
.get((req, res)=>{
    User.findOne({id: req.params.id}, (err, foundUser)=>{
        if (foundUser) (res.send(foundUser))
        else res.send("No Matched User Found!")
    })
})
.put((req,res)=>{
User.update(
    {id: req.params.id},
    {   id: req.body.first_name+req.body.email,
        username:req.body.email,
        country : req.body.country,
        firstName : req.body.first_name,
        lastName : req.body.last_name,
        email : req.body.email,
        password : req.body.password,
        adress1 : req.body.address1,
        adress2 : req.body.address2,
        city : req.body.city,
        state : req.body.state,
        postalCode : req.body.zip,
        phoneNumber : req.body.phone_number
   
    },
    {overwrite:true}, 
    (err)=>{
        if (err) {res.send(err)}
        else {res.send('Successfully updated!')}
    }
)
})
.delete((req,res) =>{
  User.deleteOne({id: req.params.id}, (err) =>{
      if (err) {res.send(err)}
      else {res.send('Successfully deleted this user!')}
  })
})

.patch((req, res)=>{
    User.update(
        {id: req.params.id},
        {$set: req.body},
        (err)=>{
            if (!err) {res.send('Successfully updated! ')}
            else res.send(err)
        }
    )
})

app.listen(process.env.PORT || 5000, ()=>{
  console.log('Server started on port 5000');
})



