import React from "react";
import { view } from "@risingstack/react-easy-state";
import fetchStore from "./fetchStore";

const POKE_API = "https://pokeapi.co/api/v2/pokemon/";

export default view(() => {
  const { loading, data, error, fetch } = fetchStore(POKE_API);

  return (
    <>
      <button onClick={() => fetch("ditto")}>Fetch pokemon</button>
      <div>
        {loading ? "Loading ..." : error ? "Error!" : JSON.stringify(data)}
      </div>
    </>
  );
});
