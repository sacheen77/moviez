import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import defaultPoster from "../assets/defaultPoster.jpg";
import "./Home.css";
import "./MovieDetails.css";


export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const API = "/api"; 

  useEffect(() => {
    axios
      //.get(`http://localhost:5000/movies/${id}`)
      .get(`${API}/movies/${id}`)
      .then((res) => setMovie(res.data))
      .catch(() => setMovie(null));
  }, [id]);

  if (!movie) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="details-container">
      <div className="details-card">
        <img
          src={movie.poster || defaultPoster}
          alt={movie.title}
          className="details-poster"
        />

        <div className="details-info">
          <h1>{movie.title}</h1>

          <div className="chip-group">
            <span className="chip">{movie.genre}</span>
            <span className="chip">{movie.year}</span>
            <span className="chip">⭐ {movie.rating}</span>
          </div>

          <p className="description">{movie.description}</p>

          <div className="meta-box">
            <strong>Movie ID:</strong> {movie.id}
          </div>

          <Link to="/" className="back-btn">⬅ Back</Link>
        </div>
      </div>
    </div>
  );
}
