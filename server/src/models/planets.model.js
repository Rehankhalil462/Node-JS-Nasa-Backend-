const fs = require("fs");
const { parse } = require("csv-parse");
const mongoose = require("mongoose");
const planets = require("./planets.mongo");

const habitablePlanets = [];

async function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream("data/kepler_data.csv")
      .pipe(parse({ columns: true, comment: "#" }))
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          savePlanet(data);
        }
      })
      .on("error", (err) => {
        console.log("Error : ", err);
        reject(err);
      })
      .on("end", async () => {
        const planetsFound = await getAllPlanets();
        console.log(
          "Habitable Planets Count : ",
          `${planetsFound.length} planets found !`
        );
        console.log(
          "Habitable Planets Name : ",
          planetsFound.map((planet) => planet)
        );
        resolve();
      });
  });
}
function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet.koi_insol > 0.36 &&
    planet.koi_insol < 1.11 &&
    planet.koi_prad < 1.6
  );
}

async function savePlanet(planet) {
  try {
    await planets.updateOne(
      { keplerName: planet.kepler_name },
      { keplerName: planet.kepler_name },
      { upsert: true }
    );
  } catch (error) {
    console.log("could not save planets : ", error);
  }
}

async function getAllPlanets() {
  return await planets.find({}, { __v: 0, _id: 0 });
}

module.exports = { getAllPlanets, loadPlanetsData };
