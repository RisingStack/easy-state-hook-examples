import React from "react";
import useFetch from "./useFetch";

const POKE_API = "https://pokeapi.co/api/v2/pokemon/";

export default () => {
  const [{ data, error, loading }, fetch] = useFetch(POKE_API);

  return (
    <>
      <button onClick={() => fetch("ditto")}>Fetch pokemon</button>
      <div>
        {loading ? "Loading ..." : error ? "Error!" : JSON.stringify(data)}
      </div>
    </>
  );
};
