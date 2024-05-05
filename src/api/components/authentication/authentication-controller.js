const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');
const attempt = {};
/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function login(request, response, next) {
  const { email, password } = request.body;

  const currentTime = new Date();
  const { lastAttemptTime = null, attempts = 0 } = attempt[email] || {};

  const isAccountLocked = attempts >= 6 && lastAttemptTime;
  const thirtyMinutesInMillis = 30 * 60 * 1000;

  if (isAccountLocked) {
    const timeDifference = currentTime - lastAttemptTime;

    if (timeDifference < thirtyMinutesInMillis) {
      const errorMessage = `Too many failed login attempts`;

      throw errorResponder(
        errorTypes.FORBIDDEN,
        'Too many failed login attempts',
        errorMessage
      );
    } else {
      delete attempt[email];
    }
  }

  try {
    const loginSuccess = await authenticationServices.checkLoginCredentials(
      email,
      password
    );

    if (!loginSuccess) {
      const newAttempts = (attempt[email]?.attempts || 0) + 1;
      attempt[email] = {
        lastAttemptTime: currentTime,
        attempts: newAttempts,
      };

      if (newAttempts >= 6) {
        throw errorResponder(
          errorTypes.FORBIDDEN,
          'Too many failed login attempts'
        );
      }

      throw errorResponder(
        errorTypes.INVALID_CREDENTIALS,
        'Wrong email or password'
      );
    }

    delete attempt[email];

    return response.status(200).json(loginSuccess);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
};
