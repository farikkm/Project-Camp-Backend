import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { User } from "../models/user.models.js";
import { sendMail, emailVerficationMailgenContent } from "../utils/mail.js";
import { asyncHandler } from "../utils/async-handler.js";

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

export { registerUser, loginUser };
