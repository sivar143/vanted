import { Router, type IRouter } from "express";
import healthRouter from "./health";
import servicesRouter from "./services";
import cartRouter from "./cart";
import ordersRouter from "./orders";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/services", servicesRouter);
router.use("/cart", cartRouter);
router.use("/orders", ordersRouter);
router.use("/admin", adminRouter);

export default router;
