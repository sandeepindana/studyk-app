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
          var company = (data.companyName ? data.companyName : '');
          var userType = data.userType;
          var mobile = data.mobile;
          pool.query(
               "INSERT INTO `tbl_users`(`name`, `email`, `password`, `user_type`, `company`,`mobile`) VALUES (?,?,?,?,?,?)", [
               data.name,
               data.email,
               data.password,
               userType,
               company,
               mobile,
          ], (error, results, fields) => {
               if (error) {
                    return callBack(error);
               }

               if (results.insertId > 0) {
                    let uId = results.insertId;
                    // createTables(uId);

                    if (userType == 1) {

                         let insCmpTable = "INSERT INTO `tbl_company`";
                         insCmpTable += "(`uid`, `cmp_name`, `cmp_image`, `cmp_address`, `cmp_country`, `cmp_state`, `cmp_city`, `cmp_zip`, `created_at`, `updated_at`) VALUES";
                         insCmpTable += "(" + uId + ", '" + company + "', NULL, NULL, 0, '0', 'NULL', NULL, current_timestamp(), current_timestamp());";

                         pool.query(insCmpTable, [], (error, results, fields) => {
                              if (error) {
                                   return callBack(error);
                              }
                         });
                    }

                    let insTable = "INSERT INTO `tbl_user_profile`";
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
          let sql = "SELECT u.id,u.name,u.`last_name`,u.`email`,u.`mobile`,u.`address`,u.`city`,u.`company`,u.`user_image`,c.name as user_country,s.name as user_state FROM `tbl_users` as u left JOIN tbl_countries as c on u.country=c.id left JOIN tbl_states as s on u.state=s.id  WHERE u.id=?";
          // let $sql = "SELECT * FROM `tbl_users` WHERE `id`=?";
          pool.query(sql, [id], (error, results, fields) => {
               if (error) {
                    callBack(error);
               }
               return callBack(null, results[0]);
          });
     },
     sellerDetails: (id, callBack) => {
          pool.query("SELECT u.id,u.name,u.`last_name`,u.`email`,u.`mobile`,u.`address`,u.`city`,u.`company`,u.`user_image`,c.name as country,s.name as state FROM `tbl_users` as u left JOIN tbl_countries as c on u.country=c.id left JOIN tbl_states as s on u.state=s.id  WHERE u.id=?", [id], (error, results, fields) => {
               if (error) {
                    callBack(error);
               }
               return callBack(null, results[0]);
          });
     },
     getSellersList: (callBack) => {
          pool.query("SELECT u.id,u.name,u.`last_name`,u.`email`,u.`mobile`,u.`address`,u.`city`,u.`company`,u.`user_image`,c.name as country,s.name as state FROM `tbl_users` as u left JOIN tbl_countries as c on u.country=c.id left JOIN tbl_states as s on u.state=s.id  WHERE u.user_type=?", [1], (error, results, fields) => {
               if (error) {
                    callBack(error);
               }
               return callBack(null, results);
          });
     },
     update: (id, fileUrl, data, callBack) => {
          let argsUser = [
               data.name,
               data.last_name,
               data.mobile,
               data.address,
               data.city,
               data.country,
               data.state
          ];

          // ,id


          let upsql = "UPDATE `tbl_users` SET `name`=?,`last_name`=?,`mobile`=?,`address`=?,`city`=?,`country`=?,`state`=?";
          if (fileUrl != '') {
               upsql += " ,`user_image`=?";
               argsUser.push(fileUrl);
          }
          upsql += " WHERE `id`=?";
          argsUser.push(id);
          console.log(JSON.stringify(argsUser));
          console.log(upsql);

          pool.query(upsql, argsUser, (error, results, fields) => {
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
     getUserByMobile: (mobile, callBack) => {
          pool.query(
               "SELECT * FROM `tbl_users` WHERE `mobile`=?", [mobile], (error, results, fields) => {
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
          // let tableName = "tbl_" + uid + "_posts";
          let sql = "SELECT `post_id`, `uid`, `post_title`, `post_article`, `post_image`, `post_slug`, DATE_FORMAT(`created_at`, '%d-%m-%Y') as created_at FROM `tbl_posts`  WHERE `post_active`=? order by `post_id` desc";
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
          // let tableName = "tbl_" + uid + "_posts";
          let sql = "SELECT `post_id`, `uid`, `post_title`, `post_article`, `post_image`, `post_slug`, DATE_FORMAT(`created_at`, '%M %D %Y') as created_at FROM `tbl_posts` WHERE `post_id`=?";   //   " + tableName + "
          // console.log(sql);
          pool.query(sql, [postId], (error, results, fields) => {
               if (error) {
                    callBack(error);
               }
               // data.push(results[0]);

               let details = results[0];

               // let tabletagsName = "tbl_" + uid + "_post_tags";     //tbl_37_post_tags 

               let tagssql = "SELECT * FROM `tbl_post_tags` WHERE `post_id`=?";
               pool.query(tagssql, [postId], (error, results, fields) => {
                    if (error) {
                         callBack(error);
                    }
                    // data.push(results);

                    let tags = results;

                    //   Post Category
                    // let tablePostCat = "tbl_" + uid + "_post_category";
                    let tablePostCatSql = "SELECT * FROM `tbl_post_category` WHERE `post_id`=?";
                    let category;
                    pool.query(tablePostCatSql, [postId], (error, results, fields) => {
                         if (error) {
                              callBack(error);
                         }

                         category = results[0];

                         //   Subcategory
                         // let tablePostSubCat = "tbl_" + uid + "_post_sub_category";
                         let tablePostSubCatSql = "SELECT * FROM `tbl_post_sub_category` WHERE `post_id`=?";
                         let subcategory = "";
                         pool.query(tablePostSubCatSql, [postId], (error, results, fields) => {
                              if (error) {
                                   callBack(error);
                              }
                              // console.log("tagstring : " + JSON.stringify(results[0]))
                              subcategory = results[0];

                              //   Tags

                              let tagsStringSql = "SELECT GROUP_CONCAT(`tag` SEPARATOR ',') tags FROM `tbl_post_tags` WHERE `post_id`=?";
                              let tagstring = "";
                              pool.query(tagsStringSql, [postId], (error, results, fields) => {
                                   if (error) {
                                        callBack(error);
                                   }

                                   // console.log("tagstring : " + JSON.stringify(results))
                                   if (results.length > 0) {
                                        tagstring = results[0];
                                   }

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
          // let tabletagsName = "tbl_" + uid + "_post_tags";
          let sql = "SELECT * FROM `tbl_post_tags` WHERE `post_id`=?";
          pool.query(sql, [postId], (error, results, fields) => {
               if (error) {
                    return callBack(error);
               }
               return callBack(null, results);
          });
     },

     checkPostTitle: (uid, body, callBack) => {
          console.log("body : " + JSON.stringify(body));
          let title = body.title;
          let postId = body.postId;
          console.log(title);
          let postTitle = title.toLowerCase().trim();

          // let tableName = "tbl_" + uid + "_posts";
          let sql = "";
          let argsPost = [];
          if (!body.postId) {
               sql = "SELECT * FROM `tbl_posts` where LOWER(`post_title`)=? and `post_active`=? and `uid`=?";
               argsPost.push(postTitle);
               argsPost.push(1);
               argsPost.push(uid);
          } else {
               // console.log("postTitle " + postTitle);
               sql = "SELECT * FROM `tbl_posts` where LOWER(`post_title`)=? and `post_id`!=? and `post_active`=? and `uid`=?";
               argsPost.push(postTitle);
               argsPost.push(postId);
               argsPost.push(1);
               argsPost.push(uid);
          }
          console.log(sql);
          console.log(argsPost);
          pool.query(sql, argsPost, (error, results, fields) => {
               console.log(error);
               console.log(results);
               if (error) {
                    return callBack(error);
               }
               return callBack(null, results);
          });
     },

     createPost: (uid, body, fileUrl, callBack) => {

          let title = body.title;
          let post = body.post;
          let slug = "";
          let catId = body.category;
          let subCatId = body.subcategory;
          let tags = body.tags;
          let postImage = fileUrl;

          let postTitle = title.toLowerCase();
          // let tableName = "tbl_" + uid + "_posts";
          let sql = "SELECT * FROM `tbl_posts` where LOWER(`post_title`)=?";
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

               // let tableName = "tbl_" + uid + "_posts";
               let sql = "INSERT INTO `tbl_posts`(`uid`, `post_title`, `post_article`, `post_image`, `post_slug`) VALUES (?,?,?,?,?)";
               console.log(sql);
               pool.query(sql, [uid, title, post, postImage, slug], (error, results, fields) => {
                    if (error) {
                         return callBack(error);
                    }
                    // return callBack(null, results);
                    if (results.insertId > 0) {
                         // console.log("Post Id: " + results.insertId);

                         let postId = results.insertId;

                         // let tablePostCat = "tbl_" + uid + "_post_category";
                         // let tablePostSubCat = "tbl_" + uid + "_post_sub_category";
                         // let tablePostTag = "tbl_" + uid + "_post_tags";

                         let tablePostCatSql = "INSERT INTO `tbl_post_category` (`post_id`, `cat_id`) VALUES (?,?)";
                         let tablePostSubCatSql = "INSERT INTO `tbl_post_sub_category` (`post_id`, `subcat_id`) VALUES (?,?)";
                         let tablePostTagSql = "INSERT INTO `tbl_post_tags` (`post_id`, `tag`) VALUES ?";
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

     updatePost: (uid, fileUrl, postId, body, callBack) => {

          // let postId = body.postId;
          let title = body.title;
          let post = body.post;
          let slug = "";
          let catId = body.category;
          let subCatId = body.subcategory;
          let tags = body.tags;
          // let postImage = "";
          console.log(title);
          let postTitle = title.toLowerCase().trim();
          // let tableName = "tbl_" + uid + "_posts";

          let sql = "SELECT * FROM `tbl_posts` where LOWER(`post_title`)=? and `uid` = ? and `post_id` != ?";
          console.log(sql);
          pool.query(sql, [postTitle, uid, postId], (error, results, fields) => {
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

               // let tableName = "tbl_" + uid + "_posts";
               let postArgs = [title, post, slug];
               let updatesql = "UPDATE `tbl_posts` SET `post_title`=?,`post_article`=?,`post_slug`=? ";
               if (fileUrl != '') {
                    updatesql += ", `post_image`=?  ";
                    postArgs.push(fileUrl);
               }
               updatesql += " WHERE `post_id`=?";
               postArgs.push(postId);
               // console.log(sql);
               // [title, post, slug, postId]
               pool.query(updatesql, postArgs, (error, results, fields) => {
                    if (error) {
                         return callBack(error);
                    }
                    // return callBack(null, results);
                    // console.log("Post Id: " + results.insertId);

                    // let postId = results.insertId;

                    // let tablePostCat = "tbl_" + uid + "_post_category";
                    // let tablePostSubCat = "tbl_" + uid + "_post_sub_category";
                    // let tablePostTag = "tbl_" + uid + "_post_tags";

                    if (fileUrl != '') {
                         let updateImgSql = "UPDATE `tbl_posts` SET `post_image`=? WHERE `post_id`=?";

                         pool.query(
                              updateImgSql, [fileUrl, postId], (error, results, fields) => {
                                   if (error) {
                                        return callBack(error);
                                   }
                              });
                    }


                    let tablePostCatDelSql = "DELETE FROM `tbl_post_category` WHERE `post_id`=?";
                    let tablePostSubCatDelSql = "DELETE FROM `tbl_post_sub_category` WHERE `post_id`=?";
                    let tablePostTagDelSql = "DELETE FROM `tbl_post_tags` WHERE `post_id`=?";

                    let tablePostCatSql = "INSERT INTO `tbl_post_category` (`post_id`, `cat_id`) VALUES (?,?)";
                    let tablePostSubCatSql = "INSERT INTO `tbl_post_sub_category` (`post_id`, `subcat_id`) VALUES (?,?)";
                    let tablePostTagSql = "INSERT INTO `tbl_post_tags` (`post_id`, `tag`) VALUES ?";

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
          // let tableName = "tbl_" + uid + "_posts";
          let sql = "UPDATE `tbl_posts` SET `post_active`=? WHERE `post_id`=?";
          pool.query(sql, [0, postId], (error, results, fields) => {
               if (error) {
                    return callBack(error);
               }
               return callBack(null, results);
          });
     },

     getPostsbyCategory: (catId, callBack) => {
          let data = "";
          // p.`post_id`, p.`uid`, p.`post_title`, p.`post_article`, p.`post_image`, p.`post_slug`, p.`post_active`, p.`created_at`, p.`updated_at`
          let sql = "SELECT * FROM `tbl_posts` as p JOIN `tbl_post_category` as pc on pc.post_id = p.post_id WHERE pc.`cat_id` = ? and p.post_active = 1 ORDER by p.`post_id` DESC";
          pool.query(sql, [catId], (error, results, fields) => {
               if (error) {
                    callBack(error);
               }
               let posts = results;
               // return callBack(null, results);

               let catSql = "SELECT * FROM `tbl_subject_categories` WHERE `cat_id` = ?";
               pool.query(catSql, [catId], (error, results, fields) => {
                    if (error) {
                         callBack(error);
                    }
                    let category = results[0];
                    // return callBack(null, results);


                    data = {
                         posts: posts,
                         category: category
                    };

                    return callBack(null, data);
               });
          });
     },

     getPostsbySubCategory: (catId, callBack) => {
          let data = "";
          let sql = "SELECT * FROM `tbl_posts` as p JOIN `tbl_post_sub_category` as pc on pc.post_id = p.post_id WHERE pc.`subcat_id` = ? and p.post_active = 1 ORDER by p.`post_id` DESC";
          pool.query(sql, [catId], (error, results, fields) => {
               if (error) {
                    callBack(error);
               }
               let posts = results;
               // return callBack(null, results);

               let catSql = "SELECT sc.`subcat_id`,sc.`category` as subcategory, c.cat_id ,c.category FROM `tbl_subject_sub_categories` as sc JOIN  tbl_subject_categories as c on sc.cat_id = c.cat_id WHERE sc.`subcat_id`=?";
               pool.query(catSql, [catId], (error, results, fields) => {
                    if (error) {
                         callBack(error);
                    }
                    let category = results[0];
                    // return callBack(null, results);

                    data = {
                         posts: posts,
                         category: category
                    };

                    return callBack(null, data);
               });

          });
     },

     getLatestPosts: (count, callBack) => {
          // let sql = "SELECT `post_id`, `uid`, `post_title`, `post_article`, `post_image`, `post_slug`, DATE_FORMAT(`created_at`, '%M %D %Y') as created_at FROM `tbl_posts` WHERE `post_active`=1 ORDER BY `post_id` desc LIMIT 0,5";

          let sql = "SELECT p.`post_id`, p.`uid`, p.`post_title`, p.`post_article`, p.`post_image`, p.`post_slug`, DATE_FORMAT(p.`created_at`, '%M %D %Y') as created_at, CONCAT(u.name,' ',u.last_name) as author FROM `tbl_posts` as p JOIN `tbl_users` as u on p.uid= u.id WHERE `post_active`=1 ORDER BY `post_id` desc LIMIT 0,8";
          pool.query(sql, [count], (error, results, fields) => {
               if (error) {
                    callBack(error);
               }
               return callBack(null, results);
          });
     },

     getLatestBlogs: (count, limit, callBack) => {

          let sql = "SELECT p.`post_id`, p.`uid`, p.`post_title`, p.`post_article`, p.`post_image`, p.`post_slug`, DATE_FORMAT(p.`created_at`, '%M %D %Y') as created_at, CONCAT(u.name,' ',u.last_name) as author FROM `tbl_posts` as p JOIN `tbl_users` as u on p.uid= u.id WHERE `post_active`=1 ORDER BY `post_id` desc LIMIT " + count + ", " + limit;
          pool.query(sql, [], (error, results, fields) => {
               if (error) {
                    callBack(error);
               }
               return callBack(null, results);
          });
     },

     checkDocumentTitle: (uid, body, callBack) => {
          console.log("body : " + JSON.stringify(body));
          let title = body.title;
          let docId = body.docId;
          console.log(title);
          let postTitle = title.toLowerCase().trim();

          // let tableName = "tbl_" + uid + "_posts";
          let sql = "";
          let argsPost = [];
          if (!body.docId) {
               sql = "SELECT * FROM `tbl_documents` where LOWER(`title`)=? and `active`=? and `uid`=?";
               argsPost.push(postTitle);
               argsPost.push(1);
               argsPost.push(uid);
          } else {
               // console.log("postTitle " + postTitle);
               sql = "SELECT * FROM `tbl_documents` where LOWER(`title`)=? and `doc_id`!=? and `active`=? and `uid`=?";
               argsPost.push(postTitle);
               argsPost.push(docId);
               argsPost.push(1);
               argsPost.push(uid);
          }
          console.log(sql);
          console.log(argsPost);
          pool.query(sql, argsPost, (error, results, fields) => {
               console.log(error);
               console.log(results);
               if (error) {
                    return callBack(error);
               }
               return callBack(null, results);
          });
     },

     createDocument: (uid, body, fileUrl, callBack) => {
          let title = body.title.toLowerCase();
          let postImage = fileUrl;

          // let postTitle = title.toLowerCase();

          let sql = "INSERT INTO `tbl_documents`(`uid`, `title`, `file`) VALUES (?,?,?)";
          console.log(sql);
          pool.query(sql, [uid, title, postImage], (error, results, fields) => {
               if (error) {
                    return callBack(error);
               }
               return callBack(null, results);
          });
     },

     getDocumentsList: (uid, callBack) => {
          let sql = "SELECT `doc_id`, `uid`, `title`, `file`, DATE_FORMAT(`created_at`, '%d-%m-%Y') as created_at FROM `tbl_documents` WHERE `uid`=? and `active`=? order by `doc_id` desc";
          console.log(sql);
          pool.query(sql, [uid, 1], (error, results, fields) => {
               if (error) {
                    callBack(error);
               }
               return callBack(null, results);
          });
     },

     updateDocument: (uid, fileUrl, body, callBack) => {
          let args = [body.title];
          let sql = "UPDATE `tbl_documents` SET `title`=?";
          if (fileUrl != '') {
               sql += "  ,`file`=?";
               args.push(fileUrl);
          }
          sql += "  WHERE `doc_id`=?";
          args.push(body.docId);


          // [body.title, body.docId]
          console.log(sql);
          pool.query(sql, args, (error, results, fields) => {
               if (error) {
                    callBack(error);
               }

               // if (fileUrl != '') {
               //      let fsql = "UPDATE `tbl_documents` SET `file`=? WHERE `doc_id`=?";
               //      console.log(fsql);
               //      pool.query(fsql, [fileUrl, body.docId], (error, results, fields) => {
               //           if (error) {
               //                callBack(error);
               //           }
               //           return callBack(null, results);
               //      });
               // }

               return callBack(null, results);
          });
     },

     updateDocumentFile: (uid, body, fileUrl, callBack) => {
          let sql = "UPDATE `tbl_documents` SET `file`=? WHERE `doc_id`=?";
          console.log(sql);
          pool.query(sql, [fileUrl, body.docId], (error, results, fields) => {
               if (error) {
                    callBack(error);
               }
               return callBack(null, results);
          });
     },

     getDocumentDetails: (docId, callBack) => {
          let sql = "SELECT `doc_id`, `uid`, `title`, `file`, DATE_FORMAT(`created_at`, '%d-%m-%Y') as created_at FROM `tbl_documents` WHERE `doc_id`=?";
          console.log(sql);
          pool.query(sql, [docId], (error, results, fields) => {
               if (error) {
                    callBack(error);
               }
               return callBack(null, results[0]);
          });

     },

     updateTimeslots: (uid, days, callBack) => {

          // let data = JSON.parse(days);
          let data = days;
          let daysCount = data.length;

          console.log('daysCount ', daysCount);

          // console.log("callingggggggggggggggg " + data[0]['day']);

          if (daysCount > 0) {
               let sql = "DELETE FROM `tbl_user_timings` WHERE `uid`=?"; //userId
               pool.query(sql, [uid], (err, results) => {
                    if (err) {
                         return callBack(err);
                    }

                    let tagsArr = [];

                    for (i = 0; i < daysCount; i++) {
                         tagsArr.push([uid, data[i]['day'], data[i]['startTime'], data[i]['endTime']]);
                         console.log(tagsArr);
                    }

                    let timeSql = "INSERT INTO `tbl_user_timings`(`uid`, `day`, `startTime`, `endTime`) VALUES ?";
                    pool.query(timeSql, [tagsArr], (error, results, fields) => {
                         if (error) {
                              return callBack(error);
                         }

                         return callBack(null, results);
                    });
               });
          }
     },

     getTimeslots: (uid, callBack) => {
          let sql = "SELECT `day`, `startTime`, `endTime` FROM `tbl_user_timings` WHERE `uid`=?";
          console.log(sql);
          pool.query(sql, [uid], (error, results, fields) => {
               if (error) {
                    callBack(error);
               }
               return callBack(null, results);
          });
     },

     makeRequestSeller: (id, uid, callBack) => {
          let sql = "INSERT INTO `tbl_chat_request`(`seller_id`, `buyer_id`, `chr_status`) VALUES (?,?,?)";
          pool.query(sql, [id, uid, 0], (error, results) => {
               if (error) {
                    callBack(error);
               }
               return callBack(null, results);
          });
     },

     getSellerChatRequestlist: (uid, callBack) => {

          let sql = "SELECT r.`chr_id`, r.`seller_id`, r.`buyer_id`, r.`chr_status`, DATE_FORMAT(r.`created_at`, '%d-%m-%Y') as created_at , u.name as buyerName, u.email as buyerEmail, u.user_image as buyerImage FROM `tbl_chat_request` as r JOIN tbl_users as u WHERE r.`chr_status`=0 and r.`seller_id`=? and r.buyer_id = u.id";
          console.log(sql);
          pool.query(sql, [uid], (error, results, fields) => {
               if (error) {
                    callBack(error);
               }
               return callBack(null, results);
          });
     },


     getUserProductsList: (uid, callBack) => {
          let sql = "SELECT p.`pro_id`,p.`uid`,p.`name`,p.`pro_image`,p.`price`, DATE_FORMAT(p.`created_at`, '%d-%m-%Y') as created_at ,u.`unit_id`,u.`name` as unit_name, u.`sort_name` FROM `tbl_user_products` as p JOIN `tbl_units` as u WHERE p.unit = u.unit_id and p.`uid` = ?";
          pool.query(sql, [uid], (error, results, fields) => {
               if (error) {
                    callBack(error);
               }
               return callBack(null, results);
          });
     },

     getUserProductDetails: (id, uid, callBack) => {
          let data = "";
          let sql = "SELECT p.`pro_id`,p.`uid`,p.`name`,p.`pro_image`,p.`price`, DATE_FORMAT(p.`created_at`, '%d-%m-%Y') as created_at ,u.`unit_id`,u.`name` as unit_name, u.`sort_name` FROM `tbl_user_products` as p JOIN `tbl_units` as u WHERE p.unit = u.unit_id and p.`pro_id` = ?";
          pool.query(sql, [id], (error, results, fields) => {
               if (error) {
                    callBack(error);
               }
               // return callBack(null, results[0]);
               let details = results[0];

               let tagssql = "SELECT * FROM `tbl_product_tags` WHERE `pro_id`=?";
               pool.query(tagssql, [id], (error, results, fields) => {
                    if (error) {
                         callBack(error);
                    }

                    let tags = results;

                    // let tablePostCatSql = "SELECT * FROM `tbl_product_category` WHERE `pro_id`=?";
                    let tablePostCatSql = "SELECT pc.`cat_id`, sc.`category` FROM `tbl_product_category` as pc join `tbl_subject_categories` as sc on pc.cat_id = sc.cat_id  WHERE pc.`pro_id`=?";
                    let category;
                    pool.query(tablePostCatSql, [id], (error, results, fields) => {
                         if (error) {
                              callBack(error);
                         }

                         category = results[0];

                         // let tablePostSubCatSql = "SELECT * FROM `tbl_product_sub_category` WHERE `pro_id`=?";
                         let tablePostSubCatSql = "SELECT psc.`subcat_id`,ssc.`category` as subcategory FROM `tbl_product_sub_category` as psc join `tbl_subject_sub_categories` as ssc on psc.`subcat_id`= ssc.subcat_id WHERE `pro_id`=?";
                         let subcategory = "";
                         pool.query(tablePostSubCatSql, [id], (error, results, fields) => {
                              if (error) {
                                   callBack(error);
                              }
                              subcategory = results[0];

                              //   Tags

                              let tagsStringSql = "SELECT GROUP_CONCAT(`tag` SEPARATOR ',') tags FROM `tbl_product_tags` WHERE `pro_id`=?";
                              let tagstring = "";
                              pool.query(tagsStringSql, [id], (error, results, fields) => {
                                   if (error) {
                                        callBack(error);
                                   }

                                   // console.log("tagstring : " + JSON.stringify(results))
                                   if (results.length > 0) {
                                        tagstring = results[0];
                                   }

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

     getUnitsList: (callBack) => {
          let sql = "SELECT `unit_id`, `name`, `sort_name` FROM `tbl_units`";
          pool.query(sql, [], (error, results, fields) => {
               if (error) {
                    callBack(error);
               }
               return callBack(null, results);
          });

     },

     checkProductTitle: (uid, body, callBack) => {
          console.log("body : " + JSON.stringify(body));
          let title = body.title;
          let postId = body.proId;
          console.log(title);
          let postTitle = title.toLowerCase().trim();

          // let tableName = "tbl_" + uid + "_posts";
          let sql = "";
          let argsPost = [];
          if (!body.postId) {
               sql = "SELECT * FROM `tbl_user_products` where LOWER(`name`)=? and `active`=? and `uid`=?";
               argsPost.push(postTitle);
               argsPost.push(1);
               argsPost.push(uid);
          } else {
               // console.log("postTitle " + postTitle);
               sql = "SELECT * FROM `tbl_user_products` where LOWER(`name`)=? and `pro_id`!=? and `active`=? and `uid`=?";
               argsPost.push(postTitle);
               argsPost.push(postId);
               argsPost.push(1);
               argsPost.push(uid);
          }
          console.log(sql);
          console.log(argsPost);
          pool.query(sql, argsPost, (error, results, fields) => {
               console.log(error);
               console.log(results);
               if (error) {
                    return callBack(error);
               }
               return callBack(null, results);
          });
     },

     createProduct: (uid, body, fileUrl, callBack) => {

          let title = body.title;
          let price = body.price;
          let slug = "";
          let catId = body.category;
          let subCatId = body.subcategory;
          let tags = body.tags;
          let unit = body.unit;
          let postImage = fileUrl;

          let postTitle = title.toLowerCase();
          // let tableName = "tbl_" + uid + "_posts";
          let sql = "SELECT * FROM `tbl_user_products` where LOWER(`name`)=?";
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

               // let tableName = "tbl_" + uid + "_posts";
               let sql = "INSERT INTO `tbl_user_products` (`uid`, `name`, `price`, `pro_image`, `unit`, `pro_slug`) VALUES (?,?,?,?,?,?)";
               console.log(sql);
               pool.query(sql, [uid, title, price, postImage, unit, slug], (error, results, fields) => {
                    if (error) {
                         return callBack(error);
                    }
                    // return callBack(null, results);
                    if (results.insertId > 0) {
                         // console.log("Post Id: " + results.insertId);

                         let postId = results.insertId;

                         let tablePostCatSql = "INSERT INTO `tbl_product_category` (`pro_id`, `cat_id`) VALUES (?,?)";
                         let tablePostSubCatSql = "INSERT INTO `tbl_product_sub_category` (`pro_id`, `subcat_id`) VALUES (?,?)";
                         let tablePostTagSql = "INSERT INTO `tbl_product_tags` (`pro_id`, `tag`) VALUES ?";
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

     updateProduct: (uid, fileUrl, postId, body, callBack) => {

          // let postId = body.postId;
          let title = body.title;
          let price = body.price;
          let slug = "";
          let catId = body.category;
          let subCatId = body.subcategory;
          let tags = body.tags;
          let unit = body.unit;
          // let postImage = "";
          console.log(title);
          let postTitle = title.toLowerCase().trim();
          // let tableName = "tbl_" + uid + "_posts";

          let sql = "SELECT * FROM `tbl_user_products` where LOWER(`name`)=? and `uid` = ? and `pro_id` != ?";
          console.log(sql);
          pool.query(sql, [postTitle, uid, postId], (error, results, fields) => {
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

               // let tableName = "tbl_" + uid + "_posts";
               let postArgs = [title, price, unit, slug];
               let updatesql = "UPDATE `tbl_user_products` SET `name`=?,`price`=?,`unit`=?,`pro_slug`=? ";
               if (fileUrl != '') {
                    updatesql += ", `pro_image`=?  ";
                    postArgs.push(fileUrl);
               }
               updatesql += " WHERE `pro_id`=?";
               postArgs.push(postId);
               // console.log(sql);
               // [title, post, slug, postId]
               pool.query(updatesql, postArgs, (error, results, fields) => {
                    if (error) {
                         return callBack(error);
                    }


                    if (fileUrl != '') {
                         let updateImgSql = "UPDATE `tbl_user_products` SET `pro_image`=? WHERE `pro_id`=?";

                         pool.query(
                              updateImgSql, [fileUrl, postId], (error, results, fields) => {
                                   if (error) {
                                        return callBack(error);
                                   }
                              });
                    }


                    let tablePostCatDelSql = "DELETE FROM `tbl_product_category` WHERE `pro_id`=?";
                    let tablePostSubCatDelSql = "DELETE FROM `tbl_product_sub_category` WHERE `pro_id`=?";
                    let tablePostTagDelSql = "DELETE FROM `tbl_product_tags` WHERE `pro_id`=?";

                    let tablePostCatSql = "INSERT INTO `tbl_product_category` (`pro_id`, `cat_id`) VALUES (?,?)";
                    let tablePostSubCatSql = "INSERT INTO `tbl_product_sub_category` (`pro_id`, `subcat_id`) VALUES (?,?)";
                    let tablePostTagSql = "INSERT INTO `tbl_product_tags` (`pro_id`, `tag`) VALUES ?";

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
     }
};


// const updateUserTimeSlots = (uid, data) => {
//      var promise = new Promise(function (resolve, reject) {
//           let sql = "INSERT INTO `tbl_user_timings`(`uid`, `day`, `startTime`, `endTime`) VALUES (?,?,?,?)";
//           db.query(sql, [uid, data.day, data.startTime, data.endTime], (err, results) => {
//                if (err) {
//                     resolve(0);
//                } else {
//                     resolve(results);
//                }
//           });
//      });

//      return promise;
// }