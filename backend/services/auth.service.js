const bcrypt = require("bcrypt");
const authRepository = require("../repositories/authRepository");

const loginService = async (email, password) => {
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    throw new Error("EMAIL_OR_PASSWORD_INVALID");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new Error("EMAIL_OR_PASSWORD_INVALID");
  }

  // Jangan kirim password ke controller
  delete user.password;

  return user;
};

const getCurrentUserService = async (userId) => {
  const user = await authRepository.findUserById(userId);

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return user;
};

module.exports = {
  loginService,
  getCurrentUserService,
};