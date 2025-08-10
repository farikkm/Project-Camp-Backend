console.log("Hello Node.js and my favourite helper Warp!");

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
