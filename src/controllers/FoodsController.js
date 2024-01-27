const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const DiskStorage = require("../providers/DiskStorage");

class FoodsController {
  async create(request, response) {
    const { category, name, descriptions, price, ingredients } = request.body;
    const image = request.file.filename;

    const diskStorage = new DiskStorage();

    const checkFoodAlreadyExists = await knex("foods").where({ name }).first();

    if (checkFoodAlreadyExists) {
      throw new AppError("Este prato já existe no cardápio.");
    }

    const filename = await diskStorage.saveFile(image);

    const [food_id] = await knex("foods").insert({
      category,
      name,
      descriptions,
      price,
      image: filename,
    });

    const ingredientsInsert = ingredients.map((name) => {
      return {
        food_id,
        name,
      };
    });

    await knex("ingredients").insert(ingredientsInsert);

    return response
      .status(201)
      .json({ message: "prato cadastrado com sucesso" });
  }

  async update(request, response) {
    const { category, name, descriptions, price, image, ingredients } =
      request.body;
    const { id } = request.params;
    const imageFilename = request.file.filename;

    const diskStorage = new DiskStorage();

    const food = await knex("foods").where({ id }).first();

    if (food.image) {
      await diskStorage.deleteFile(food.image);
    }

    const filename = await diskStorage.saveFile(imageFilename);

    food.category = category ?? food.category;
    food.name = name ?? food.name;
    food.descriptions = descriptions ?? food.descriptions;
    food.price = price ?? food.price;
    food.image = image ?? filename;

    await knex("foods").where({ id }).update(food);

    const hasOnlyOneIngredient = typeof ingredients === "string";

    let ingredientsInsert;

    if (hasOnlyOneIngredient) {
      ingredientsInsert = {
        name: ingredients,
        food_id: food.id,
      };
    } else if (ingredients.length > 1) {
      ingredientsInsert = ingredients.map((ingredient) => {
        return {
          food_id: food.id,
          name: ingredient,
        };
      });
    }

    await knex("ingredients").where({ food_id: id }).delete();
    await knex("ingredients").insert(ingredientsInsert);

    return response.status(201).json("Prato atualizado com sucesso");
  }

  async show(request, response) {
    const { id } = request.params;

    const food = await knex("foods").where({ id }).first();
    const ingredients = await knex("ingredients")
      .where({ food_id: id })
      .orderBy("name");

    return response.json({
      ...food,
      ingredients,
    });
  }

  async delete(request, response) {
    const { id } = request.params;

    await knex("foods").where({ id }).delete();

    return response.json();
  }

  async index(request, response) {
    const { name, ingredients } = request.query;

    let foods;

    if (ingredients) {
      const filterIngredients = ingredients
        .split(",")
        .map((ingredient) => ingredient.trim());

      foods = await knex("ingredients")
        .select([
          "foods.id",
          "foods.category",
          "foods.name",
          "foods.price",
          "foods.image",
        ])
        .whereLike("foods.name", `%${name}%`)
        .whereIn("ingredients.name", filterIngredients)
        .innerJoin("foods", "foods.id", "ingredients.food_id")
        .groupBy("foods.id");
    } else {
      foods = await knex("foods")
        .whereLike("name", `%${name}%`)
        .orderBy("name");
    }

    return response.json({ foods });
  }
}

module.exports = FoodsController;
