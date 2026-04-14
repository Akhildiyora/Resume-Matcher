const axios = require("axios");

const NLP_API = process.env.NLP_API_URL || "http://localhost:8000";

const client = axios.create({
  baseURL: NLP_API,
  timeout: 15_000,
});

exports.processResume = async (text) => {
  const response = await client.post("/process", { text });
  return response.data;
};
