const request = require("supertest");
const app = require("../../app");
const { mongoDBConnect, mongoDBDisconnect } = require("../../services/mongo");

describe("LAUNCHES API TESTS", () => {
  beforeAll(async () => await mongoDBConnect());
  afterAll(async () => await mongoDBDisconnect());

  describe("Test GET /launches", () => {
    test("It should response with 200 success", async () => {
      const response = await request(app)
        .get("/launches")
        .expect(200)
        .expect("Content-Type", /json/);
    });
  });

  describe("Test POST /launch", () => {
    const completeLaunchData = {
      mission: "Hello World",
      rocket: "ABC 898",
      target: "Kepler-186 f",
      launchDate: "January 4, 2029",
    };

    const launchDataWithoutDate = {
      mission: "Hello World",
      rocket: "ABC 898",
      target: "Kepler-186 f",
    };

    const launchDataWithInvalidDate = {
      mission: "Hello World",
      rocket: "ABC 898",
      target: "Kepler-186 f",
      launchDate: "hahahah",
    };
    test("It should response with 201 success", async () => {
      const response = await request(app)
        .post("/launches")
        .send(completeLaunchData)
        .expect(201)
        .expect("Content-Type", /json/);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();

      const responseDate = new Date(response.body.launchDate).valueOf();

      expect(responseDate).toBe(requestDate);

      expect(response.body).toMatchObject(launchDataWithoutDate);
    });

    test("It should catch missing required properties", async () => {
      const response = await request(app)
        .post("/launches")
        .send(launchDataWithoutDate)
        .expect(400)
        .expect("Content-Type", /json/);

      expect(response.body).toStrictEqual({
        error: "Missing required launch properties.",
      });
    });
    test("It should catch invalid dates", async () => {
      const response = await request(app)
        .post("/launches")
        .send(launchDataWithInvalidDate)
        .expect(400)
        .expect("Content-Type", /json/);

      expect(response.body).toStrictEqual({
        error: "Invalid launch date .",
      });
    });
  });
});
