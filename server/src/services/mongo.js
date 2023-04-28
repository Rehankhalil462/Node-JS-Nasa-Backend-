const mongoose = require("mongoose");

const MONGO_URL =
  "mongodb+srv://rehankhalil462:rehankhalil462@cluster0.7690a.mongodb.net/nasa?retryWrites=true&w=majority";

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
