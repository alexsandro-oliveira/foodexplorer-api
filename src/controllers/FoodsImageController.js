const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const DiskStorage = require("../providers/DiskStorage");

class FoodsImageController {
  async update(request, response) {
    const { id } = request.params;

    const imageFilename = request.file.filename;

    const diskStorage = new DiskStorage();

    const food = await knex("foods").where({ id }).first();

    if (!food) {
      throw new AppError("Produto não encontrado ou inexistente.", 401);
    }

    if (food.image) {
      await diskStorage.deleteFile(food.image);
    }

    const filename = await diskStorage.saveFile(imageFilename);
    food.image = filename;

    await knex("foods").update(food).where({ id });

    return response.json(food);
  }
}

module.exports = FoodsImageController;
