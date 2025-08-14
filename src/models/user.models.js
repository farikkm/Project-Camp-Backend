import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new Schema(
	{
		avatar: {
			type: {
				url: String,
				localPath: String,
			},
			default: {
				url: "https://placehold.co/200",
				localPath: "",
			},
		},
		username: {
			type: String,
			required: true,
			unique: true,
			index: true,
			lowercase: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		fullname: {
			type: String,
			trim: true,
		},
		password: {
			type: String,
			required: [true, "Password is required"],
		},
		isEmailVerified: {
			type: Boolean,
			default: false,
		},
		refreshToken: {
			type: String,
		},
		forgotPasswordToken: {
			type: String,
		},
		forgotPasswordExpiry: {
			type: Date,
		},
		emailVerificationToken: {
			type: String,
		},
		emailVerificationExpiry: {
			type: String,
		},
	},
	{
		timestamps: true,
	},
);

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();

	this.password = await bcrypt.hash(this.password, 10);
	next();
});

userSchema.method("isPasswordCorrect", async function (password) {
	return await bcrypt.compare(password, this.password);
});

userSchema.method("generateAccessToken", function () {
	return jwt.sign(
		{
			_id: this._id,
		},
		process.env.ACCESS_TOKEN_SECRET,
		{ algorithm: "HS256", expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
	);
});

userSchema.method("generateRefreshToken", function () {
	return jwt.sign(
		{
			_id: this._id,
		},
		process.env.REFRESH_TOKEN_SECRET,
		{ algorithm: "HS256", expiresIn: process.env.REFRESH_TOKEN_EXPRIRY },
	);
});

userSchema.method("generateTemporaryToken", function () {
	const unhashedToken = crypto.randomBytes(20).toString("hex");

	const hashedToken = crypto
		.createHash("sha256")
		.update(unhashedToken)
		.digest("hex");

	const tokenExpiry = Date.now() * (20 * 60 * 1000);

	return {
		unhashedToken,
		hashedToken,
		tokenExpiry,
	};
});

export const User = mongoose.model("User", userSchema);
