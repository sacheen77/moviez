import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import defaultPoster from "../assets/defaultPoster.jpg";
import "./Home.css";

export default function Home() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/movies")
      .then((res) => setMovies(res.data))
      .catch(() => setMovies([]));
  }, []);

  return (
    <div className="container">
      <h1 className="title">Movie Collection</h1>

      <div className="movie-grid">
        {movies.map((movie) => (
          <Link to={`/movie/${movie.id}`} key={movie.id} className="movie-card">
            <img
              src={movie.poster || defaultPoster}
              onError={(e) => (e.target.src = defaultPoster)}
              alt={movie.title}
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
