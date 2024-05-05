const joi = require('joi');

module.exports = {
  createTransaction: {
    body: {
      amount: joi.number().min(0).required().label('Amount'),
      type: joi.string().required().label('Type'),
    },
  },

  updateTransaction: {
    body: {
      amount: joi.number().min(0).required().label('Amount'),
      type: joi.string().required().label('Type'),
    },
  },
};
