import { useState, useEffect } from "react";

export function useLocalStorageState(initialState, keyName) {
  // const [watched, setWatched] = useState([]);
  const [value, setvalue] = useState(function () {
    const storedValue = JSON.parse(localStorage.getItem(keyName));
    console.log(storedValue);
    return storedValue ? storedValue : initialState;
  });

  useEffect(
    function () {
      localStorage.setItem(keyName, JSON.stringify(value));
    },
    [value, keyName]
  );
  return [value, setvalue];
}
