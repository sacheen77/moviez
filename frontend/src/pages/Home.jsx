import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import defaultPoster from "../assets/defaultPoster.jpg";
import "./Home.css";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const API = "/api";
  

  useEffect(() => {
  axios
    .get(`${API}/movies`)
    //.get("http://localhost:5000/movies")
    .then((res) => {
      if (Array.isArray(res.data)) {
        setMovies(res.data);
      } else {
        setMovies([]);
      }
    })
    .catch(() => {
      setMovies([]);
    });
}, []);


  return (
    <div className="container">
      <h1 className="title">Sacheen Movie Collections</h1>

      <div className="movie-grid">
        {movies.length === 0 && (
          <p className="empty-text">No movies available</p>
        )}

        {movies.map((movie) => (
          <Link
            to={`/movie/${movie.id}`}
            key={movie.id}
            className="movie-card"
          >
            <img
              src={movie.poster || defaultPoster}
              alt={movie.title}
              onError={(e) => {
                e.target.src = defaultPoster;
              }}
            />

            <div className="movie-info">
              <h2>{movie.title}</h2>
              <p>{movie.genre}</p>

              <div className="meta">
                <span>⭐ {movie.rating}</span>
                <span>{movie.year}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
