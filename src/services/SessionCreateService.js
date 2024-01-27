const { compare } = require("bcryptjs");
const AppError = require("../utils/AppError");
const authConfig = require("../configs/auth");
const { sign } = require("jsonwebtoken");

class UserCreateService {
  constructor(UserRepository) {
    this.UserRepository = UserRepository;
  }

  async execute({ email, password }) {
    const user = await this.UserRepository.findByEmail(email);

    if (!user) {
      throw new AppError("E-mail e/ou senha incorreta", 401);
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      throw new AppError("E-mail e/ou senha incorreta", 401);
    }

    const { secret, expiresIn } = authConfig.jwt;
    const token = sign({}, secret, {
      subject: String(user.id),
      expiresIn,
    });

    return { token, user };
  }
}

module.exports = UserCreateService;
