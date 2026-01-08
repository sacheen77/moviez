const request = require("supertest");
const { app } = require("../src/app");

describe("Movies API", () => {

  it("GET /movies should return movie list", async () => {
    const res = await request(app).get("/movies");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("GET /movies/:id should return single movie", async () => {
    const res = await request(app).get("/movies/1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("title");
  });

  it("GET /movies/:id should return 404 for invalid id", async () => {
    const res = await request(app).get("/movies/999");

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Movie not found");
  });

});
