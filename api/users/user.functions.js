const pool = require("../../config/database");

// class User {


//     getUserStats() {
//         return `
//         Name: ${this.name}
//         Age: ${this.age}
//         Email: ${this.email}
//       `;
//     }
// }

// module.exports = User;


const convertTitleToSlug = (uid, title) => {
  let titleSlug = '';
  let tableName = "tbl_" + uid + "_posts";
  let sql = "SELECT * FROM `" + tableName + "` where LOWER(`post_title`)=?";
  // console.log(sql);
  pool.query(sql, [title.toLowerCase()], (error, results, fields) => {
    if (error) {
      return '';
    }

    if (results.length > 0) {
      titleSlug = "-" + results.length;
    }

    return title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-') + titleSlug;

  });
}

const checkPostTitleSlug = (uid, title) => {
  let tableName = "tbl_" + uid + "_posts";
  let sql = "SELECT * FROM `" + tableName + "` where `post_title`=?";
  // console.log(sql);
  pool.query(sql, [title], (error, results, fields) => {
    if (error) {
      return false;
    }
    else if (results.length > 0) {
      return false;
    } else {
      return true;
    }



  });

}

module.exports = {
  convertTitleToSlug
}