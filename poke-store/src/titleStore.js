import { store, autoEffect } from "@risingstack/react-easy-state";

export default function titleStore(initalTitle) {
  const title = store({
    value: initalTitle,
    onChange: ev => (title.value = ev.target.value)
  });
  autoEffect(() => (document.title = title.value));
  return title;
}
