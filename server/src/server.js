const http = require("http");
const app = require("./app");
require("dotenv").config();

const { loadPlanetsData } = require("./models/planets.model");
const { loadLaunchesData } = require("./models/launches.model");
const { mongoDBConnect } = require("./services/mongo");

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

async function startServer() {
  await mongoDBConnect();
  await loadPlanetsData();
  await loadLaunchesData();

  server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}...`);
  });
}
startServer();
