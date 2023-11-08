const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  database: "social_media",
  password: "Ajay9808825038",
  port: 3306,
});

module.exports = {
  pool,
};
