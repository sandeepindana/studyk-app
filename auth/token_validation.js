const { verify } = require("jsonwebtoken");
const { getUserByCompany, checkPostTitle } = require("../api/users/user.service");
// const userFunctions = require("../api/users/user.functions");

module.exports = {
     checkToken: (req, res, next) => {
          let token = req.get("authorization");
          if (token) {
               token = token.slice(7);
               // console.log(token);

               verify(token, "qwe1234", (err, decoded) => {
                    if (err) {
                         res.json({
                              status: 'error',
                              message: "Invalid Token"
                         })
                    } else {
                         // console.log(decoded);
                         req.authData = decoded;
                         next();
                    }
               })
          } else {
               res.json({
                    status: 'error',
                    message: "Access denied. Unauthorized user access"
               });
          }
     },
     verifyToken: (req, res) => {
          let token = req.get("authorization");
          if (token) {
               token = token.slice(7);
               // console.log(token);
               req.token = token;
               verify(token, "qwe1234", (err, decoded) => {
                    if (err) {
                         res.json({
                              status: 'error',
                              message: "Invalid Token"
                         })
                    } else {
                         // console.log(decoded);
                         // req.authData = decoded;
                         // next();
                         res.json({
                              status: 'success',
                              message: "Valid Token",
                              token: token
                         });
                    }
               })
          } else {
               res.json({
                    status: 'error',
                    message: "Access denied. Unauthorized user access"
               });
          }
     },
     checkCompany: (req, res, next) => {
          // console.log("check company");
          // console.log(JSON.stringify(req.body));
          let company = req.body.companyName;
          getUserByCompany(company, (err, results) => {
               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               if (!results) {
                    next();
               } else {
                    return res.status(500).json({
                         status: "error",
                         message: "Given Company name already exists...!"
                    });
               }
          });

     },

     checkPostTitle: (req, res, next) => {

          let body = req.body;
          console.log(body);
          // let title = req.body.title;
          let uid = req.authData.result.id;
          // console.log("checkPostTitle " + title);
          checkPostTitle(uid, body, (err, results) => {

               // console.log(results);

               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               if (!results) {
                    next();
               } else {
                    return res.status(500).json({
                         status: "error",
                         message: "Given Post Title already exists...!"
                    });
               }
          });

     }
};