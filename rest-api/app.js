const express = require('express');
const bodyParser = require('body-parser');
var session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoConnect = require('./util/db').mongoConnect;
const getDb = require('./util/db').getDb;
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();
// Storing session in db instead of local memory
const store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/master',
    collection: 'sessions'
  });
// initialize body-parser to parse incoming parameters requests to req.body
app.use(bodyParser.urlencoded({ extended: false }));

// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({
    key: 'user_id',
    secret: 'top secret',
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        expires: 600000
    }
}));

const handleError = (err, res) => {
    res
      .status(500)
      .contentType("text/plain")
      .end("Oops! Something went wrong!");
  };
  
  var upload = multer({ dest: 'uploads/' })
  
isAuthenticated=(req,res,next)=>{
    if(req.session.isLoggedIn){
        return next();
    }
    return res.status(401).send();
}
// Session-based authentication system 
// i) Login 
app.post('/login',async function(req, res) {
const username=req.body.username;
const password=req.body.password;
const db = getDb(); 
var user=await db.collection('users').findOne({username:username,password:password})
        if(!user){
            return res.status(401).json({message:"Account not found or Password was incorrect."});
        }else{
        //Creating a session upon login 
        req.session.isLoggedIn=true;
        req.session.user = user;
        req.session.save(err => {
            if(err){
                console.log(err);
            }
            return res.send("Logged In");
          });
        
        }
});
 
// route for user logout
app.get('/logout', (req, res) => {
    
    // Destroying the session
    req.session.destroy((err)=>{
        if(err){
        console.log(err);
        }
        return res.send("Logged Out");
      });
});


//ii)Fetch All Users
app.get('/users',(req,res)=>{
    const db = getDb();    
//toArray() method returns an array that contains all the documents from cursor 
  db.collection('users').find().toArray().then((user)=>{
        return res.json(user);
})
})

// iv)Update User Image (Only loggedIn user can update)
app.post('/updateImage/:id',isAuthenticated,upload.single("file"),async (req,res)=>{
    const db = getDb(); 
    const id=Number(req.params.id);
    const user=await db.collection('users').findOne({id:id});
    if(!user){
     return res.json({message:"User not found"});
    }
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname,`./uploads/${user.username}.jpg`);
    if (path.extname(req.file.originalname).toLowerCase() === ".jpg") {
      fs.rename(tempPath, targetPath, err => {
        if (err) return handleError(err, res);
        db.collection('users').update(
            { id: id },
            { $set: { "profileImage": `./uploads/${user.username}.jpg` } }
         )
        res
          .status(200)
          .contentType("text/plain")
          .end("File uploaded!");
      });
    } else {
      fs.unlink(tempPath, err => {
        if (err) return handleError(err, res);
        res
          .status(403)
          .contentType("text/plain")
          .end("Only .jpg files are allowed!");
      });
    } 
})



mongoConnect(() => {
    app.listen(3000);
  });