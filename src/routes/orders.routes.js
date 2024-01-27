const { Router } = require("express");
const OrdersController = require("../controllers/OrdersController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const ordersRoutes = Router();
const ordersController = new OrdersController();

ordersRoutes.use(ensureAuthenticated);

ordersRoutes.post("/:id", ordersController.create);
ordersRoutes.get("/:user_id", ordersController.index);

module.exports = ordersRoutes;
