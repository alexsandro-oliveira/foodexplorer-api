const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class OrdersController {
  async create(request, response) {
    const { status } = request.body;
    const user_id = request.user.id;

    if (!status) {
      throw new AppError(
        "Não foi possível realizar o pedido, por favor verifique as informações"
      );
    }

    await knex("orders").insert({
      status,
      user_id,
    });

    return response.json("pedido feito com sucesso!");
  }
}
S;

module.exports = OrdersController;
