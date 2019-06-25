const { groupBy } = require('lodash');
const Customer = require('../models/customer.model');
const Mailchimp = require('./mailchimp-api');
const config = require('../config');

exports.subscribe = async ({ body }, res) => {
  const { sandbox } = body;
  const chimpData = { mailchimp: {} };
  let subscriber;

  if (!sandbox) {
    try {
      console.log('Subscribing to mailchimp ...');
      subscriber = await Mailchimp.subscribeUser(body);
      console.log(subscriber);
      chimpData.mailchimp.status = subscriber.status || 'subscribed';
      chimpData.mailchimp.id = subscriber.id;
      chimpData.mailchimp.unique_email_id = subscriber.unique_email_id;
    } catch (e) {
      chimpData.mailchimp.status = 'failed';
    }
  }

  subscriber = await Customer.create({ ...body, ...chimpData })
    .catch(e => res.status(400).json(e));

  return res.status(201).json(subscriber);
};


exports.subscribers = async (req, res) => {
  const customers = await Customer.find();
  return res.json(customers);
};

exports.customer = async ({ params }, res) => {
  const customer = await Customer.findById(params.id);
  return res.json(customer);
};

exports.update = async ({ params, body }, res) => {
  let customer = await Customer.findById(params.id);
  if (!customer) return res.status(404).json('Cliente não encontrado');

  customer = Object.assign(customer, body);

  return customer.save((error) => {
    if (error) return res.status(500).json({ message: 'Falho ao salvar cliente', error });
    return res.json(customer);
  });
};

exports.deleteCustomer = async ({ params, body }, res) => {
  return Customer.findByIdAndDelete(params.id || body.id, (error, query) => {
    if (error) return res.status(500).json({ message: 'Failed to delete client', error });
    return res.json(query);
  });
};

exports.byStatus = async (req, res) => {
  const customers = await Customer.find();
  return res.json(groupBy(customers, 'status'));
};

exports.status = (req, res) => res.json(config.pipelines);
