const Boom = require('boom');
const File = require('../models/files.model');

module.exports = async ({ query }, res, next) => {
  try {
    const foundFile = await File.findById(query.fid);
    console.log(query.fid);
    console.log('found file', !!foundFile, foundFile);
    if (foundFile) return next();

    return res.status(401).send(Boom.unauthorized());
  } catch (e) { return res.status(401).send(Boom.unauthorized()); }
};
