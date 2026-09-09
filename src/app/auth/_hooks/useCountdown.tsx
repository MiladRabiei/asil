import { useState, useEffect, useRef, useCallback } from 'react';

const useCountdown = (initialSeconds: number) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isExpired, setIsExpired] = useState(false);
  const initialRef = useRef(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) {
      setIsExpired(true);
      return;
    }

    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  const reset = useCallback(() => {
    setSeconds(initialRef.current);
    setIsExpired(false);
  }, []);

  return { seconds, isExpired, reset };
};

export default useCountdown;
