const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class FavoritesController {
  async create(request, response) {
    const { food_id } = request.params;
    const user_id = request.user.id;

    const favoriteExists = await knex("favorites")
      .select("id")
      .where({ user_id, food_id });

    if (favoriteExists.length) {
      throw new AppError("Prato já é favorito", 400);
    }

    await knex("favorites").insert({
      user_id,
      food_id,
    });

    return response.status(200).json("Prato adicionado aos favoritos");
  }

  async index(request, response) {
    const user_id = request.user.id;

    const foods = await knex("favorites")
      .select([
        "foods.id",
        "foods.category",
        "foods.name",
        "foods.price",
        "foods.image",
      ])
      .where({ user_id })
      .innerJoin("foods", "foods.id", "favorites.food_id")
      .groupBy("foods.id");

    return response.json({
      foods,
    });
  }

  async delete(request, response) {
    const { food_id } = request.params;

    await knex("favorites").where({ food_id }).delete();

    return response.json();
  }
}

module.exports = FavoritesController;
