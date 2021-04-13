const { verify } = require("jsonwebtoken");

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
                         next();
                    }
               })
          } else {
               res.json({
                    status: 'error',
                    message: "Access denied. Unauthorized user access"
               });
          }
     }
};