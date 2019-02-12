const Boom = require('boom');
const Users = require('../models/user.model');

exports.user = ({ params }, res) => Users
  .findById(params.userID, (err, user) => {
    if (err) return res.status(500).json(Boom.internal(err));

    if (!user) return res.status(404).json(Boom.notFound('User not Found'));

    return res.json(user);
  });
