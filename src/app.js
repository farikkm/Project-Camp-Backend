import cors from "cors";
import express from "express";
import dotenv from "dotenv";

dotenv.config({
	path: "./.env",
});

const app = express();

// CORS config
const whitelist = process.env.CORS_ORIGIN.split(",");
const corsOptions = {
	origin: whitelist,
	credentials: true,
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
};

// Middlewares
app.use(
	express.json({
		limit: "16kb",
	}),
);
app.use(
	express.urlencoded({
		extended: true,
		limit: "16kb",
	}),
);
app.use(express.static("public"));
app.use(cors(corsOptions));

// Routes
app.get("/", cors(corsOptions), (_, res) => {
	res.send("Hello Project Base Camp!");
});

export default app;
