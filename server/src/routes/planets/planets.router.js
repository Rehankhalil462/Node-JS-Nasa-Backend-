const express = require("express");
const { httpgetAllPlanets } = require("./planets.controllers");

const planetsRouter = express.Router();

planetsRouter.get("/planets", httpgetAllPlanets);

module.exports = planetsRouter;
