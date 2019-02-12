module.exports = ({ body: { messages: { actionSendRequest: data } }}, res, next) => {
  // Return here to skip payments error; return next();
  if (!data) return res.sendStatus(401);
  if (data.companyID !== process.env.HUGGY_COMPANY_ID) return res.sendStatus(403);

  return next();
}
