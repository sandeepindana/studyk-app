// Import && Configuring .env file  
require("dotenv").config();

// Import && Create Express App
const express = require("express");
const session = require('express-session')
var cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

// //   VHOST


// const vhost = (hostname, app) => (req, res, next) => {
//      // console.log(req.headers.host);
//      const host = req.headers.host.split(':')[0];
//      // res.send("Algo...." + host);
//      console.log(host, hostname);
//      // next();

//      if (host === hostname) {
//           return app(req, res, next);
//      } else {
//           next();
//      }
// }

// app.use(vhost('server1', app));

// //   VHOST

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

// Route Verify account
// app.post("/verifyaccount", (req, res) => {
//      res.json(req.body);
// });


// Defining user api route 
app.use("/api/users", userRouter);

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


app.listen(process.env.APP_PORT, () => {
     console.log("Server up and running at port : " + process.env.APP_PORT);
});
