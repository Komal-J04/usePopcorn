import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
// import StarRating from "./StarRating";

// function Test() {
//   const [movieRating, setMovieRating] = useState(0);

//   return (
//     <div>
//       <StarRating maxRating={10} onSetRating={setMovieRating}></StarRating>

//       <p>This movie is rated {movieRating} stars.</p>
//     </div>
//   );
// }

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    {/* <StarRating
      messages={["Terrible", "Bad", "Okay", "Good", "Amazing"]}
      defaultRating={3}
    ></StarRating>
    <StarRating
      maxRating={10}
      size={24}
      color="cyan"
      className="test"
    ></StarRating>
    <Test></Test> */}
  </React.StrictMode>
);
