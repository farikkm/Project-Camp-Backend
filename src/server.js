import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
	path: "./.env",
});

const port = process.env.PORT || 3000;

async function main() {
	await connectDB();

	app.listen(port, () => {
		console.log(`Example app listening on port ${port}`);
	});
}

main();
