import { Router } from "express";
import { registerUser, loginUser } from "../controllers/auth.controllers.js";
import {
	userLoginValidator,
	userRegistrationValidator,
} from "../validators/index.js";
import validate from "../middlewares/validator.middlewares.js";

const router = Router();

router
	.route("/register")
	.post(userRegistrationValidator(), validate, registerUser);

router.route("/login").post(userLoginValidator(), validate, loginUser);

export default router;
