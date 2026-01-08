const express = require("express");
const cors = require("cors");
const movies = require("./movies");

const app = express();
app.use(cors());

app.get("/movies", (req, res) => {
  res.json(movies);
});

app.get("/movies/:id", (req, res) => {
  const movie = movies.find(m => m.id === Number(req.params.id));

  if (!movie) {
    return res.status(404).json({ message: "Movie not found" });
  }

  res.json(movie);
});

const PORT = process.env.PORT || 5000;

let server;
if (process.env.NODE_ENV !== "test") {
  server = app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
}

module.exports = { app, server };
