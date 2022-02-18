const express = require("express")
const app = express();
const cors = require("cors")
const mongodb = require("mongodb")
const mongoClient = mongodb.MongoClient;
const URL = "mongodb+srv://admin:admin123@cluster0.hijj3.mongodb.net?retryWrites=true&w=majority";

// const URL = "mongodb://localhost:27017";
const bcrypt = require("bcryptjs")
const jwt=require("jsonwebtoken")  

const secret="Gdc3XkBkRy";
let usersList = [];
app.use(express.json())

app.use(cors({ 
    origin: "*" 
}))

// authenticate
let authenticate=function(req,res,next){
    if(req.headers.authorization){
      try {
           let result=jwt.verify(req.headers.authorization,secret);
           next();
      
      } catch (error) {
        res.status(401).json({message:"Token Expired"})
      }
    }
    else{
        res.status(401).json({message:"Not Invalid"})
    }
}


//User register process

app.post("/register", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("rental")

        //Encrypt the password in database
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(req.body.password, salt);
        req.body.password = hash;

        await db.collection("users").insertOne(req.body)
        connection.close();
        res.json({ message: "user creatrd" });
    } catch (error) {
        console.log(error)
    }
})

// login method start
app.post("/login", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("rental") 

        let user = await db.collection("users").findOne({ email: req.body.email })
        if (user) { 
            let passwordResult = await bcrypt.compare(req.body.password,user.password)
            if (passwordResult) {
                
                //generate token
                let token=jwt.sign({userid :user._id},secret,{ expiresIn: '1h' });
                res.json({token})
            }
            else {  
                res.status(401).json({ message: "Email id or password Not match" })
            } 
        }
        else {
            res.status(401).json({ message: "Email id or password Not match" })
        } 
    } catch (error) {
        console.log(error)
    }
})
// login method end

// user creat

app.post("/cart", async function (req, res) {

    try {
        //connect to the Database
        let connection = await mongoClient.connect(URL)

        //select DB
        let db = connection.db("rental")

        //select collection
        //do any operation
        await db.collection("userDetails").insertOne(req.body)

        //close the connection
        connection.close();

        res.json({ message: "User Added" })
    } catch (error) {
        console.log(error)
    }
    // req.body.id=usersList.length + 1; 
    // usersList.push(req.body)
    // res.json({"mess":"user add"})
})

// app.get("/dashboard",authenticate,function (req, res) {
//     res.json({ totalUsers: 30 })
// })

app.listen(process.env.PORT || 3001)  //  pocess.env.PORT || this heroku processs 
 