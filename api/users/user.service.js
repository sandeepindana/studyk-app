const pool = require("../../config/database");

var stripe_secret_key = process.env.STRIPE_SECRET_KEY;
var stripe_published_key = process.env.STRIPE_PUBLISHED_KEY;

const stripe = require('stripe')(stripe_secret_key);

module.exports = {
     create: (data, callBack) => {
          var userFirstName = data.name;
          pool.query(
               "INSERT INTO `tbl_users`(`name`, `email`, `password`, `user_type`) VALUES (?,?,?,?)", [
               data.name,
               data.email,
               data.password,
               data.userType,
          ], (error, results, fields) => {
               if (error) {
                    return callBack(error);
               }

               if (results.insertId > 0) {
                    let uId = results.insertId;
                    // createTables(uId);


                    let tableName = "tbl_" + uId + "_user_profile";

                    let table_sql = "CREATE TABLE `" + tableName + "` (";
                    table_sql += "`up_id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,";
                    table_sql += "`uid` int(11) NOT NULL DEFAULT 0,";
                    table_sql += "`first_name` varchar(100) DEFAULT NULL,";
                    table_sql += "`last_name` varchar(100) DEFAULT NULL,";
                    table_sql += "`user_image` text DEFAULT NULL,";
                    table_sql += "`address` text DEFAULT NULL,";
                    table_sql += "`country` int(11) NOT NULL DEFAULT 0,";
                    table_sql += "`state` int(11) NOT NULL DEFAULT 0,";
                    table_sql += "`city` varchar(100) DEFAULT NULL,";
                    table_sql += "`zip` varchar(100) DEFAULT NULL,";
                    table_sql += "`created_at` timestamp NOT NULL DEFAULT current_timestamp(),";
                    table_sql += "`updated_at` timestamp NOT NULL DEFAULT current_timestamp()";
                    table_sql += ")";

                    pool.query(
                         table_sql, [], (error, results, fields) => {
                              if (error) {
                                   return callBack(error);
                              }
                              let insTable = "INSERT INTO `" + tableName + "`";
                              insTable += "(`uid`, `first_name`, `last_name`, `user_image`, `address`, `country`, `state`, `city`, `zip`, `created_at`, `updated_at`) VALUES";
                              insTable += "(" + uId + ", '" + userFirstName + "', NULL, NULL, NULL, '0', '0', NULL, NULL, current_timestamp(), current_timestamp());";
                              pool.query(insTable, [], (error, results, fields) => {
                                   if (error) {
                                        return callBack(error);
                                   }
                              });
                         }
                    )
               }
               return callBack(null, results);
          });
     },
     index: (callBack) => {
          pool.query("SELECT * FROM `tbl_users` WHERE `user_status`=1", [], (error, results, fields) => {
               if (error) {
                    return callBack(error);
               }
               return callBack(null, results);
          });
     },
     show: (id, callBack) => {
          pool.query("SELECT * FROM `tbl_users` WHERE `id`=?", [id], (error, results, fields) => {
               if (error) {
                    callBack(error);
               }
               return callBack(null, results[0]);
          });
     },
     update: (data, callBack) => {
          pool.query(
               "UPDATE `tbl_users` SET `name`=?,`last_name`=?,`mobile`=?,`address`=?,`city`=? WHERE `id`=?",
               [
                    data.name,
                    data.last_name,
                    data.mobile,
                    data.address,
                    data.city,
                    data.id
               ], (error, results, fields) => {
                    if (error) {
                         callBack(error);
                    }
                    return callBack(null, results);
               });
     },
     destroy: (id, callBack) => {
          pool.query("DELETE FROM `tbl_users` WHERE `id`=?", [id], (error, results, fields) => {
               if (error) {
                    return callBack(error);
               }
               return callBack(null, results);
          });
     },
     getUserByEmail: (email, callBack) => {
          pool.query(
               "SELECT * FROM `tbl_users` WHERE `email`=?", [email], (error, results, fields) => {
                    if (error) {
                         return callBack(error);
                    }
                    // console.log(results);
                    return callBack(null, results[0]);
               });
     },
     getProductsList: (callBack) => {
          let sql = "SELECT * FROM `tbl_products`";
          pool.query(
               sql, [], (error, results, fields) => {
                    if (error) {
                         callBack(error);
                    }
                    return callBack(null, results);
               }
          )
     },
     getProductDetails: (proId, callBack) => {
          let sql = "SELECT * FROM `tbl_products` WHERE `stripe_pro_id`= ?";
          pool.query(
               sql, [proId], (error, results, fields) => {
                    if (error) {
                         callBack(error);
                    }
                    return callBack(null, results[0]);
               }
          )
     },
     getPlansList: (proId, callBack) => {
          let sql = "SELECT * FROM `tbl_plans` WHERE `stripe_pro_id`= ?";
          pool.query(
               sql, [proId], (error, results, fields) => {
                    if (error) {
                         callBack(error);
                    }
                    return callBack(null, results);
               }
          )
     },
     getPlanDetails: (proId, callBack) => {
          console.log('Services getPlanDetails');
          let sql = "SELECT * FROM `tbl_plans` WHERE `stripe_plan_id`= ?";
          pool.query(
               sql, [proId], (error, results, fields) => {
                    if (error) {
                         callBack(error);
                    }
                    return callBack(null, results[0]);
               }
          )
     },

     makePayment: (body, callBack) => {

          stripe.tokens.create({
               // card: {
               //      number: '4242424242424242',
               //      exp_month: 4,
               //      exp_year: 2022,
               //      cvc: '314',
               // },

               card: {
                    number: body.number,
                    exp_month: body.exp_month,
                    exp_year: body.exp_year,
                    cvc: body.cvc,
               }

          }).then(function (value) {
               console.log(value);
               // return

               // return callBack(null, value);


               token = value.id;
               return stripe.customers.create({
                    source: token,
                    email: body.email
               }).then(customer => {
                    stripe.subscriptions.create({
                         customer: customer.id,
                         items: [
                              {
                                   plan: body.planId
                              }
                         ]
                    });
               }).then(() => {
                    //product: product, plan: plan, success: true
                    // res.render('login', { message: 'Paid Successfully......' });

                    var today = new Date();

                    var pay_date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

                    let sql = "INSERT INTO `tbl_payments`(`uid`, `stripe_pro_id`, `stripe_plan_id`, `pay_date`, `pay_status`) VALUES (?,?,?,?,?)";

                    pool.query(
                         sql, [
                         body.uid,
                         body.proId,
                         body.planId,
                         pay_date,
                         1,
                    ], (error, results, fields) => {
                         if (error) {
                              return callBack(error);
                         }
                         return callBack(null, results);
                    });

               }).catch(err => {
                    // res.render("login", { message: 'Payment Failed. Try again later ....' });
                    return callBack(err);

               });


          });
     },
     getSubjectCategoryList: (id, callBack) => {
          let sql = "SELECT `cat_id`,`category` FROM `tbl_subject_categories`";
          pool.query(sql, [], (error, results, fields) => {
               if (error) {
                    callBack(error);
               }
               return callBack(null, results);
          });
     },
     getSubjectCategoryDetails: (catId, callBack) => {
          // console.log('Services getPlanDetails');
          let sql = "SELECT `cat_id`,`category` FROM `tbl_subject_categories` WHERE `cat_id`= ?";
          pool.query(
               sql, [catId], (error, results, fields) => {
                    if (error) {
                         callBack(error);
                    }
                    return callBack(null, results[0]);
               }
          )
     },
     getSubjectSubCategoryList: (catId, callBack) => {
          let sql = "SELECT `subcat_id`,`category` FROM `tbl_subject_sub_categories` WHERE `cat_id`=?";
          pool.query(sql, [catId], (error, results, fields) => {
               if (error) {
                    callBack(error);
               }
               return callBack(null, results);
          });
     },
     getSubjectSubCategoryDetails: (catId, callBack) => {
          // console.log('Services getPlanDetails');
          let sql = "SELECT `subcat_id`,`category`,`cat_id` FROM `tbl_subject_sub_categories` WHERE `subcat_id`=?";
          pool.query(
               sql, [catId], (error, results, fields) => {
                    if (error) {
                         callBack(error);
                    }
                    return callBack(null, results[0]);
               }
          )
     },


};