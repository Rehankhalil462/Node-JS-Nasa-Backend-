const fs = require("fs");
const { parse } = require("csv-parse");

const habitablePlanets = [];

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream("data/kepler_data.csv")
      .pipe(parse({ columns: true, comment: "#" }))
      .on("data", (data) => {
        if (isHabitablePlanet(data)) {
          habitablePlanets.push(data);
        }
      })
      .on("error", (err) => {
        console.log("Error : ", err);
        reject(err);
      })
      .on("end", () => {
        console.log(
          "Habitable Planets Count : ",
          `${habitablePlanets.length} planets found !`
        );
        console.log(
          "Habitable Planets Name : ",
          habitablePlanets.map((planet) => planet.kepler_name)
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

module.exports = { planets: habitablePlanets, loadPlanetsData };
