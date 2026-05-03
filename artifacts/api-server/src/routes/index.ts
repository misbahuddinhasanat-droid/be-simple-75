import { Router, type IRouter } from "express";
import { static as serveStatic } from "express";
import { join } from "path";
import healthRouter from "./health";
import productsRouter from "./products";
import cartRouter from "./cart";
import ordersRouter from "./orders";
import uploadRouter from "./upload";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(cartRouter);
router.use(ordersRouter);
router.use(uploadRouter);
router.use(adminRouter);

// Serve uploaded files statically
router.use("/uploads", serveStatic(join(process.cwd(), "uploads")));

export default router;
