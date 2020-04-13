import { useState, useCallback, useEffect } from "react";

export default function useTitle(initalTitle) {
  const [title, setTitle] = useState(initalTitle);
  const onChange = useCallback(ev => setTitle(ev.target.value), [setTitle]);
  useEffect(() => {
    document.title = title;
  }, [title]);
  return [title, onChange];
}
