const express = require("express")
const app = express();
const cors = require("cors")
const mongodb = require("mongodb")
const mongoClient = mongodb.MongoClient;
 const URL = "mongodb+srv://rental:rental@cluster0.vwqej.mongodb.net/rental?retryWrites=true&w=majority";

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
app.post("/login", async (req, res) => {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("rental");
        let user = await db.collection("rental").findOne({ email: req.body.email })
        if (user) {
            let passwordResult = await bcrypt.compare(req.body.password, user.password)
            if (passwordResult) {
                let token = jwt.sign({ userid: user._id }, secret, { expiresIn: "1h" });
                res.json({ token })
            } else {
                res.status(401).json({ message: "Email Id or Password did not match" })
            }
        } else {
            res.status(401).json({ message: "Email Id or Password did not match" })
        }
    } catch (error) {
        console.log(error)
    }
})

// login method end

// user creat  

app.post("/cart", async function (req, res) {

    try {
        let connection = await mongoClient.connect(URL)

    
        let db = connection.db("rental")

       
        await db.collection("userDetails").insertOne(req.body)

      
        connection.close();

        res.json({ message: "User Added" })
    } catch (error) { 
        console.log(error) 
    }
  
})

app.get("/home", authenticate, function (req, res) {
    res.json({ authorization : "successful" })
})


app.listen(process.env.PORT || 3001)  //  pocess.env.PORT || this heroku processs 
 