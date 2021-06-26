const pool = require("../../config/database");

var stripe_secret_key = process.env.STRIPE_SECRET_KEY;
var stripe_published_key = process.env.STRIPE_PUBLISHED_KEY;

const stripe = require('stripe')(stripe_secret_key);

const nodemailer = require('nodemailer');

const userFunctions = require("./user.functions");

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
     create: (data, callBack) => {
          var userFirstName = data.name;
          var company = data.companyName;
          pool.query(
               "INSERT INTO `tbl_users`(`name`, `email`, `password`, `user_type`, `company`) VALUES (?,?,?,?,?)", [
               data.name,
               data.email,
               data.password,
               data.userType,
               data.companyName,
          ], (error, results, fields) => {
               if (error) {
                    return callBack(error);
               }

               if (results.insertId > 0) {
                    let uId = results.insertId;
                    // createTables(uId);


                    let tableName = "tbl_" + uId + "_user_profile";
                    let tableCompany = "tbl_" + uId + "_company";
                    let tablePosts = "tbl_" + uId + "_posts";
                    let tablePostTags = "tbl_" + uId + "_post_tags";

                    let tablePostCat = "tbl_" + uId + "_post_category";
                    let tablePostSubCat = "tbl_" + uId + "_post_sub_category";

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

                    let table_cmp_sql = "CREATE TABLE `" + tableCompany + "` (";
                    table_cmp_sql += "`cmp_id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,";
                    table_cmp_sql += "`uid` int(11) NOT NULL DEFAULT 0,";
                    table_cmp_sql += "`cmp_name` varchar(100) DEFAULT NULL,";
                    table_cmp_sql += "`cmp_image` text DEFAULT NULL,";
                    table_cmp_sql += "`cmp_address` text DEFAULT NULL,";
                    table_cmp_sql += "`cmp_country` int(11) NOT NULL DEFAULT 0,";
                    table_cmp_sql += "`cmp_state` int(11) NOT NULL DEFAULT 0,";
                    table_cmp_sql += "`cmp_city` varchar(100) DEFAULT NULL,";
                    table_cmp_sql += "`cmp_zip` varchar(100) DEFAULT NULL,";
                    table_cmp_sql += "`created_at` timestamp NOT NULL DEFAULT current_timestamp(),";
                    table_cmp_sql += "`updated_at` timestamp NOT NULL DEFAULT current_timestamp()";
                    table_cmp_sql += ")";

                    let table_post_sql = "CREATE TABLE `" + tablePosts + "` (";
                    table_post_sql += "`post_id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,";
                    table_post_sql += "`uid` int(11) NOT NULL DEFAULT 0,";
                    table_post_sql += "`post_title` varchar(100) DEFAULT NULL,";
                    table_post_sql += "`post_article` TEXT DEFAULT NULL,";
                    table_post_sql += "`post_image` text DEFAULT NULL,";
                    table_post_sql += "`post_slug` text DEFAULT NULL,";
                    table_post_sql += "`created_at` timestamp NOT NULL DEFAULT current_timestamp(),";
                    table_post_sql += "`updated_at` timestamp NOT NULL DEFAULT current_timestamp()";
                    table_post_sql += ")";

                    let table_post_tag_sql = "CREATE TABLE `" + tablePostTags + "` (";
                    table_post_tag_sql += "`post_id` int(11) NOT NULL,";
                    table_post_tag_sql += "`tag` TEXT NOT NULL";
                    table_post_tag_sql += ")";

                    let table_post_cat_sql = "CREATE TABLE `" + tablePostCat + "` (";
                    table_post_cat_sql += "`post_id` int(11) NOT NULL,";
                    table_post_cat_sql += "`cat_id` int(11) NOT NULL";
                    table_post_cat_sql += ")";

                    let table_post_subcat_sql = "CREATE TABLE `" + tablePostSubCat + "` (";
                    table_post_subcat_sql += "`post_id` int(11) NOT NULL,";
                    table_post_subcat_sql += "`subcat_id` int(11) NOT NULL";
                    table_post_subcat_sql += ")";

                    pool.query(
                         table_cmp_sql, [], (error, results, fields) => {
                              if (error) {
                                   return callBack(error);
                              }
                              //

                              let insCmpTable = "INSERT INTO `" + tableCompany + "`";
                              insCmpTable += "(`uid`, `cmp_name`, `cmp_image`, `cmp_address`, `cmp_country`, `cmp_state`, `cmp_city`, `cmp_zip`, `created_at`, `updated_at`) VALUES";
                              insCmpTable += "(" + uId + ", '" + company + "', NULL, NULL, 0, '0', 'NULL', NULL, current_timestamp(), current_timestamp());";

                              pool.query(
                                   insCmpTable, [], (error, results, fields) => {
                                        if (error) {
                                             return callBack(error);
                                        }
                                   });
                         });

                    pool.query(
                         table_post_sql, [], (error, results, fields) => {
                              if (error) {
                                   return callBack(error);
                              }

                              pool.query(
                                   table_post_tag_sql, [], (error, results, fields) => {
                                        if (error) {
                                             return callBack(error);
                                        }
                                   });

                              pool.query(
                                   table_post_cat_sql, [], (error, results, fields) => {
                                        if (error) {
                                             return callBack(error);
                                        }
                                   });

                              pool.query(
                                   table_post_subcat_sql, [], (error, results, fields) => {
                                        if (error) {
                                             return callBack(error);
                                        }
                                   });
                         });

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


                                   let subject = "Registered Successfully";
                                   let message = "<html>";
                                   message += "<head></head>";
                                   message += "<body>";
                                   message += "<style></style>";
                                   message += "<spacer size='16'></spacer>";
                                   message += "<container>";
                                   message += "<row class='header' style='background:#6C6C6C'>";
                                   message += "<columns>";
                                   message += "<spacer size='16'></spacer>";
                                   message += "</columns>";
                                   message += "</row>";
                                   message += "<row>";
                                   message += "<columns>";
                                   message += "<spacer size='16'></spacer>";
                                   message += "<h1 class='text-center' style='color:#01252F; font - family: Lato, sans - serif; font - size: 30pt; text - align: center'>Forgot Your Password?</h1>";
                                   message += "<spacer size='16'></spacer>";
                                   message += "<p class='textcenter' style='font-family: Lato, sans-serif; text-align: center'>It happens. Click the link below to verify account.</p>";

                                   message += "<form action='http://localhost:3333/verifyaccount' method='POST' id='verify-form' target='_blank'>";
                                   message += "<input type='hidden' id='uid' name='uid' value='" + uId + "'>";
                                   message += "<input type='submit' value='Verify Account'/>";
                                   message += "</form>";

                                   message += "<p style='font-family: Lato, sans - serif'></p>";
                                   message += "</columns>";
                                   message += "</row>";
                                   message += "<table class='headerbody' style='margin: 10px 0 100px 0'>";
                                   message += "<tbody>";
                                   message += "<tr>";
                                   message += "<td style='box-sizing: border-box; font-family: Arial, \'Helvetica Neue\', Helvetica, sans-serif; word-break: break-word'>";
                                   message += "</td>";
                                   message += "</tr>";
                                   message += "</tbody>";
                                   message += "</table>";
                                   message += "<spacer size='16'></spacer>";
                                   message += "</container>";
                                   message += "</body>";
                                   message += "</html>";


                                   var mailOptions = {
                                        from: process.env.MAIL_FROM_ADDRESS,
                                        to: data.email,
                                        subject: subject,
                                        html: message
                                   };

                                   transport.sendMail(mailOptions, function (error, info) {
                                        if (error) {
                                             console.log(error);
                                        } else {
                                             console.log('Email sent: ' + info.response);
                                        }
                                   });



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
     update: (id, data, callBack) => {

          // console.log(JSON.stringify(data));
          pool.query(
               "UPDATE `tbl_users` SET `name`=?,`last_name`=?,`mobile`=?,`address`=?,`city`=?,`country`=?,`state`=? WHERE `id`=?",
               [
                    data.name,
                    data.last_name,
                    data.mobile,
                    data.address,
                    data.city,
                    data.country,
                    data.state,
                    id
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
     getUserByCompany: (company, callBack) => {
          let comp = company.toLowerCase();
          pool.query(
               "SELECT * FROM `tbl_users` WHERE LOWER(`company`)=?", [comp], (error, results, fields) => {
                    if (error) {
                         return callBack(error);
                    }
                    // console.log(results);
                    return callBack(null, results[0]);
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
                         return callBack(error);
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
     getCountryList: (catId, callBack) => {
          // console.log('Services getPlanDetails');
          let sql = "SELECT `id`,`name` FROM `tbl_countries`";
          pool.query(
               sql, [], (error, results, fields) => {
                    if (error) {
                         callBack(error);
                    }
                    return callBack(null, results);
               }
          )
     },

     getStatesList: (catId, callBack) => {
          // console.log('Services getPlanDetails');
          let sql = "SELECT `id`,`name` FROM `tbl_states` WHERE `country_id`=?";
          pool.query(
               sql, [catId], (error, results, fields) => {
                    if (error) {
                         callBack(error);
                    }
                    return callBack(null, results);
               }
          )
     },

     userForgetPassword: (email, callBack) => {

          let subject = "Forget Password";
          let message = "<html>";
          message += "<head></head>";
          message += "<body>";
          message += "<style></style>";
          message += "<spacer size='16'></spacer>";
          message += "<container>";
          message += "<row class='header' style='background:#6C6C6C'>";
          message += "<columns>";
          message += "<spacer size='16'></spacer>";
          message += "</columns>";
          message += "</row>";
          message += "<row>";
          message += "<columns>";
          message += "<spacer size='16'></spacer>";
          message += "<h1 class='text-center' style='color:#01252F; font - family: Lato, sans - serif; font - size: 30pt; text - align: center'>Forgot Your Password?</h1>";
          message += "<spacer size='16'></spacer>";
          message += "<p class='textcenter' style='font-family: Lato, sans-serif; text-align: center'>It happens. Click the link below to reset your password.</p>";
          message += "<a class='large expand' href='http://localhost:3000/resetpassword' style='font - family: Lato, sans - serif; height: 50px; left: 50 %; margin: 20px - 100px; position: relative; top: 50 %; width: 200px'>RESET PASSWORD</a>";
          message += "<p style='font-family: Lato, sans - serif'></p>";
          message += "</columns>";
          message += "</row>";
          message += "<table class='headerbody' style='margin: 10px 0 100px 0'>";
          message += "<tbody>";
          message += "<tr>";
          message += "<td style='box-sizing: border-box; font-family: Arial, \'Helvetica Neue\', Helvetica, sans-serif; word-break: break-word'>";
          message += "</td>";
          message += "</tr>";
          message += "</tbody>";
          message += "</table>";
          message += "<spacer size='16'></spacer>";
          message += "</container>";
          message += "</body>";
          message += "</html>";


          var mailOptions = {
               from: process.env.MAIL_FROM_ADDRESS,
               to: email,
               subject: subject,
               html: message
          };

          transport.sendMail(mailOptions, function (error, info) {
               if (error) {
                    console.log(error);
                    callBack(error);
               } else {
                    console.log('Email sent: ' + info.response);
                    return callBack(null, info.response);
               }
          });

     },

     userResetPassword: (data, callBack) => {
          console.log(data);
          pool.query(
               "UPDATE `tbl_users` SET `password`=? WHERE `email`=?",
               [
                    data.userpwd,
                    data.email,
               ], (error, results, fields) => {
                    if (error) {
                         callBack(error);
                    }
                    return callBack(null, results);
               });
     },

     userVerifyAccount: (uid, callBack) => {
          console.log("userVerifyAccount " + uid);
          pool.query(
               "UPDATE `tbl_users` SET `email_verified`=1 WHERE `id`=?",
               [
                    uid,
               ], (error, results, fields) => {
                    if (error) {
                         callBack(error);
                    }
                    return callBack(null, results);
               });
     },

     getPostsList: (uid, callBack) => {
          let tableName = "tbl_" + uid + "_posts";
          let sql = "SELECT `post_id`, `uid`, `post_title`, `post_article`, `post_image`, `post_slug`, DATE_FORMAT(`created_at`, '%d-%m-%Y') as created_at FROM `" + tableName + "`  WHERE `post_active`=? order by `post_id` desc";
          console.log(sql);
          pool.query(sql, [1], (error, results, fields) => {
               if (error) {
                    callBack(error);
               }
               return callBack(null, results);
          });
     },

     getPostDetails: (uid, postId, callBack) => {
          let data = "";
          let tableName = "tbl_" + uid + "_posts";
          let sql = "SELECT `post_id`, `uid`, `post_title`, `post_article`, `post_image`, `post_slug`, DATE_FORMAT(`created_at`, '%M %D %Y') as created_at FROM `" + tableName + "` WHERE `post_id`=?";
          // console.log(sql);
          pool.query(sql, [postId], (error, results, fields) => {
               if (error) {
                    callBack(error);
               }
               // data.push(results[0]);

               let details = results[0];

               let tabletagsName = "tbl_" + uid + "_post_tags";     //tbl_37_post_tags 

               let tagssql = "SELECT * FROM `" + tabletagsName + "` WHERE `post_id`=?";
               pool.query(tagssql, [postId], (error, results, fields) => {
                    if (error) {
                         callBack(error);
                    }
                    // data.push(results);

                    let tags = results;

                    //   Post Category
                    let tablePostCat = "tbl_" + uid + "_post_category";
                    let tablePostCatSql = "SELECT * FROM `" + tablePostCat + "` WHERE `post_id`=?";
                    let category;
                    pool.query(tablePostCatSql, [postId], (error, results, fields) => {
                         if (error) {
                              callBack(error);
                         }

                         category = results[0];

                         //   Subcategory
                         let tablePostSubCat = "tbl_" + uid + "_post_sub_category";
                         let tablePostSubCatSql = "SELECT * FROM `" + tablePostSubCat + "` WHERE `post_id`=?";
                         let subcategory = "";
                         pool.query(tablePostSubCatSql, [postId], (error, results, fields) => {
                              if (error) {
                                   callBack(error);
                              }
                              // console.log("tagstring : " + JSON.stringify(results[0]))
                              subcategory = results[0];

                              //   Tags

                              let tagsStringSql = "SELECT GROUP_CONCAT(`tag` SEPARATOR ',') tags FROM `" + tabletagsName + "` WHERE `post_id`=?";
                              let tagstring = "";
                              pool.query(tagsStringSql, [postId], (error, results, fields) => {
                                   if (error) {
                                        callBack(error);
                                   }
                                   // console.log("tagstring : " + JSON.stringify(results[0]))
                                   tagstring = results[0];

                                   data = {
                                        details: details,
                                        tags: tags,
                                        tagstring: tagstring,
                                        category: category,
                                        subcategory: subcategory
                                   };

                                   return callBack(null, data);

                              });
                         });
                    });
               });
          });
     },

     getPostTags: (uid, postId, callBack) => {
          let tabletagsName = "tbl_" + uid + "_post_tags";
          let sql = "SELECT * FROM `" + tabletagsName + "` WHERE `post_id`=?";
          pool.query(sql, [postId], (error, results, fields) => {
               if (error) {
                    return callBack(error);
               }
               return callBack(null, results);
          });
     },

     checkPostTitle: (uid, body, callBack) => {
          let title = body.title;
          let postId = body.postId;
          console.log(title);
          let postTitle = title.toLowerCase().trim();

          let tableName = "tbl_" + uid + "_posts";
          let sql = "";
          let argsPost = [];
          if (!body.postId) {
               sql = "SELECT * FROM `" + tableName + "` where LOWER(`post_title`)=? and `post_active`=?";
               argsPost.push(postTitle);
               argsPost.push(1);
          } else {
               console.log("postTitle " + postTitle);
               sql = "SELECT * FROM `" + tableName + "` where LOWER(`post_title`)=? and `post_id`!=? and `post_active`=?";
               argsPost.push(postTitle);
               argsPost.push(postId);
               argsPost.push(1);
          }

          console.log(argsPost);
          pool.query(sql, argsPost, (error, results, fields) => {
               if (error) {
                    return callBack(error);
               }
               return callBack(null, results[0]);
          });
     },

     createPost: (uid, body, callBack) => {

          let title = body.title;
          let post = body.post;
          let slug = "";
          let catId = body.category;
          let subCatId = body.subcategory;
          let tags = body.tags;
          let postImage = "";

          let postTitle = title.toLowerCase();
          let tableName = "tbl_" + uid + "_posts";
          let sql = "SELECT * FROM `" + tableName + "` where LOWER(`post_title`)=?";
          console.log(sql);
          pool.query(sql, [postTitle], (error, results, fields) => {
               if (error) {
                    return callBack(error);
               }

               let titleSlug = "";
               if (results.length > 0) {
                    titleSlug = "-" + results.length;
               }

               slug = postTitle
                    .toLowerCase()
                    .replace(/[^\w ]+/g, '')
                    .replace(/ +/g, '-') + titleSlug;

               let tableName = "tbl_" + uid + "_posts";
               let sql = "INSERT INTO `" + tableName + "`(`uid`, `post_title`, `post_article`, `post_image`, `post_slug`) VALUES (?,?,?,?,?)";
               console.log(sql);
               pool.query(sql, [uid, title, post, postImage, slug], (error, results, fields) => {
                    if (error) {
                         return callBack(error);
                    }
                    // return callBack(null, results);
                    if (results.insertId > 0) {
                         // console.log("Post Id: " + results.insertId);

                         let postId = results.insertId;

                         let tablePostCat = "tbl_" + uid + "_post_category";
                         let tablePostSubCat = "tbl_" + uid + "_post_sub_category";
                         let tablePostTag = "tbl_" + uid + "_post_tags";

                         let tablePostCatSql = "INSERT INTO `" + tablePostCat + "` (`post_id`, `cat_id`) VALUES (?,?)";
                         let tablePostSubCatSql = "INSERT INTO `" + tablePostSubCat + "` (`post_id`, `subcat_id`) VALUES (?,?)";
                         let tablePostTagSql = "INSERT INTO `" + tablePostTag + "` (`post_id`, `tag`) VALUES ?";
                         pool.query(
                              tablePostCatSql, [postId, catId], (error, results, fields) => {
                                   if (error) {
                                        return callBack(error);
                                   }
                              });

                         pool.query(
                              tablePostSubCatSql, [postId, subCatId], (error, results, fields) => {
                                   if (error) {
                                        return callBack(error);
                                   }
                              });

                         let tagsArr = tags.split(",");
                         let tagsInsArr = [];
                         for (i = 0; i < tagsArr.length; i++) {
                              // let arr = [];
                              // arr.push(postId, tagsArr[i]);
                              tagsInsArr.push([postId, tagsArr[i]]);
                         }

                         console.log(tagsInsArr);

                         pool.query(
                              tablePostTagSql, [tagsInsArr], (error, results, fields) => {
                                   if (error) {
                                        return callBack(error);
                                   }
                              });
                         return callBack(null, results);
                    }
               });
          });
     },

     updatePost: (uid, postId, body, callBack) => {

          // let postId = body.postId;
          let title = body.title;
          let post = body.post;
          let slug = "";
          let catId = body.category;
          let subCatId = body.subcategory;
          let tags = body.tags;
          let postImage = "";
          console.log(title);
          let postTitle = title.toLowerCase().trim();
          let tableName = "tbl_" + uid + "_posts";

          let sql = "SELECT * FROM `" + tableName + "` where LOWER(`post_title`)=?";
          console.log(sql);
          pool.query(sql, [postTitle], (error, results, fields) => {
               if (error) {
                    return callBack(error);
               }

               let titleSlug = "";
               if (results.length > 0) {
                    titleSlug = "-" + results.length;
               }

               slug = postTitle
                    .toLowerCase()
                    .replace(/[^\w ]+/g, '')
                    .replace(/ +/g, '-') + titleSlug;

               let tableName = "tbl_" + uid + "_posts";
               let updatesql = "UPDATE `" + tableName + "` SET `post_title`=?,`post_article`=?,`post_image`=?,`post_slug`=? WHERE `post_id`=?";
               // console.log(sql);
               pool.query(updatesql, [title, post, postImage, slug, postId], (error, results, fields) => {
                    if (error) {
                         return callBack(error);
                    }
                    // return callBack(null, results);
                    // console.log("Post Id: " + results.insertId);

                    // let postId = results.insertId;

                    let tablePostCat = "tbl_" + uid + "_post_category";
                    let tablePostSubCat = "tbl_" + uid + "_post_sub_category";
                    let tablePostTag = "tbl_" + uid + "_post_tags";

                    let tablePostCatDelSql = "DELETE FROM `" + tablePostCat + "` WHERE `post_id`=?";
                    let tablePostSubCatDelSql = "DELETE FROM `" + tablePostSubCat + "` WHERE `post_id`=?";
                    let tablePostTagDelSql = "DELETE FROM `" + tablePostTag + "` WHERE `post_id`=?";

                    let tablePostCatSql = "INSERT INTO `" + tablePostCat + "` (`post_id`, `cat_id`) VALUES (?,?)";
                    let tablePostSubCatSql = "INSERT INTO `" + tablePostSubCat + "` (`post_id`, `subcat_id`) VALUES (?,?)";
                    let tablePostTagSql = "INSERT INTO `" + tablePostTag + "` (`post_id`, `tag`) VALUES ?";

                    pool.query(
                         tablePostCatDelSql, [postId], (error, results, fields) => {
                              if (error) {
                                   return callBack(error);
                              }
                              pool.query(
                                   tablePostCatSql, [postId, catId], (error, results, fields) => {
                                        if (error) {
                                             return callBack(error);
                                        }
                                   });
                         });

                    pool.query(
                         tablePostSubCatDelSql, [postId], (error, results, fields) => {
                              if (error) {
                                   return callBack(error);
                              }

                              pool.query(
                                   tablePostSubCatSql, [postId, subCatId], (error, results, fields) => {
                                        if (error) {
                                             return callBack(error);
                                        }
                                   });
                         });

                    pool.query(
                         tablePostTagDelSql, [postId], (error, results, fields) => {
                              if (error) {
                                   return callBack(error);
                              }

                              let tagsArr = tags.split(",");
                              let tagsInsArr = [];
                              for (i = 0; i < tagsArr.length; i++) {
                                   tagsInsArr.push([postId, tagsArr[i]]);
                              }

                              // console.log(tagsInsArr);

                              pool.query(
                                   tablePostTagSql, [tagsInsArr], (error, results, fields) => {
                                        if (error) {
                                             return callBack(error);
                                        }
                                   });

                              return callBack(null, results);

                         });
               });
          });
     },

     deletePost: (uid, postId, callBack) => {
          let tableName = "tbl_" + uid + "_posts";
          let sql = "UPDATE `" + tableName + "` SET `post_active`=? WHERE `post_id`=?";
          pool.query(sql, [0, postId], (error, results, fields) => {
               if (error) {
                    return callBack(error);
               }
               return callBack(null, results);
          });
     },

};