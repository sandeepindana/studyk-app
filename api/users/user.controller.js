const { create, index, show, update, destroy, getUserByEmail, getProductsList, getPlansList, getProductDetails, getPlanDetails, makePayment, getSubjectCategoryList, getSubjectCategoryDetails, getSubjectSubCategoryList, getSubjectSubCategoryDetails, getCountryList, getStatesList, userForgetPassword, userResetPassword, userVerifyAccount, getPostsList, getPostDetails, createPost, updatePost, deletePost, getPostsbyCategory, getPostsbySubCategory, getLatestPosts, checkPostTitle, checkDocumentTitle, createDocument, getDocumentsList, updateDocument, updateDocumentFile, getDocumentDetails, sellerDetails, getSellersList, getLatestBlogs, getUserByMobile, updateTimeslots, getTimeslots, makeRequestSeller, getSellerChatRequestlist, getUserProductsList, getUserProductDetails, getUnitsList, checkProductTitle, createProduct, updateProduct } = require("./user.service");

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
          let mobile = body.mobile;
          let email = body.email;
          getUserByEmail(email, (err, results) => {
               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Error occurred. Try again later"
                    });
               }
               if (!results) {

                    getUserByMobile(mobile, (err, results) => {
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
                                   message: "Mobile number is already in use"
                              });
                         }

                    });


               } else {
                    return res.json({
                         status: "error",
                         message: "Email is already in use"
                    });
               }
          });
     },

     createBuyer: (req, res) => {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
               return res.status(400).json({ errors: errors.array() });
          }

          const body = req.body;
          const salt = genSaltSync(10);
          body.password = hashSync(body.password, salt);
          let mobile = body.mobile;
          let email = body.email;

          getUserByEmail(email, (err, results) => {
               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Error occurred. Try again later"
                    });
               }
               if (!results) {

                    getUserByMobile(mobile, (err, results) => {
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
                                   message: "Mobile number is already in use"
                              });
                         }
                    });
               } else {
                    return res.json({
                         status: "error",
                         message: "Email is already in use"
                    });
               }
          });
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
          let fileUrl = "";

          if (!errors.isEmpty()) {
               return res.status(400).json({ errors: errors.array() });
          }

          const file = req.file;
          if (file) {
               // return res.status(400).send({ status: "error", message: 'Please upload a file.' });
               fileUrl = "/uploads/" + file.filename;

          }

          // console.log(req.body);
          const body = req.body;
          update(id, fileUrl, body, (err, results) => {
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

     getBlogDetails: (req, res) => {
          let body = req.params;
          let postId = body.id;
          // let authData = req.authData;
          // console.log(authData);
          // let uid = authData.result.id;
          // console.log(uid);
          // console.log(postId);
          let uid = 0;

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
          console.log(req.file);
          let body = req.body;
          // console.log(JSON.stringify(body));
          let authData = req.authData;
          let uid = authData.result.id;

          let fileUrl = "";
          checkPostTitle(uid, body, (err, results) => {

               console.log(results);

               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               if (results.length == 0) {
                    const file = req.file;
                    if (!file) {
                         return res.status(400).send({ status: "error", message: 'Please upload a file.' });

                         // upload.single('dataFile');
                         // fileUrl = "/uploads/" + file.filename;
                    }

                    // let fileUrl = "http://localhost:3333/uploads/" + file.filename;
                    fileUrl = "/uploads/" + file.filename;

                    createPost(uid, body, fileUrl, (err, results) => {

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
                              // results
                         });
                    });

                    // return res.status(200).json({
                    //      status: "success",
                    //      message: "success"
                    // });
               } else {
                    return res.status(500).json({
                         status: "error",
                         message: "Given Post Title already exists...!"
                    });
               }
          });

     },

     updatePost: (req, res) => {
          let body = req.body;
          console.log(JSON.stringify(body));
          let authData = req.authData;
          let uid = authData.result.id;
          let postId = body.postId;
          let fileUrl = '';
          checkPostTitle(uid, body, (err, results) => {

               // console.log(results);

               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               if (results.length == 0) {

                    const file = req.file;
                    if (file) {
                         // return res.status(400).send({ status: "error", message: 'Please upload a file.' });
                         fileUrl = "/uploads/" + file.filename;

                    }

                    // let fileUrl = "http://localhost:3333/uploads/" + file.filename;

                    updatePost(uid, fileUrl, postId, body, (err, results) => {

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
               } else {
                    return res.status(500).json({
                         status: "error",
                         message: "Given Post Title already exists...!"
                    });
               }
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
     },

     getPostsbyCategory: (req, res) => {
          console.log(JSON.stringify(req.params));
          let catId = req.params.id;

          getPostsbyCategory(catId, (err, results) => {

               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               return res.status(200).json({
                    status: 'success',
                    message: "Post Available",
                    results: results
               });
          });

     },

     getPostsbySubCategory: (req, res) => {
          console.log(JSON.stringify(req.params));
          let catId = req.params.id;

          getPostsbySubCategory(catId, (err, results) => {

               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               return res.status(200).json({
                    status: 'success',
                    message: "Post Available",
                    results: results
               });
          });

     },

     getLatestPosts: (req, res) => {
          // console.log(JSON.stringify(req.params));
          let count = req.params.count;

          getLatestPosts(count, (err, results) => {

               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               return res.status(200).json({
                    status: 'success',
                    message: "Post Available",
                    results: results
               });
          });
     },

     uploadPost: (req, res) => {

          console.log(JSON.stringify(req.body));
          // let body = req.body;

          const file = req.file;
          if (!file) {
               return res.status(400).send({ message: 'Please upload a file.' });
          }

          let fileUrl = "http://localhost:3333/uploads/" + file.filename;

          return res.send({ message: 'File uploaded successfully.', file, fileUrl });

     },

     createDocument: (req, res) => {
          console.log(req.file);
          let body = req.body;
          console.log(JSON.stringify(body));
          let authData = req.authData;
          let uid = authData.result.id;

          let fileUrl = "";


          checkDocumentTitle(uid, body, (err, results) => {

               console.log(results);

               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               if (results.length == 0) {
                    const file = req.file;
                    if (!file) {
                         return res.status(400).send({ status: "error", message: 'Please upload a file.' });

                         // upload.single('dataFile');
                         // fileUrl = "/uploads/" + file.filename;
                    }

                    // let fileUrl = "http://localhost:3333/uploads/" + file.filename;
                    fileUrl = "/uploads/" + file.filename;

                    createDocument(uid, body, fileUrl, (err, results) => {

                         if (err) {
                              console.log(err);
                              return res.status(500).json({
                                   status: "error",
                                   message: "Database connection error"
                              });
                         }

                         return res.status(200).json({
                              status: 'success',
                              message: "Document Uploaded Successfully",
                              // results
                         });
                    });

                    // return res.status(200).json({
                    //      status: "success",
                    //      message: "success"
                    // });
               } else {
                    return res.status(200).json({
                         status: "error",
                         message: "Given Title already exists...!"
                    });
               }
          });
     },

     getDocumentsList: (req, res) => {
          let body = req.params;
          let authData = req.authData;
          // console.log(authData);
          let uid = authData.result.id;
          // console.log(uid);

          getDocumentsList(uid, (err, results) => {

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

     UpdateDocument: (req, res) => {
          let body = req.body;
          console.log(JSON.stringify(body));
          let authData = req.authData;
          let uid = authData.result.id;

          let fileUrl = "";
          checkDocumentTitle(uid, body, (err, results) => {

               console.log(results);

               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               if (results.length == 0) {
                    const file = req.file;
                    if (req.file) {
                         // return res.status(400).send({ status: "error", message: 'Please upload a file.' });

                         // upload.single('dataFile');
                         fileUrl = "/uploads/" + file.filename;
                    }

                    // let fileUrl = "http://localhost:3333/uploads/" + file.filename;
                    // fileUrl = "/uploads/" + file.filename;

                    updateDocument(uid, fileUrl, body, (err, results) => {

                         if (err) {
                              console.log(err);
                              return res.status(500).json({
                                   status: "error",
                                   message: "Database connection error"
                              });
                         }

                         return res.status(200).json({
                              status: 'success',
                              message: "Document Updated Successfully",
                              // results
                         });
                    });

                    // return res.status(200).json({
                    //      status: "success",
                    //      message: "success"
                    // });
               } else {
                    return res.status(200).json({
                         status: "error",
                         message: "Given Title already exists...!"
                    });
               }
          });
     },

     UpdateDocumentFile: (req, res) => {
          console.log(req.file);
          let body = req.body;
          console.log(JSON.stringify(body));
          let authData = req.authData;
          let uid = authData.result.id;

          let fileUrl = "";

          const file = req.file;
          if (!file) {
               return res.status(400).send({ status: "error", message: 'Please upload a file.' });

               // upload.single('dataFile');
               // fileUrl = "/uploads/" + file.filename;
          }

          // let fileUrl = "http://localhost:3333/uploads/" + file.filename;
          fileUrl = "/uploads/" + file.filename;

          updateDocumentFile(uid, body, fileUrl, (err, results) => {

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
                    // results
               });
          });

     },

     getDocumentDetails: (req, res) => {
          let body = req.params;
          let authData = req.authData;
          // console.log(authData);
          let uid = authData.result.id;
          let docId = body.docId;

          getDocumentDetails(docId, (err, results) => {

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

     getSellerData: (req, res) => {
          const id = req.params.id;
          sellerDetails(id, (err, results) => {
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

     getSellersList: (req, res) => {
          getSellersList((err, results) => {
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

     getLatestblogs: (req, res) => {
          let count = req.params.count;
          let limit = req.params.limit;

          getLatestBlogs(count, limit, (err, results) => {

               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }

               return res.status(200).json({
                    status: 'success',
                    message: "Post Available",
                    results: results
               });
          });

     },

     UpdateTimeslots: (req, res) => {
          let body = req.body;
          let data = body.data;
          console.log(JSON.stringify(body.data));
          let authData = req.authData;
          let uid = authData.result.id;


          updateTimeslots(uid, data, (err, results) => {

               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }

               return res.status(200).json({
                    status: 'success',
                    message: "Document Updated Successfully",
                    // data
                    // results
               });
          });

     },

     getTimeslots: (req, res) => {
          let authData = req.authData;
          let uid = authData.result.id;

          getTimeslots(uid, (err, results) => {

               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }

               return res.status(200).json({
                    status: 'success',
                    message: "Document Updated Successfully",
                    // data
                    results: results
               });
          });
     },

     getSellerTimeSlots: (req, res) => {

          const id = req.params.id;

          getTimeslots(id, (err, results) => {

               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }

               return res.status(200).json({
                    status: 'success',
                    message: "Document Updated Successfully",
                    // data
                    results: results
               });
          });

     },

     makeRequestSeller: (req, res) => {
          const id = req.params.id;
          let authData = req.authData;
          let uid = authData.result.id;

          makeRequestSeller(id, uid, (err, results) => {

               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }

               return res.status(200).json({
                    status: 'success',
                    message: "Request Made Successfully",
                    // data
                    // results: results
               });
          });

     },

     getSellerChatRequestlist: (req, res) => {
          let authData = req.authData;
          let uid = authData.result.id;
          getSellerChatRequestlist(uid, (err, results) => {

               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }

               return res.status(200).json({
                    status: 'success',
                    message: "Document Updated Successfully",
                    // data
                    results: results
               });
          });

     },

     getUserProductsList: (req, res) => {
          let authData = req.authData;
          let uid = authData.result.id;

          getUserProductsList(uid, (err, results) => {

               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }

               return res.status(200).json({
                    status: 'success',
                    message: "Data Available",
                    // data
                    results: results
               });
          });
     },

     createUserProduct: (req, res) => {
          console.log(req.file);
          let body = req.body;
          // console.log(JSON.stringify(body));
          let authData = req.authData;
          let uid = authData.result.id;

          let fileUrl = "";
          checkProductTitle(uid, body, (err, results) => {

               console.log(results);

               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               if (results.length == 0) {
                    const file = req.file;
                    if (!file) {
                         return res.status(400).send({ status: "error", message: 'Please upload a file.' });

                         // upload.single('dataFile');
                         // fileUrl = "/uploads/" + file.filename;
                    }

                    // let fileUrl = "http://localhost:3333/uploads/" + file.filename;
                    fileUrl = "/uploads/" + file.filename;

                    createProduct(uid, body, fileUrl, (err, results) => {

                         if (err) {
                              console.log(err);
                              return res.status(500).json({
                                   status: "error",
                                   message: "Database connection error"
                              });
                         }

                         return res.status(200).json({
                              status: 'success',
                              message: "Product Created Successfully",
                              // results
                         });
                    });

                    // return res.status(200).json({
                    //      status: "success",
                    //      message: "success"
                    // });
               } else {
                    return res.status(500).json({
                         status: "error",
                         message: "Given Product Title already exists...!"
                    });
               }
          });

     },

     updateUserProduct: (req, res) => {
          let body = req.body;
          console.log(JSON.stringify(body));
          let authData = req.authData;
          let uid = authData.result.id;
          let postId = body.proId;
          let fileUrl = '';
          checkProductTitle(uid, body, (err, results) => {

               // console.log(results);

               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }
               if (results.length == 0) {

                    const file = req.file;
                    if (file) {
                         // return res.status(400).send({ status: "error", message: 'Please upload a file.' });
                         fileUrl = "/uploads/" + file.filename;

                    }

                    // let fileUrl = "http://localhost:3333/uploads/" + file.filename;

                    updateProduct(uid, fileUrl, postId, body, (err, results) => {

                         if (err) {
                              console.log(err);
                              return res.status(500).json({
                                   status: "error",
                                   message: "Database connection error"
                              });
                         }
                         return res.status(200).json({
                              status: 'success',
                              message: "Product Updated Successfully",
                         });
                    });
               } else {
                    return res.status(500).json({
                         status: "error",
                         message: "Given Product Title already exists...!"
                    });
               }
          });


     },

     ViewUserProduct: (req, res) => {
          const id = req.params.id;
          let authData = req.authData;
          let uid = authData.result.id;

          getUserProductDetails(id, uid, (err, results) => {

               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }

               return res.status(200).json({
                    status: 'success',
                    message: "Data Available",
                    // data
                    results: results
               });
          });
     },

     getUnitsList: (req, res) => {

          getUnitsList((err, results) => {

               if (err) {
                    console.log(err);
                    return res.status(500).json({
                         status: "error",
                         message: "Database connection error"
                    });
               }

               return res.status(200).json({
                    status: 'success',
                    message: "Data Available",
                    // data
                    results: results
               });
          });
     },

}