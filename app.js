const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => console.log("server running"));
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const movieConvertToCamelCase = (obj) => {
  return {
    movieID: obj.movie_id,
    directorId: obj.director_id,
    movieName: obj.movie_name,
    leadActor: obj.lead_actor,
  };
};

const directorConvertTOCamelCase = (obj) => {
  return {
    directorId: obj.director_id,
    directorName: obj.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `SELECT movie_name FROM movie`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(moviesArray.map((a) => ({ movieName: a.movie_name })));
});

app.get("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id=${movieId}`;
  const result = await db.get(getMovieQuery);
  res.send(result);
});

app.post("/movies/", async (req, res) => {
  const { directorId, movieName, leadActor } = req.body;
  const movieQuery = `INSERT INTO movie (director_id,movie_name,lead_actor) VALUES 
    (${directorId},'${movieName}','${leadActor}')`;
  await db.run(movieQuery);
  res.send("Movie Successfully Added");
});

app.put("/movies/:movieId/", async (req, res) => {
  const { directorId, movieName, leadActor } = req.body;
  const { movieId } = req.params;
  const movieQuery = `UPDATE movie 
  SET 
  director_id=${directorId},
  movie_name='${movieName}',
  lead_actor='${leadActor}'
  WHERE
  movie_id=${movieId}
  `;
  await db.run(movieQuery);
  res.send("Movie Details Updated");
});

app.delete("/movies/:movieId", async (req, res) => {
  const { movieId } = req.params;
  const movieQuery = `DELETE FROM movie 
    WHERE movie_id = ${movieId}`;
  await db.run(movieQuery);
  res.send("Movie Removed");
});

app.get("/directors/", async (req, res) => {
  const getDirector = `SELECT * FROM director;`;
  const result = await db.all(getDirector);
  res.send(result.map((a) => directorConvertTOCamelCase(a)));
});

app.get("/directors/:directorId/movies/", async (req, res) => {
  const { directorId } = req.params;
  const Query = `SELECT movie_name FROM movie WHERE director_id=${directorId}`;
  const moviesArray = await db.all(Query);
  res.send(moviesArray.map((a) => ({ movieName: a.movie_name })));
});

module.exports = app;
