import { useState, useCallback } from "react";

export default function useFetch(baseURL) {
  const [state, setState] = useState({});

  const fetch = useCallback(
    async path => {
      setState({ loading: true });
      try {
        const data = await fetchJSON(baseURL + path);
        setState({ ...state, data, error: undefined });
      } catch (error) {
        setState({ ...state, error });
      } finally {
        setState(state => ({ ...state, loading: false }));
      }
    },
    [baseURL, state]
  );

  return [state, fetch];
}

function fetchJSON(url) {
  return fetch(url).then(resp => resp.json());
}
