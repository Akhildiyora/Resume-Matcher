const axios = require("axios");

const NLP_API = process.env.NLP_API_URL || "http://localhost:8000";

exports.indexJobs = async (embeddings, ids) => {
  await axios.post(`${NLP_API}/index-jobs`, { embeddings, ids });
};

exports.searchJobs = async (embedding, options = {}) => {
  const res = await axios.post(`${NLP_API}/search`, {
    embedding,
    k: options.k || 10,
  });
  return res.data.results;
};
