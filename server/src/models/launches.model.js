const launchesMongo = require("./launches.mongo");
const planets = require("./planets.mongo");

const launches = new Map();

const DEFAULT_FLIGHT_NUMBER = 100;

const launch = {
  flightNumber: 100,
  mission: "Kepler Mission Name",
  rocket: "Explorer IS1",
  launchDate: new Date("December 27, 2030"),
  target: "Kepler-442 b",
  customer: ["RK", "NASA"],
  upcoming: true,
  success: true,
};

launches.set(launch.flightNumber, launch);

async function existsLaunchWithId(launchID) {
  return await launchesMongo.findOne({ flightNumber: launchID });
}

async function getAllLaunches() {
  return await launchesMongo.find({}, { __v: 0, _id: 0 });
}

async function saveLaunch(launch) {
  const planet = await planets.findOne({ keplerName: launch.target });

  if (!planet) {
    return new Error("No matching planet found !");
  }
  await launchesMongo.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    { upsert: true }
  );
}

async function abortLaunchById(launchID) {
  const aborted = await launchesMongo.updateOne(
    { flightNumber: launchID },
    {
      upcoming: false,
      success: false,
    }
  );

  return aborted.modifiedCount === 1 && aborted.acknowledged === true;
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesMongo.findOne().sort("-flightNumber");
  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return latestLaunch.flightNumber;
}

async function scheduleNewLaunch(launch) {
  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    upcoming: true,
    success: true,
    customers: ["RK", "NASA"],
    flightNumber: newFlightNumber,
  });

  await saveLaunch(newLaunch);
}

module.exports = {
  scheduleNewLaunch,
  getAllLaunches,
  existsLaunchWithId,
  abortLaunchById,
};
