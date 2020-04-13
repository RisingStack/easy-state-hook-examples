import { useEffect } from "react";
import useTitle from "./useTitle";
import useFetch from "./useFetch";

const POKE_API = "https://pokeapi.co/api/v2/pokemon/";

export default function usePokemon(initialName) {
  const [name, onNameChange] = useTitle(initialName);
  const [data, fetch] = useFetch(POKE_API);

  useEffect(() => {
    fetch(name);
  }, [fetch, name]);

  return { ...data, name, onNameChange };
}
