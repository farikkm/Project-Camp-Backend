import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { User } from "./models/user.models.js";

dotenv.config({
	path: "./.env",
});

const port = process.env.PORT || 3000;

async function main() {
	await connectDB();

	// const new_user = new User({
	// 	username: "fariz",
	// 	password: "2134",
	// 	fullname: "fariz mirzayev",
	// });

	app.listen(port, () => {
		console.log(`Example app listening on port ${port}`);
	});
}

main();
