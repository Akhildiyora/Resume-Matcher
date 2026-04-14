const pool = require("../config/db");

exports.query = async (text, params) => {
  return pool.query(text, params);
};
