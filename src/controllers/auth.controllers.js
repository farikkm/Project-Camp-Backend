import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { User } from "../models/user.models.js";
import {
	sendMail,
	emailVerficationMailgenContent,
	resetPasswordMailgenContent,
} from "../utils/mail.js";
import { asyncHandler } from "../utils/async-handler.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
	try {
		const user = await User.findById(userId);

		const accessToken = user.generateAccessToken();
		const refreshToken = user.generateRefreshToken();

		user.refreshToken = refreshToken;
		await user.save({ validateBeforeSave: false });

		return { accessToken, refreshToken };
	} catch (error) {
		console.error("Error occured while generating access and refresh tokens");
	}
};

const registerUser = asyncHandler(async (req, res) => {
	const { username, email, password, role } = req.body;

	const userExists = await User.findOne({ $or: [{ username }, { email }] });

	if (userExists) {
		throw new ApiError(409, "User is already exists");
	}

	const user = new User({
		email,
		username,
		password,
		isEmailVerified: false,
	});

	const { unhashedToken, hashedToken, tokenExpiry } =
		user.generateTemporaryToken();

	user.emailVerificationToken = hashedToken;
	user.emailVerificationExpiry = tokenExpiry;

	await user.save({ validateBeforeSave: false });

	await sendMail({
		email: user?.email,
		subject: "Verify your account, bratishka",
		mailContent: emailVerficationMailgenContent(
			user?.username,
			`${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unhashedToken}`,
		),
	});

	const createdUser = await User.findById(user?._id).select(
		"-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
	);

	if (!createdUser) {
		throw new ApiError(500, "Registration Error: User not found");
	}

	return res
		.status(201)
		.json(
			new ApiResponse(
				200,
				{ user: createdUser },
				"Your account is successfully registered. Verification link sent to your account",
			),
		);
});

const loginUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	if (!email) {
		throw new ApiError(400, "Email is required");
	}

	const user = await User.findOne({ email });

	if (!user) {
		throw new ApiError(400, "User does not exist");
	}

	const isPasswordValid = await user.isPasswordCorrect(password);

	if (!isPasswordValid) {
		throw new ApiError(400, "Invalid credentials");
	}

	const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
		user._id,
	);

	const loggedInUser = await User.findById(user?._id).select(
		"-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
	);

	const options = {
		httpOnly: true,
		secure: true,
	};

	return res
		.status(200)
		.cookie("accessToken", accessToken, options)
		.cookie("refreshToken", refreshToken, options)
		.json(
			new ApiResponse(
				200,
				{
					user: loggedInUser,
					accessToken,
					refreshToken,
				},
				"User logged in successfully",
			),
		);
});

const logoutUser = asyncHandler(async (req, res) => {
	await User.findByIdAndUpdate(
		req.user?._id,
		{
			$set: {
				refreshToken: "",
			},
		},
		{
			new: true,
		},
	);

	const options = {
		httpOnly: true,
		secure: true,
	};

	return res
		.status(200)
		.clearCookie("accessToken", options)
		.clearCookie("refreshToken", options)
		.json(new ApiResponse(200, null, "User successfully logged out"));
});

const verifyEmail = asyncHandler(async (req, res) => {
	const { verificationToken } = req.params;

	const hashedToken = crypto
		.createHash("sha256")
		.update(verificationToken)
		.digest("hex");

	const user = await User.findOne({
		emailVerificationToken: hashedToken,
	});

	if (!user) {
		throw new ApiError("400", "Invalid verification token");
	}

	if (Date.now() > user.emailVerificationExpiry) {
		throw new ApiError("400", "Expired verification token");
	}

	user.isEmailVerified = true;
	user.emailVerificationToken = null;
	user.emailVerificationExpiry = null;

	await user.save({ validateBeforeSave: false });

	res
		.status(200)
		.json(new ApiResponse(200, null, "Email verified successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
	if (!req.user) {
		throw new ApiError(404, "User does not exist");
	}
	res.status(200).json(new ApiResponse(200, { user: req.user }, ""));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
	const incomingRefreshToken =
		req.cookies?.refreshToken || req.body.refreshToken;

	if (!incomingRefreshToken) {
		throw new ApiError(401, "Unauthorized request");
	}

	try {
		const decodedToken = jwt.verify(
			incomingRefreshToken,
			process.env.REFRESH_TOKEN_SECRET,
		);

		const user = await User.findById(decodedToken?._id);

		if (!user) {
			throw new ApiError(404, "User does not exist");
		}

		if (incomingRefreshToken !== user.refreshToken) {
			throw new ApiError(409, "Invalid refresh token");
		}

		const options = {
			httpOnly: true,
			secure: true,
		};

		const { accessToken, refreshToken: newRefreshToken } =
			await generateAccessAndRefreshToken(user._id);

		user.refreshToken = newRefreshToken;
		await user.save();

		res
			.status(200)
			.cookie("accessToken", accessToken, options)
			.cookie("refreshToken", newRefreshToken, options)
			.json(
				new ApiResponse(
					200,
					{
						accessToken,
						refreshToken: newRefreshToken,
					},
					"Successfully refreshed access token",
				),
			);
	} catch (error) {
		throw new ApiError(401, "Invalid refresh token");
	}
});

const resendEmailVerification = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user?._id);

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	if (user.isEmailVerified) {
		throw new ApiError(409, "Your email is already verified");
	}

	const { unhashedToken, hashedToken, tokenExpiry } =
		user.generateTemporaryToken();

	user.emailVerificationToken = hashedToken;
	user.emailVerificationExpiry = tokenExpiry;

	await user.save({ validateBeforeSave: false });

	await sendMail({
		email: user?.email,
		subject: "Verify your account, bratishka",
		mailContent: emailVerficationMailgenContent(
			user?.username,
			`${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unhashedToken}`,
		),
	});

	return res
		.status(200)
		.json(
			new ApiResponse(200, null, "Email verification is send to your account"),
		);
});

const forgotPassword = asyncHandler(async (req, res) => {
	const { email } = req.body;

	const user = await User.findOne({ email });

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	const { unhashedToken, hashedToken, tokenExpiry } =
		user.generateTemporaryToken();

	user.forgotPasswordToken = hashedToken;
	user.forgotPasswordExpiry = tokenExpiry;

	await user.save({ validateBeforeSave: false });

	await sendMail({
		email: user?.email,
		subject: "You requested to reset your password",
		mailContent: resetPasswordMailgenContent(
			user?.username,
			`${req.protocol}://${req.get("host")}/api/v1/auth/reset-password/${unhashedToken}`,
		),
	});

	res
		.status(200)
		.json(
			new ApiResponse(
				200,
				null,
				"We sent the mail to your email to reset your password",
			),
		);
});

const resetForgotPassword = asyncHandler(async (req, res) => {
	const { resetToken } = req.params;
	const { newPassword } = req.body;

	const hashedToken = crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex");

	const user = await User.findOne({
		forgotPasswordToken: hashedToken,
	});

	if (!user) {
		throw new ApiError(409, "Invalid or expired token");
	}

	user.forgotPasswordExpiry = null;
	user.forgotPasswordToken = null;

	user.password = newPassword;
	await user.save({ validateBeforeSave: false });

	return res
		.status(200)
		.json(new ApiResponse(200, null, "Password reset successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
	const { oldPassword, newPassword } = req.body;

	const user = await User.findById(req.user?._id);

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	const isPasswordValid = await user.isPasswordCorrect(oldPassword);

	if (!isPasswordValid) {
		throw new ApiError(409, "Incorrect old password");
	}

	user.password = newPassword;
	user.save({ validateBeforeSave: false });

	res
		.status(200)
		.json(new ApiResponse(200, null, "Password changed successfully"));
});

export {
	registerUser,
	loginUser,
	logoutUser,
	verifyEmail,
	getCurrentUser,
	refreshAccessToken,
	resendEmailVerification,
	forgotPassword,
	resetForgotPassword,
	changeCurrentPassword,
};
