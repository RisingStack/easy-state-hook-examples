import React from "react";
import { view } from "@risingstack/react-easy-state";
import pokemon from "./pokemon";

export default view(() => (
  <div>
    {pokemon.data.loading
      ? "Loading ..."
      : pokemon.data.error
      ? "Error!"
      : JSON.stringify(pokemon.data.data)}
  </div>
));
