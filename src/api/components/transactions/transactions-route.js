const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const transactionsControllers = require('./transactions-controller');
const transactionsValidator = require('./transactions-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/transactions', route);
  //get list of transactions
  route.get(
    '/',
    authenticationMiddleware,
    transactionsControllers.getTransactions
  );

  //add transaction
  route.post(
    '/',
    authenticationMiddleware,
    celebrate(transactionsValidator.createTransaction),
    transactionsControllers.createTransaction
  );

  //get transaction detail
  route.get(
    '/:id',
    authenticationMiddleware,
    transactionsControllers.getTransaction
  );

  //update transaction
  route.put(
    '/:id',
    authenticationMiddleware,
    celebrate(transactionsValidator.updateTransaction),
    transactionsControllers.updateTransaction
  );

  //delete transaction
  route.delete(
    '/:id',
    authenticationMiddleware,
    transactionsControllers.deleteTransaction
  );
};
