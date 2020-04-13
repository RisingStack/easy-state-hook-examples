import { store } from "@risingstack/react-easy-state";

export default function fetchStore(baseURL) {
  const resource = store({
    async fetch(path) {
      resource.loading = true;
      try {
        resource.data = await fetchJSON(baseURL + path);
        resource.error = undefined;
      } catch (error) {
        resource.error = error;
      } finally {
        resource.loading = false;
      }
    }
  });
  return resource;
}

function fetchJSON(url) {
  return fetch(url).then(resp => resp.json());
}
