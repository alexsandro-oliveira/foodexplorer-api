const { Router } = require("express");
const multer = require("multer");
const uploadConfig = require("../configs/upload");
const FoodsController = require("../controllers/FoodsController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");
const FoodsImageController = require("../controllers/FoodsImageController");

const foodsRoutes = Router();

const foodsController = new FoodsController();
const foodsImageController = new FoodsImageController();
const upload = multer(uploadConfig.MULTER);

foodsRoutes.use(ensureAuthenticated);

foodsRoutes.post("/", upload.single("image"), foodsController.create);
foodsRoutes.get("/:id", foodsController.show);
foodsRoutes.delete("/:id", foodsController.delete);
foodsRoutes.get("/", foodsController.index);
foodsRoutes.put("/:id", upload.single("image"), foodsController.update);
foodsRoutes.patch(
  "/image/:id",
  ensureAuthenticated,
  upload.single("image"),
  foodsImageController.update
);

module.exports = foodsRoutes;
