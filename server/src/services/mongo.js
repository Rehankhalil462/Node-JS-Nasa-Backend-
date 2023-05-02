const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.once("open", () => {
  console.log("db is connected");
});

mongoose.connection.once("error", (error) => {
  console.log(error);
});

async function mongoDBConnect() {
  await mongoose.connect(MONGO_URL);
}

async function mongoDBDisconnect() {
  await mongoose.disconnect();
}

module.exports = { mongoDBConnect, mongoDBDisconnect };
