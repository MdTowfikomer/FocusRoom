import { Router } from "express";
import { login, register, getTurnServers } from "../controller/user_controller.js";

const router = Router();

router.route("/login").post(login); 
router.route("/register").post(register);
router.route("/get_turn_servers").get(getTurnServers);
router.route("/add_to_activity");
router.route("/get_to_activity");

export default router;  