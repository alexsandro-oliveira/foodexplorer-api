const { hash, compare } = require("bcryptjs");
const AppError = require("../utils/AppError");

const UserRepository = require("../repositories/UserRepository");
const sqliteConnection = require("../database/sqlite");
const UserCreateService = require("../services/UserCreateService");

class UsersController {
  async create(request, response) {
    const { name, email, password } = request.body;

    const userRepository = new UserRepository();
    const userCreateService = new UserCreateService(userRepository);

    await userCreateService.execute({ name, email, password });

    return response.status(201).json("Usuário criado com sucesso!");
  }

  async update(request, response) {
    const { name, email, password, old_password, isAdmin, avatar, address } =
      request.body;
    const user_id = request.user.id;
    const jsonAdress = JSON.stringify(address);

    const database = await sqliteConnection();
    const user = await database.get("SELECT * FROM users WHERE id = (?)", [
      user_id,
    ]);

    if (!user) {
      throw new AppError("Usuário não encontrado");
    }

    const userWithUpdatedEmail = await database.get(
      "SELECT * FROM users WHERE email = (?)",
      [email]
    );

    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      throw new AppError("Este e-mail já esta em uso.");
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.isAdmin = isAdmin ?? user.isAdmin;
    user.avatar = avatar ?? user.avatar;
    user.address = jsonAdress ?? user.address;

    if (password && !old_password) {
      throw new AppError(
        "Você precisa informar a senha antiga para definir a nova senha."
      );
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password);

      if (!checkOldPassword) {
        throw new AppError("A senha antiga não confere.");
      }

      user.password = await hash(password, 8);
    }

    await database.run(
      `
      UPDATE users SET
      name = ?,
      email = ?,
      password = ?,
      isAdmin =?,
      avatar = ?,
      address = ?,
      updated_at = DATETIME('now')
      WHERE id = ?`,
      [
        user.name,
        user.email,
        user.password,
        user.isAdmin,
        user.avatar,
        user.address,
        user_id,
      ]
    );

    return response.json();
  }
}

module.exports = UsersController;
