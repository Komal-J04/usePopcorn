import { Children, useEffect, useState } from "react";
import StarRating from "./StarRating.jsx";
import { cleanup } from "@testing-library/react";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "e04ae0d9";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");

  // const [watched, setWatched] = useState([]);
  const [watched, setWatched] = useState(function () {
    return JSON.parse(localStorage.getItem("watched"));
  });

  function handleSelect(id) {
    setSelected((selected) => (id === selected ? null : id));
  }

  function handleCloseMovie() {
    setSelected(null);
    // document.title = "usePopcorn";
  }

  function handleAddWatch(movie) {
    setWatched((watched) => [...watched, movie]);
    setSelected(null);

    // by event handler
    // localStorage.setItem("watched", watched); //stale state
    // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((watched) => watched.imdbID !== id));

    // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  }

  //the useEffect hook registers(the code should not run when the component renders but after it has been painted onto the screen - executed after render) an effect
  //the function(1st argument) is called effect and it contains the code that we want to run as a side effect, 2nd argument-dependency array
  useEffect(
    function () {
      const controller = new AbortController(); //it is a native browser api which is to be used in the cleanup function

      async function movieFetch() {
        try {
          setLoading(true);
          setError("");

          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal } //connect abort controller with the fetch
          );

          if (!res.ok)
            throw new Error("Something went wrong with fetching movies");

          const data = await res.json();

          if (data.Response === "False") throw new Error("Movie not found");

          setMovies(data.Search);
        } catch (err) {
          console.error(err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }

      if (!query.length) {
        setMovies([]);
        setError("");
        return;
      }

      //close any open movie before searching for a new one
      handleCloseMovie();
      movieFetch();

      //this works because each time there is a new alphabet=>re-render; the cleanup function would be called which will abort the request
      return function () {
        controller.abort();
      };
    },
    [query]
  );
  //dependency array - tells react when to run the effect,effect is executed whenever 1 of the dependencies changes

  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(watched));
    },
    [watched]
  );

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery}></Search>
        <NumResults movies={movies}></NumResults>
      </NavBar>

      <Main>
        <Box>
          {loading && <Loader></Loader>}
          {!loading && !error && (
            <MovieList
              movies={movies}
              handleSelect={handleSelect}
              handleCloseMovie={handleCloseMovie}
            ></MovieList>
          )}
          {error && <ErrorMessage msg={error}></ErrorMessage>}
        </Box>

        <Box>
          {selected ? (
            <SelectedMovie
              selectedId={selected}
              handleCloseMovie={handleCloseMovie}
              handleAddWatch={handleAddWatch}
              watched={watched}
            ></SelectedMovie>
          ) : (
            <>
              <WatchedSummary watched={watched}></WatchedSummary>
              <WatchedList
                watched={watched}
                handleDeleteWatched={handleDeleteWatched}
              ></WatchedList>
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Button({ isOpen, setIsOpen }) {
  return (
    <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
      {isOpen ? "–" : "+"}
    </button>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo></Logo>
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ msg }) {
  return (
    <p className="error">
      <span>⛔</span>
      {msg}
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <Button isOpen={isOpen} setIsOpen={setIsOpen}></Button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, handleSelect }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          handleSelect={handleSelect}
        ></Movie>
      ))}
    </ul>
  );
}

function Movie({ movie, handleSelect }) {
  return (
    <li
      onClick={() => handleSelect(movie.imdbID)}
      style={{ cursor: "pointer" }}
    >
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function SelectedMovie({
  selectedId,
  handleCloseMovie,
  handleAddWatch,
  watched,
}) {
  const [movie, setMovie] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);

  const isWatched = watched.map((m) => m.imdbID).includes(selectedId);

  const WatchedMovieRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.rating;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      Title: movie.Title,
      Year: movie.Year,
      Poster: movie.Poster,
      imdbRating: Number(movie.imdbRating),
      Runtime: Number(movie.Runtime.split(" ")[0]),
      rating,
    };

    handleAddWatch(newWatchedMovie);
  }

  useEffect(
    function () {
      async function getMovieDetails() {
        try {
          setLoading(true);
          setError("");

          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
          );

          if (!res.ok) throw new Error("Error fetching data");

          const data = await res.json();

          setMovie(data);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            console.log(err);
            setError(error);
          }
        } finally {
          setLoading(false);
        }
      }

      getMovieDetails();
    },
    [selectedId]
  );

  useEffect(
    function () {
      if (!movie.Title) return;
      document.title = `MOVIE | ${movie.Title}`;

      //cleanup function - a function that is returned from the effect
      return function () {
        document.title = "usePopcorn";

        //closure - a fn always remembers all the variables that were present at the time and place that the fn was created
        // console.log(`Cleanup effect for ${movie.Title}`);
      };
    },

    [movie]
  );

  //attach an event listener to the entire document to react to a keypress event; touching the DOM directly(side effect)=>useEffect needed
  //we want this effect to happen only if there is some movie details open, else no
  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Escape") {
          handleCloseMovie();
        }
      }

      document.addEventListener("keydown", callback);

      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [handleCloseMovie]
  );

  return (
    <>
      {error && <ErrorMessage msg={error}></ErrorMessage>}
      {loading && <Loader></Loader>}
      {!error && !loading && (
        <div className="details">
          <header>
            <button className="btn-back" onClick={handleCloseMovie}>
              &larr;
            </button>

            <img src={movie.Poster} alt={`poster of ${movie.Title}`} />

            <div className="details-overview">
              <h2>{movie.Title}</h2>
              <p>
                {movie.Released} &bull; {movie.Runtime}
              </p>
              <p>{movie.Genre}</p>
              <p>
                <span>⭐</span>
                {movie.imdbRating} IMDb rating
              </p>
            </div>
          </header>

          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setRating}
                  ></StarRating>
                  {rating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      Add To List
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You rated this movie {WatchedMovieRating} <span>⭐</span>
                </p>
              )}
            </div>
            <p>
              <em>{movie.Plot}</em>
            </p>
            <p>Starring {movie.Actors}</p>
            <p>Directed by {movie.Director}</p>
          </section>
        </div>
      )}
    </>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(
    watched.map((movie) => movie?.imdbRating)
  ).toFixed(2);
  const avgUserRating = average(watched.map((movie) => movie?.rating)).toFixed(
    2
  );
  const avgRuntime = average(watched.map((movie) => movie?.Runtime)).toFixed(2);

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedList({ watched, handleDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          handleDeleteWatched={handleDeleteWatched}
        ></WatchedMovie>
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, handleDeleteWatched }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.rating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.Runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => handleDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
