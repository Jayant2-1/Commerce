import { useEffect, useState } from 'react';

export function useTypewriter(text, active, speed = 42) {
  const [display, setDisplay] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active || !text) {
      setDisplay('');
      setDone(false);
      return;
    }

    setDisplay('');
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setDisplay(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, speed);

    return () => clearInterval(id);
  }, [text, active, speed]);

  return { display, done };
}
