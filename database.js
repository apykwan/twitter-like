const mongoose = require('mongoose');

class Database {
  constructor() {
    this.connect();
  }
  connect() {
    mongoose.connect(process.env.MONGODB_URL)
      .then(() => {
        console.log('Database connection successful');
      })
      .catch(err => {
        console.log(`data connection error: ${err}`);
      });
  }
}

module.exports = new Database();