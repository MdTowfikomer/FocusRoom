import { Router } from "express";
import { login, register, getTurnServers } from "../controller/user_controller.js";
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 10,
    message: { message: "Too many requests from this IP, please try again later." }
});

const router = Router();

router.route("/login").post(authLimiter, login); 
router.route("/register").post(authLimiter, register);
router.route("/get_turn_servers").get(getTurnServers);
router.route("/add_to_activity");
router.route("/get_to_activity");

export default router;   