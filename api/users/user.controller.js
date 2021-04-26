const { create, index, show, update, destroy, getUserByEmail, getProductsList, getPlansList, getProductDetails, getPlanDetails } = require("./user.service");

// const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const { genSaltSync, hashSync, compareSync } = require("bcryptjs");

const { sign } = require("jsonwebtoken");

const { body, check, validationResult } = require('express-validator');

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

     },
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
     getUserById: (req, res) => {
          // console.log('session ID : ' + JSON.stringify(req.session.user));
          const id = req.params.id;
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
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
               return res.status(400).json({ errors: errors.array() });
          }

          // console.log(req.body);
          const body = req.body;
          update(body, (err, results) => {
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
               return res.status(200).json({
                    status: 'success',
                    message: "Updated Successfully",
               })
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
}