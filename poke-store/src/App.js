import React from "react";
import { view } from "@risingstack/react-easy-state";
import pokeStore from "./pokeStore";

export default view(() => {
  const pokemon = pokeStore("ditto");

  return (
    <>
      <input value={pokemon.name.value} onChange={pokemon.name.onChange} />
      <div>
        {pokemon.data.loading
          ? "Loading ..."
          : pokemon.data.error
          ? "Error!"
          : JSON.stringify(pokemon.data.data)}
      </div>
    </>
  );
});
