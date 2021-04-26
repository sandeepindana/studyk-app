const pool = require("../../config/database");

module.exports = {
     create: (data, callBack) => {
          pool.query(
               "INSERT INTO `tbl_users`(`name`, `email`, `password`) VALUES (?,?,?)", [
               data.name,
               data.email,
               data.password
          ], (error, results, fields) => {
               if (error) {
                    return callBack(error);
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
};