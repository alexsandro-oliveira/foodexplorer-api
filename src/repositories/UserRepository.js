const sqliteConnection = require("../database/sqlite");
const knex = require("../database/knex");

class UserRepository {
  async findByEmail(email) {
    const database = await sqliteConnection();
    const user = await database.get("SELECT * FROM users WHERE email = (?)", [
      email,
    ]);

    return user;
  }

  async create({ name, email, password }) {
    const user = { name, email, password };

    const userId = await knex("users").insert(user);

    if (userId == 1) {
      await knex("users").update("isAdmin", "true").where({ id: 1 });
    }

    return { id: userId };
  }
}

module.exports = UserRepository;
