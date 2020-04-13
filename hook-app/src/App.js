import React, { useState, useCallback, useEffect } from "react";

export default () => {
  const [title, setTitle] = useState("App title");
  const onChange = useCallback(ev => setTitle(ev.target.value), [setTitle]);
  useEffect(() => {
    document.title = title;
  }, [title]);

  return <input value={title} onChange={onChange} />;
};
