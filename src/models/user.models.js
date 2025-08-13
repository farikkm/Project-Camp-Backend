import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

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
	if (!this.isModified) return next();

	this.password = await bcrypt.hash(this.password, 10);
	next();
});

userSchema.method("isPasswordCorrect", async function (password) {
	return await bcrypt.compare(password, this.password);
});

export const User = mongoose.model("User", userSchema);
