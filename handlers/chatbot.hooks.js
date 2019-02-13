/* eslint-disable no-console */
const Boom = require('boom');
const Customer = require('../models/customer.model');

exports.saveData = (req, res) => {
  const mappedData = {
    chatID: req.chatID,
    email: req['SYSTEM.CLIENT_EMAIL'] || req['formulario.email'],
    name: req['SYSTEM.CLIENT_NAME'],
    phone: req['SYSTEM.CLIENT_NUMBER'] || req['formulario.phone'],
    contactby: req['formulario.contactby'] || 'email',
    indication: {
      contactby: req['indicacao.contactby'],
      email: req['indicado_email.email'],
      phone: req['indicacao.phone'],
    },
  };

  return Customer.findOne({ email: mappedData.email }, (err, user) => {
    if (err) return res.status(500).json(Boom.internal(err));

    if (!user) {
      const newCustomer = new Customer(mappedData);
      return newCustomer.save((errr) => {
        if (errr) return res.status(500).json(Boom.internal(errr));

        console.info('Created user from Huggy Webhook');
        return res.status(201).end();
      });
    }

    // eslint-disable-next-line no-param-reassign
    user = { ...user, ...mappedData };
    return user.save((errr) => {
      if (errr) return res.status(500).json(Boom.internal(errr));
      console.info('Updated user from Huggy Webhook');
      return res.status(201).end();
    });
  });
};
