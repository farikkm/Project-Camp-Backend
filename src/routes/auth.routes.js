import { Router } from "express";
import {
	registerUser,
	loginUser,
	logoutUser,
	verifyEmail,
	getCurrentUser,
	refreshAccessToken,
	forgotPassword,
	resetForgotPassword,
	changeCurrentPassword,
	resendEmailVerification,
} from "../controllers/auth.controllers.js";
import {
	changeCurrentPasswordValidator,
	forgotPasswordValidator,
	resetPasswordValidator,
	userLoginValidator,
	userRegistrationValidator,
} from "../validators/index.js";
import validate from "../middlewares/validator.middlewares.js";

import verifyJWT from "../middlewares/auth.middlewares.js";

const router = Router();

// Unsecured routes
router
	.route("/register")
	.post(userRegistrationValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/refresh-token").post(refreshAccessToken);
router
	.route("/forgot-password")
	.post(forgotPasswordValidator(), validate, forgotPassword);
router
	.route("/reset-password/:resetToken")
	.post(resetPasswordValidator(), validate, resetForgotPassword);

// Secure routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router
	.route("/change-password")
	.post(
		changeCurrentPasswordValidator(),
		validate,
		verifyJWT,
		changeCurrentPassword,
	);
router
	.route("/resend-email-verification")
	.post(verifyJWT, resendEmailVerification);

export default router;
