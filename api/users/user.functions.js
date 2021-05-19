const pool = require("../../config/database");

class User {


    getUserStats() {
        return `
        Name: ${this.name}
        Age: ${this.age}
        Email: ${this.email}
      `;
    }
}

module.exports = User;