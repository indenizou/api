const fs = require('fs');
const multer = require('multer');
const Boom = require('boom');
const Customer = require('../models/customer.model');

exports.storage = multer.diskStorage({
  destination: ({ params }, file, cb) => {
    const folder = `uploads/${params.id}`;

    if (!fs.existsSync(folder)) fs.mkdirSync(folder);

    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

exports.save = ({ params, files }, res) => {
  const filesData = files.map(file => ({
    name: file.originalname,
    encoding: file.encoding,
    mimetype: file.mimetype,
    size: file.size,
    path: file.path,
  }));

  return Customer.findOne({ _id: params.id }, (err, user) => {
    if (err) return res.status(500).json(Boom.internal(err));
    if (!user) return res.status(404).json(Boom.notFound('User not Found'));

    filesData.forEach(file => user.files.push(file));

    user.save();
    return res.status(201).json(user.files);
  }).catch(err => res.status(500).json(Boom.internal(err)));
};

exports.delete = ({ params }, res) => Customer
  .findById(params.id, (err, user) => {
    if (err) return res.status(500).json(Boom.internal(err));
    if (!user) return res.status(404).json(Boom.notFound('User not Found'));

    if (!user.files.id(params.fileId)) return res.status(404).json(Boom.notFound('File not Found or already deleted'));

    return fs.unlink(user.files.id(params.fileId).path, (error) => {
      if (error) return res.status(500).json(Boom.internal(err));

      user.files.pull(params.fileId);
      user.save();
      return res.status(200).end();
    });
  }).catch(err => res.status(500).json(Boom.internal(err)));
