const usersRepository = require('./users-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');

/**
 * Get list of users
 * @returns {Array}
 */
async function getUsers(
  page_number = 1,
  page_size = 0,
  sort_field = 'email',
  sort_order = 'asc',
  search_param = null
) {
  let allUsers = await usersRepository.getUsers();

  if (search_param) {
    const [search_field, search_term] = search_param.split(':');
    const search_regex = new RegExp(search_term, 'i');

    allUsers = allUsers.filter((user) =>
      user[search_field].match(search_regex)
    );
  }

  const sort_fn =
    sort_order === 'asc'
      ? (a, b) => a[sort_field].localeCompare(b[sort_field])
      : (a, b) => b[sort_field].localeCompare(a[sort_field]);

  const sortedUsers = allUsers.sort(sort_fn);

  const totalUsers = sortedUsers.length;
  const totalPages = Math.ceil(totalUsers / page_size);

  if (page_size === 0) {
    page_size = totalUsers;
  }

  const page_number_clamped = Math.min(Math.max(page_number, 1), totalPages);
  const startIndex = (page_number_clamped - 1) * page_size;
  const endIndex = Math.min(startIndex + page_size, totalUsers);

  const formattedUsers = sortedUsers
    .slice(startIndex, endIndex)
    .map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }));

  const paginationList = Object.assign(
    {},
    {
      page_number: page_number_clamped,
      page_size,
      count: formattedUsers.length,
      total_pages: totalPages,
      has_previous_page: page_number_clamped > 1,
      has_next_page: page_number_clamped < totalPages,
      data: formattedUsers,
    }
  );

  return paginationList;
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createUser(name, email, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const user = await usersRepository.getUserByEmail(email);

  if (user) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(userId, password) {
  const user = await usersRepository.getUser(userId);
  return passwordMatched(password, user.password);
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(userId, password) {
  const user = await usersRepository.getUser(userId);

  // Check if user not found
  if (!user) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await usersRepository.changePassword(
    userId,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  emailIsRegistered,
  checkPassword,
  changePassword,
};
