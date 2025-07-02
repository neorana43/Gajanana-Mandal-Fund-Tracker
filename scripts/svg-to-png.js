const sharp = require("sharp");
const fs = require("fs");

const input = "public/app-icon.svg";
const output = "public/app-icon-512.png";

sharp(input)
  .resize(512, 512)
  .png()
  .toFile(output)
  .then(() => {
    console.log("PNG icon generated:", output);
  })
  .catch((err) => {
    console.error("Error generating PNG icon:", err);
    process.exit(1);
  });
