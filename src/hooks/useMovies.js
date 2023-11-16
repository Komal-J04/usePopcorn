import { useState, useEffect } from "react";

export function useMovies(query, callback, KEY) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //the useEffect hook registers(the code should not run when the component renders but after it has been painted onto the screen - executed after render) an effect
  //the function(1st argument) is called effect and it contains the code that we want to run as a side effect, 2nd argument-dependency array
  useEffect(
    function () {
      callback?.();

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
      movieFetch();

      //this works because each time there is a new alphabet=>re-render; the cleanup function would be called which will abort the request
      return function () {
        controller.abort();
      };
    },
    [query]
  );
  //dependency array - tells react when to run the effect,effect is executed whenever 1 of the dependencies changes

  return [movies, error, loading];
}
