const launchesMongo = require("./launches.mongo");
const planets = require("./planets.mongo");
const axios = require("axios");

const DEFAULT_FLIGHT_NUMBER = 100;
const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function existsLaunchWithId(launchID) {
  return await findLaunch({ flightNumber: launchID });
}

async function getAllLaunches(skip, limit) {
  return await launchesMongo
    .find({}, { __v: 0, _id: 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function saveLaunch(launch) {
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
  const planet = await planets.findOne({ keplerName: launch.target });

  if (!planet) {
    return new Error("No matching planet found !");
  }
  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    upcoming: true,
    success: true,
    customers: ["RK", "NASA"],
    flightNumber: newFlightNumber,
  });

  await saveLaunch(newLaunch);
}

async function findLaunch(filter) {
  return await launchesMongo.findOne(filter);
}
async function populateDatabase() {
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });
  if (response.status !== 200) {
    console.log("problem downloading data");
    throw new Error("Launch data download failed. ");
  }
  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc.payloads;
    const customers = payloads.flatMap((payload) => {
      return payload.customers;
    });

    const launch = {
      flightNumber: launchDoc.flight_number,
      upcoming: launchDoc.upcoming,
      mission: launchDoc.name,
      rocket: launchDoc.rocket.name,
      launchDate: launchDoc.date_local,
      success: launchDoc.success,
      customers,
    };
    await saveLaunch(launch);
    console.log(launch.flightNumber, launch.upcoming, launch.mission);
  }
}
async function loadLaunchesData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    mission: "FalconSat",
  });
  if (firstLaunch) {
    console.log("Launch data already exists");
    return;
  } else {
    populateDatabase();
  }
}

module.exports = {
  scheduleNewLaunch,
  getAllLaunches,
  existsLaunchWithId,
  abortLaunchById,
  loadLaunchesData,
};
