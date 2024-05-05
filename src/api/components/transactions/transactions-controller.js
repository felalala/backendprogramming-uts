const { errorResponder, errorTypes } = require('../../../core/errors');
const transactionService = require('./transactions-service');

//Handle get list of transactions
async function getTransactions(request, response, next) {
  const { page_number = 1, page_size = 10, sort, search } = request.query;
  const queryParams = {
    page_number: parseInt(page_number),
    page_size: parseInt(page_size),
    sort: sort || null,
    search: search || null,
  };

  try {
    const result = await transactionService.getTransactions(queryParams);
    return response.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

//Handle create transaction
async function createTransaction(request, response, next) {
  const { amount, type } = request.body;

  try {
    const transaction = await transactionService.createTransaction({
      amount,
      type,
    });

    return response.status(201).json(transaction);
  } catch (error) {
    return next(error);
  }
}

//Handle get transaction detail
async function getTransaction(request, response, next) {
  const transactionId = request.params.id;

  try {
    const transaction = await transactionService.getTransaction(transactionId);

    if (transaction) {
      return response.status(200).json(transaction);
    } else {
      throw errorResponder(errorTypes.NOT_FOUND, 'Transaction not found');
    }
  } catch (error) {
    return next(error);
  }
}

//Handle update transaction
async function updateTransaction(request, response, next) {
  const transactionId = request.params.id;
  const { amount, type } = request.body;
  try {
    if (!amount || !type) {
      throw new Error('Invalid request body. Please provide amount and type.');
    }
    const updatedTransaction = await transactionService.updateTransaction(
      transactionId,
      { amount, type }
    );
    return response.status(200).json(updatedTransaction);
  } catch (error) {
    return next(error);
  }
}

//Handle delete transaction
async function deleteTransaction(request, response, next) {
  const transactionId = request.params.id;

  try {
    await transactionService.deleteTransaction(transactionId);
    return response.status(200).json({ message: 'Transaction deleted' });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getTransactions,
  createTransaction,
  getTransaction,
  updateTransaction,
  deleteTransaction,
};
