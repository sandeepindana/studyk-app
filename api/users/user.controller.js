const { create, index, show, update, destroy, getUserByEmail, getProductsList, getPlansList, getProductDetails, getPlanDetails, makePayment, getSubjectCategoryList, getSubjectCategoryDetails, getSubjectSubCategoryList, getSubjectSubCategoryDetails, getCountryList, getStatesList, userForgetPassword, userResetPassword, userVerifyAccount, getPostsList, getPostDetails, createPost, updatePost, deletePost } = require("./user.service");

// const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const { genSaltSync, hashSync, compareSync } = require("bcryptjs");

const { sign } = require("jsonwebtoken");

const { body, check, validationResult } = require('express-validator');

const nodemailer = require('nodemailer');

var transport = nodemailer.createTransport({
     // host: "smtp.mailtrap.io",
     // port: 2525,
     // auth: {
     //      user: "31984197b3bea0",
     //      pass: "81ad2a06f4e8d4"
     // }

     host: process.env.MAIL_HOST,
     port: process.env.MAIL_PORT,
     auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD
     }


});

module.exports = {
     createUser: (req, res) => {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
               return res.status(400).json({ errors: errors.array() });
          }

          const body = req.body;
          const salt = genSaltSync(10);
          body.password = hashSync(body.password, salt);

          getUserByEmail(body.email, (err, results) => {
               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Error occurred. Try again later"
                    });
               }
               if (!results) {
                    create(body, (err, results) => {
                         if (err) {
                              console.log(err);
                              return res.status(500).json({
                                   status: "error",
                                   message: "Database connection error"
                              });
                         }
                         return res.status(200).json({
                              status: 'success',
                              message: "Inserted Successfully",
                              data: results.insertId
                         })
                    });
               } else {
                    return res.json({
                         status: "error",
                         message: "Email is already in use"
                    });
               }
          });
          // return res.json({
          //      status: "success",
          //      message: "testing........."
          // });
     },

     //   Get Users

     getUsers: (req, res) => {
          index((err, results) => {
               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               return res.status(200).json({
                    status: 'success',
                    message: "Data available",
                    data: results
               })
          });
     },

     //   Get User By Id

     getUserById: (req, res) => {
          // console.log('session ID : ' + JSON.stringify(req.session.user));
          // console.log("Auth Data");
          // console.log(req.authData);
          const authData = req.authData.result;
          // console.log(authData.id);
          // const id = req.params.id;
          const id = authData.id;
          show(id, (err, results) => {
               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               return res.status(200).json({
                    status: 'success',
                    message: "Data available",
                    data: results
               })
          });
     },
     updateUser: (req, res) => {
          const authData = req.authData.result;
          const id = authData.id;
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
               return res.status(400).json({ errors: errors.array() });
          }

          // console.log(req.body);
          const body = req.body;
          update(id, body, (err, results) => {
               if (err) {
                    console.log(err);
                    return false;
               }
               if (!results) {
                    // console.log(err);
                    return res.json({
                         status: "error",
                         message: "Updated failed"
                    });
               }
               // return res.status(200).json({
               //      status: 'success',
               //      message: "Updated Successfully",
               // })
               show(id, (err, results) => {
                    if (err) {
                         console.log(err);
                         return res.status(500).json({
                              status: "error",
                              message: "Database connection error"
                         });
                    }

                    return res.status(200).json({
                         status: 'success',
                         message: "Updated Successfully",
                         data: results
                    })
               });
          });
     },
     deleteUser: (req, res) => {
          const id = req.body.id;
          destroy(id, (err, results) => {
               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               return res.status(200).json({
                    status: 'success',
                    message: "Deleted Successfully",
               })
          });
     },
     loginUser: (req, res) => {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
               return res.status(400).json({ errors: errors.array() });
          }
          const body = req.body;
          getUserByEmail(body.email, (err, results) => {
               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               if (!results) {

                    return res.json({
                         status: "error",
                         message: "Invalid email or password"
                    });
               }

               // console.log(results);

               const result = compareSync(body.password, results.password);
               if (result) {
                    results.password = undefined;
                    const jsontoken = sign({ result: results }, "qwe1234", {
                         expiresIn: "1h"
                    });

                    // console.log(decoded.result);
                    // req.session.user = decoded.results;
                    // {
                    //      id: 1,
                    //      name: 'bunny',
                    //      last_name: 'smith',
                    //      email: 'bunny@dummy.com',
                    //      mobile: '0',
                    //      address: 'main street',
                    //      country: 0,
                    //      state: 0,
                    //      city: 'san francisco',
                    //      user_status: 1,
                    //      email_verified: 0,
                    //      created_at: '2021-04-12T10:57:41.000Z',
                    //      updated_at: '2021-04-12T10:57:41.000Z',
                    //      user_type: 1
                    //    }

                    return res.status(200).json({
                         status: 'success',
                         message: "Login Successfully",
                         token: jsontoken,
                         user: results
                    });
               } else {
                    return res.json({
                         status: "error",
                         message: "Invalid email or password"
                    });
               }
          });
     },
     getProductsList: (req, res) => {
          getProductsList((err, results) => {
               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               return res.status(200).json({
                    status: 'success',
                    message: "Data available",
                    data: results
               })
          });
     },
     getProductDetails: (req, res) => {
          const proId = req.params.proId;
          getProductDetails(proId, (err, results) => {
               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               return res.status(200).json({
                    status: 'success',
                    message: "Data available",
                    data: results
               })
          });
     },
     getPlansList: (req, res) => {
          const proId = req.params.proId;
          getPlansList(proId, (err, results) => {
               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               return res.status(200).json({
                    status: 'success',
                    message: "Data available",
                    data: results
               })
          });
     },
     getPlanDetails: (req, res) => {

          // return res.json(req.params);

          const planId = req.params.planId;
          getPlanDetails(planId, (err, results) => {
               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               return res.status(200).json({
                    status: 'success',
                    message: "Data available",
                    data: results
               })
          });
     },
     makePayment: (req, res) => {
          //await
          // const token = 

          // 

          const body = req.body;

          makePayment(body, (err, results) => {

               // return res.json(results);
               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Error. Try again later..."
                    });
               }
               return res.status(200).json({
                    status: 'success',
                    message: "Payment Successfully",
               })
          });


          // return res.json(req.body);
     },
     getSubjectCategoryList: (req, res) => {
          const authData = req.authData.result;
          // console.log(authData.id);
          // const id = req.params.id;
          const id = authData.id;
          getSubjectCategoryList(id, (err, results) => {
               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               return res.status(200).json({
                    status: 'success',
                    message: "Data available",
                    data: results
               })
          });
     },
     getSubjectCategoryDetails: (req, res) => {
          let catId = req.params.catId;
          getSubjectCategoryDetails(catId, (err, results) => {
               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               return res.status(200).json({
                    status: 'success',
                    message: "Data available",
                    data: results
               })
          });
     },
     getSubjectSubCategoryList: (req, res) => {
          let catId = req.params.catId;
          getSubjectSubCategoryList(catId, (err, results) => {
               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               return res.status(200).json({
                    status: 'success',
                    message: "Data available",
                    data: results
               })
          });
     },
     getSubjectSubCategoryDetails: (req, res) => {
          let catId = req.params.catId;
          getSubjectSubCategoryDetails(catId, (err, results) => {
               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               return res.status(200).json({
                    status: 'success',
                    message: "Data available",
                    data: results
               })
          });
     },
     getCountryList: (req, res) => {
          // let catId = req.params.id;
          getCountryList('', (err, results) => {
               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               return res.status(200).json({
                    status: 'success',
                    message: "Data available",
                    data: results
               })
          });
     },
     getStatesList: (req, res) => {
          let catId = req.params.id;
          getStatesList(catId, (err, results) => {
               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               return res.status(200).json({
                    status: 'success',
                    message: "Data available",
                    data: results
               })
          });
     },
     sendMail: (req, res) => {
          let body = req.body;
          let subject = body.subject;
          let message = "<h1>This is Node Mailer</h1><div>" + body.message + "</div>";

          var mailOptions = {
               from: process.env.MAIL_FROM_ADDRESS,
               to: 'admin@studyk.com',
               subject: subject,
               html: message
          };

          transport.sendMail(mailOptions, function (error, info) {
               if (error) {
                    console.log(error);
                    res.status(400).json(
                         {
                              status: "error",
                              message: error,
                         }
                    );
               } else {
                    console.log('Email sent: ' + info.response);
                    res.status(200).json(
                         {
                              status: "success",
                              message: info.response,
                         }
                    );
               }
          });
     },
     forgetPassword: (req, res) => {
          let body = req.body;
          getUserByEmail(body.email, (err, results) => {
               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               if (!results) {

                    return res.json({
                         status: "error",
                         message: "Invalid email"
                    });
               }

               // console.log(results);

               if (results) {
                    userForgetPassword(body.email, (err, results) => {
                         if (err) {
                              console.log(err);
                              return res.status(500).json({
                                   status: "error",
                                   message: "Error. Try again later..."
                              });
                         }
                         return res.status(200).json({
                              status: 'success',
                              message: "Mail Sent Successfully",
                         })
                    });
               } else {
                    return res.json({
                         status: "error",
                         message: "Invalid email"
                    });
               }
          });
     },
     resetPassword: (req, res) => {
          let body = req.body;

          getUserByEmail(body.email, (err, results) => {
               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               if (!results) {

                    return res.json({
                         status: "error",
                         message: "Invalid email"
                    });
               }

               // console.log(results);

               if (results) {
                    const salt = genSaltSync(10);
                    body.userpwd = hashSync(body.userpwd, salt);

                    userResetPassword(body, (err, results) => {
                         if (err) {
                              console.log(err);
                              return res.status(500).json({
                                   status: "error",
                                   message: "Error. Try again later..."
                              });
                         }
                         return res.status(200).json({
                              status: 'success',
                              message: "Password Reset Successfully",
                         })
                    });
               } else {
                    return res.json({
                         status: "error",
                         message: "Invalid email"
                    });
               }
          });
     },
     verifyAccount: (req, res) => {
          let body = req.body;
          let uid = body.uid;
          console.log(body);
          userVerifyAccount(uid, (err, results) => {
               // if (err) {
               //      return res.status(500).json({
               //           status: "error",
               //           message: "Error. Try again later..."
               //      });
               // }
               // if (!results) {
               //      // console.log(err);
               //      return res.json({
               //           status: "error",
               //           message: "Failed. Try again later..."
               //      });
               // }
               // return res.redirect("http://localhost:3000/login");
               res.writeHead(301, { Location: 'http://localhost:3000/login' });
               res.end();
          });

     },

     getPostsList: (req, res) => {
          let body = req.params;
          let authData = req.authData;
          console.log(authData);
          let uid = authData.result.id;
          console.log(uid);

          getPostsList(uid, (err, results) => {

               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               return res.status(200).json({
                    status: 'success',
                    message: "Data available",
                    data: results
               });
          });
     },

     getPostDetails: (req, res) => {
          let body = req.params;
          let postId = body.id;
          let authData = req.authData;
          // console.log(authData);
          let uid = authData.result.id;
          // console.log(uid);
          // console.log(postId);

          getPostDetails(uid, postId, (err, results) => {

               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               return res.status(200).json({
                    status: 'success',
                    message: "Data available",
                    results
               });
          });
     },

     createPost: (req, res) => {
          let body = req.body;
          console.log(JSON.stringify(body));
          let authData = req.authData;
          let uid = authData.result.id;

          createPost(uid, body, (err, results) => {

               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               return res.status(200).json({
                    status: 'success',
                    message: "Post Created Successfully",
                    results
               });
          });
     },

     updatePost: (req, res) => {
          let body = req.body;
          console.log(JSON.stringify(body));
          let authData = req.authData;
          let uid = authData.result.id;
          let postId = body.postId;

          updatePost(uid, postId, body, (err, results) => {

               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               return res.status(200).json({
                    status: 'success',
                    message: "Post Updated Successfully",
               });
          });

     },

     deletePost: (req, res) => {
          // console.log(JSON.stringify(req.params));
          // return res.status(200).json({
          //      status: 'success',
          //      message: "Post Deleted Successfully",
          // });
          let authData = req.authData;
          let uid = authData.result.id;
          let postId = req.params.id;


          deletePost(uid, postId, (err, results) => {

               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               return res.status(200).json({
                    status: 'success',
                    message: "Post Deleted Successfully",
               });
          });
     }
}