const { Transaction } = require('../../../models');

//get transactions list
async function getTransactions(
  sorts,
  filters,
  page_number = 1,
  page_size = 10
) {
  const skip = (page_number - 1) * page_size;
  let query = Transaction.find(filters, { _id: 1, amount: 1, type: 1 });

  if (sorts) {
    query = query.sort(sorts);
  }

  const transactions = await query.skip(skip).limit(page_size);
  return transactions;
}

//get transaction count
async function getTransactionCount(filters) {
  const count = await Transaction.countDocuments(filters);
  return count;
}

//get transaction detail
async function getTransaction(id) {
  return Transaction.findById(id);
}

//create transaction
async function createTransaction({ amount, type }) {
  const newTransaction = new Transaction({ amount, type });
  return newTransaction.save();
}

//update transaction
async function updateTransaction(id, { amount, type }) {
  const updatedTransaction = await Transaction.findByIdAndUpdate(
    id,
    { amount, type },
    { new: true }
  );

  if (!updatedTransaction) {
    throw new Error(`Transaction not found with id ${id}`);
  }

  return updatedTransaction;
}

//delete transaction
async function deleteTransaction(id) {
  const deletedTransaction = await Transaction.findByIdAndDelete(id);
  if (!deletedTransaction) {
    throw new Error(`Transaction not found with id ${id}`);
  }
}

module.exports = {
  getTransactions,
  getTransactionCount,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
