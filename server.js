import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const username = process.env.username;
const db = process.env.database;

console.log(`Hello, ${username}`);

console.log("Hello Node.js and my favourite helper Warp!");

console.log(`It's my ${db}`);

matrix(1, 0, 0, 0, 1, 0, 0, 0, 1);

// prettier-ignore
matrix(
  1, 0, 0,
  0, 1, 0,
  0, 0, 1
)

function matrix(...args) {
  return args;
}
