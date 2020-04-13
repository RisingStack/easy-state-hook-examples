import React from "react";
import { view } from "@risingstack/react-easy-state";
import pokemon from "./pokemon";

export default view(() => (
  <input value={pokemon.name.value} onChange={pokemon.name.onChange} />
));
