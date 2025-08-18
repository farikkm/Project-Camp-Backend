import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js";

const validate = (req, res, next) => {
	const errors = validationResult(req);

	if (errors.isEmpty()) {
		return next();
	}

	const extractedErrors = errors
		.array()
		.map((err) => ({ [err.path]: err.msg }));

	res
		.status(422)
		.json(new ApiError(422, "Recieved data is not valid", extractedErrors));
};

export default validate;
