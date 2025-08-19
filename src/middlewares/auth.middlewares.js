import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, res, next) => {
	const token =
		req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1];

	if (!token) {
		throw new ApiError(401, "Unauthorized request");
	}

	try {
		const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

		const user = await User.findById(decodedToken?._id).select(
			"-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
		);

		if (!user) {
			throw new ApiError(401, "Invalid access token");
		}

		req.user = user;
		next();
	} catch (error) {
		console.error("An error occures while verifying JWT token.");
	}
});

export default verifyJWT;
