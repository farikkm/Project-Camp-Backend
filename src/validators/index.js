import { body } from "express-validator";

const userRegistrationValidator = () => {
	return [
		body("email")
			.trim()
			.notEmpty()
			.withMessage("Email cannot be empty")
			.isEmail()
			.withMessage("Enter a valid email. Ex.: mail@mail.com"),
		body("username")
			.trim()
			.notEmpty()
			.withMessage("Username cannot be empty")
			.isLowercase()
			.withMessage("Username must be in lower case")
			.isLength({ min: 3, max: 10 })
			.withMessage("Username must have 3 to 10 characters"),
		body("password")
			.trim()
			.notEmpty()
			.withMessage("Password cannot be empty")
			.isLength({ min: 6, max: 30 })
			.withMessage("Password must have 6 to 30 characters"),
		body("fullname").optional().trim(),
	];
};

export { userRegistrationValidator };
