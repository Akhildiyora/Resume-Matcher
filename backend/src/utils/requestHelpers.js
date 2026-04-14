const parseUserId = (value) => {
  if (!value) return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

exports.extractUserId = (req) => {
  const headerId = req.headers["x-user-id"];
  const bodyId = req.body?.userId ?? req.query?.userId;
  return parseUserId(headerId ?? bodyId);
};
