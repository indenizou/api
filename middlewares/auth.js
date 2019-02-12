module.exports = ({ body: { key }}, res, next) => {
  // Return here to skip; return next();
  if (!key) return res.sendStatus(404);

  if (!key.balance) return res.sendStatus(402);

  return next();
}
