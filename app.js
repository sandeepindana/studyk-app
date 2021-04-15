// Import && Configuring .env file  
require("dotenv").config();

// Import && Create Express App
const express = require("express");
const session = require('express-session')
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Session Setup
app.use(session({

     // It holds the secret key for session
     secret: 'qwe1234',

     // Forces the session to be saved
     // back to the session store
     resave: true,

     // Forces a session that is "uninitialized"
     // to be saved to the store
     saveUninitialized: true
}))

// Import user router
const userRouter = require("./api/users/user.router");

// Declaring test api
app.get("/", (req, res) => {
     res.json({
          status: 'success',
          message: 'Hello....'
     })
});

app.get("/api", (req, res) => {
     res.json({
          status: 'success',
          message: 'Studyk App api list...'
     })
});

// Defining user api route 
app.use("/api/users", userRouter);


app.listen(process.env.APP_PORT, () => {
     console.log("Server up and running at port : " + process.env.APP_PORT);
});
