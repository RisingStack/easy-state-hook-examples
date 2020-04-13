import { store, autoEffect } from "@risingstack/react-easy-state";
import titleStore from "./titleStore";
import fetchStore from "./fetchStore";

const POKE_API = "https://pokeapi.co/api/v2/pokemon/";

export default function pokeStore(initialName) {
  const pokemon = store({
    name: titleStore(initialName),
    data: fetchStore(POKE_API)
  });
  autoEffect(() => pokemon.data.fetch(pokemon.name.value));

  return pokemon;
}
