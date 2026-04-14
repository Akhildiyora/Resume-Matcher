const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const NLP_API = process.env.NLP_API_URL || "http://localhost:8000";

exports.parseResume = async (filePath) => {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));

  const response = await axios.post(`${NLP_API}/parse-resume`, formData, {
    headers: formData.getHeaders(),
    maxBodyLength: 20 * 1024 * 1024,
  });

  return response.data;
};
