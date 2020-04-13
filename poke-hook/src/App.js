import React from "react";
import usePokemon from "./usePokemon";

export default () => {
  const pokemon = usePokemon("ditto");

  return (
    <>
      <input value={pokemon.name} onChange={pokemon.onNameChange} />
      <div>
        {pokemon.loading
          ? "Loading ..."
          : pokemon.error
          ? "Error!"
          : JSON.stringify(pokemon.data)}
      </div>
    </>
  );
};
