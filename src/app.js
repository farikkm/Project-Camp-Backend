import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// Import routes
import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";

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
app.use(cookieParser());

// Imported routes
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);

// Routes
app.get("/", cors(corsOptions), (_, res) => {
	res.send("Hello Project Base Camp!");
});

export default app;
