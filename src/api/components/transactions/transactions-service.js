const transactionRepository = require('./transactions-repository');

//get list of transactions
async function getTransactions(queryParams) {
  const { page_number = 1, page_size = 10, sort, search } = queryParams;
  const filters = {};

  if (search) {
    const [field, value] = search.split(':');
    if (field === 'type') {
      filters.type = value;
    }
  }
  const sorts = parseSorts(sort);
  const transactions = await transactionRepository.getTransactions(
    sorts,
    filters,
    parseInt(page_number),
    parseInt(page_size)
  );

  const count = await transactionRepository.getTransactionCount(filters);
  const total_pages = Math.ceil(count / parseInt(page_size));
  const has_previous_page = parseInt(page_number) > 1;
  const has_next_page = parseInt(page_number) < total_pages;

  const formattedTransactions = transactions.map(formatTransaction);

  return {
    page_number: parseInt(page_number),
    page_size: parseInt(page_size),
    count,
    total_pages,
    has_previous_page,
    has_next_page,
    data: formattedTransactions,
  };
}

function parseSorts(sort) {
  if (!sort) {
    return null;
  }

  const allowedFields = ['amount', 'type'];
  const sortParts = sort.split(':');

  if (sortParts.length !== 2 || !allowedFields.includes(sortParts[0])) {
    throw new Error(`Invalid sort value: ${sort}`);
  }

  const [field, order] = sortParts;
  const sorts = {};
  sorts[field] = order === 'asc' ? 1 : -1;

  return sorts;
}

function formatTransaction(transaction) {
  if (!transaction) {
    return null;
  }
  const { _id: id, amount, type } = transaction;
  return { id, amount, type };
}

//get transaction detail
async function getTransaction(id) {
  const transaction = await transactionRepository.getTransaction(id);
  return formatTransaction(transaction);
}

//create transaction
async function createTransaction({ amount, type }) {
  amount = parseFloat(amount);
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Invalid amount value. Amount must be a positive number.');
  }

  const newTransaction = await transactionRepository.createTransaction({
    amount,
    type,
  });

  return formatTransaction(newTransaction);
}

//update transaction
async function updateTransaction(transactionId, { amount, type }) {
  amount = parseFloat(amount);
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Invalid amount value. Amount must be a positive number.');
  }

  if (typeof type !== 'string' || !type.trim()) {
    throw new Error('Invalid type value. Type must be a non-empty string.');
  }

  const updatedTransaction = await transactionRepository.updateTransaction(
    transactionId,
    { amount, type }
  );

  if (!updatedTransaction) {
    throw new Error(`Transaction not found with id ${transactionId}`);
  }
  return formatTransaction(updatedTransaction);
}

//delete transaction
async function deleteTransaction(id) {
  await transactionRepository.deleteTransaction(id);
}

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
