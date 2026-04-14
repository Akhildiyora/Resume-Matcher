const axios = require("axios");

const NLP_API = process.env.NLP_API_URL || "http://localhost:8000";

exports.getMatches = async (resume, jobs) => {
  const response = await axios.post(`${NLP_API}/match`, { resume, jobs });
  return response.data;
};
