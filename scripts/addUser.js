// Task 1: i)Fetching Users and saving to DB_NAME:master,collection:users
const https = require("https");

//User Data Endpoint
const userdataUrl = "https://jsonplaceholder.typicode.com/users";
// Connection URL
const url = "mongodb://localhost:27017";
// Database Name
const dbName = 'master';

// create a client to interact with db
const MongoClient = require('mongodb').MongoClient;

// make client connect to mongo service
MongoClient.connect(url, function(err, client) {
    if (err) console.log(err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);
  
  getUsers(userdataUrl,(data)=>{
    const collection = db.collection('users');
    const users=data.map(user=>{
      //Adding a default password
       user.password="pass";
       return user;
   })
   //Inserting users in the Users collection
   collection.insertMany(users, function(err, result) {
     if(err){
       console.log(err);
     }else{
    console.log(result);
    }
  })
    client.close();
    });
  })    
    
//A function to get users      
const getUsers=(userdataUrl,callback)=>{
    https.get(userdataUrl, res => {
        res.setEncoding("utf8");
        let body="";
        res.on("data", data => {
          body += data;
        });
        res.on("end", () => {
          body = JSON.parse(body);
          callback(body);
         });
    })    
}