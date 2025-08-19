import { Router } from "express";
import {
	registerUser,
	loginUser,
	logoutUser,
	verifyEmail,
} from "../controllers/auth.controllers.js";
import {
	userLoginValidator,
	userRegistrationValidator,
} from "../validators/index.js";
import validate from "../middlewares/validator.middlewares.js";

import verifyJWT from "../middlewares/auth.middlewares.js";

const router = Router();

router
	.route("/register")
	.post(userRegistrationValidator(), validate, registerUser);

router.route("/login").post(userLoginValidator(), validate, loginUser);

router.route("/verify-email/:verificationToken").get(verifyEmail);

// Secure routes
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
