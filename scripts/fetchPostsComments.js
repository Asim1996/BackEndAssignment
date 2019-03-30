// Task 1: ii)Fetching Posts and Comments and creating a DB per user with posts colection
const https = require("https");

//User Data Endpoint
const postdataUrl = "https://jsonplaceholder.typicode.com/posts";
const commentdataUrl="https://jsonplaceholder.typicode.com/comments";
const userdataUrl = "https://jsonplaceholder.typicode.com/users";
// Connection URL
const url = "mongodb://localhost:27017";

// create a client to interact with db
const MongoClient = require('mongodb').MongoClient;

// make client connect to mongo service
MongoClient.connect(url, function(err, client) {
    if (err) console.log(err);
    console.log("Connected successfully to server"); 
    getPosts(postdataUrl).then((posts)=>{
        getComments(commentdataUrl).then((comments)=>{
            //Map Comments to post based on postId 
            const postwithComments=posts.map((post)=>{
                var postcomment=comments.filter((comment)=>{
                    return post.id==comment.postId;
                })
                post.comments=postcomment;
                return post;
            })
        getUsers(userdataUrl).then((users)=>{
        users.forEach(user => {
            const data=postwithComments.filter((postwithComment)=>{
                return postwithComment.userId==user.id;
             })
         
            //  Creating a db per user with dbname set to the UserId
             const db = client.db(`User${user.id}`);
             const collection = db.collection('posts');
             collection.insertMany(data, function(err, result) {
                if(err){
                  console.log(err);
                }else{
               console.log(data);
               }
             })
        })    
        })
    })
})    

})

//A function to get posts using Promise  
const getPosts=(postdataUrl)=>{
    return new Promise((resolve,reject)=>{
        https.get(postdataUrl, res => {
            res.setEncoding("utf8");
            let body="";
            res.on("data", data => {
              body += data;
            });
            res.on("end", () => {
              body = JSON.parse(body);
              resolve(body);
        });
    })
    })    
}

//A function to get comments      
const getComments=(commentdataUrl)=>{
    return new Promise((resolve,reject)=>{
    https.get(commentdataUrl, res => {
        res.setEncoding("utf8");
        let body="";
        res.on("data", data => {
          body += data;
        });
        res.on("end", () => {
          body = JSON.parse(body);
          resolve(body);
         });
    })
})     
}
//A function to get users
const getUsers=(userdataUrl)=>{
    return new Promise((resolve,reject)=>{
    https.get(userdataUrl, res => {
        res.setEncoding("utf8");
        let body="";
        res.on("data", data => {
          body += data;
        });
        res.on("end", () => {
          body = JSON.parse(body);
          resolve(body);
         });
    })
})     
}
