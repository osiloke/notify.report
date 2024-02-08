import { useEffect, useRef, useState } from "react";

// Types
export type TimerCallbacks = {
  /** Callback fired every 1s while timer is running. */
  onTick?: (time: number) => void;
  /** Callback fired when timer finishes. Not fired on loop */
  onFinish?: () => void;
};

export interface UseTimerProps extends TimerCallbacks {
  /** Refresh rate of the timer in ms. */
  refreshRate: number;

  /** Duration of the timer in seconds. */
  duration: number;

  /** Loop the timer */
  loop: boolean;
}

// Hook functionality
const useTimer = ({
  duration: _duration,
  refreshRate,
  loop = false,
  onTick = () => {},
  onFinish = () => {},
}: UseTimerProps) => {
  const timeIncrement = 1 * (refreshRate / 1000); // ms

  const [duration, setDuration] = useState(_duration);
  const [time, setTime] = useState(0);
  const [timer, setTimer] = useState<ReturnType<typeof setInterval>>();
  const isRunning = Boolean(timer && time);
  const callbackRef = useRef<TimerCallbacks>();

  /**
   * Update callback ref on changes to callback props
   * to allow changes to reflect within setInterval's callback.
   */
  useEffect(() => {
    callbackRef.current = { onTick, onFinish };
  }, [onTick, onFinish]);

  /**
   * Update duration to duration props
   * to allow changes to reflect within setInterval's callback.
   */
  useEffect(() => {
    setDuration(_duration);
  }, [_duration]);

  /**
   * Starts a stopped timer.
   */
  const start = () => {
    const newTimer = setInterval(() => {
      setTime((prevTime) => {
        const updatedTime = prevTime + timeIncrement;

        if (updatedTime >= duration) {
          if (loop) seek(0);
          else {
            clearInterval(newTimer);
            callbackRef.current?.onFinish?.();
          }
        }

        callbackRef.current?.onTick?.(updatedTime);
        return updatedTime;
      });
    }, refreshRate);

    setTimer(newTimer);
  };

  /**
   * Stops a running timer.
   */
  const stop = () => {
    clearInterval(timer);
    setTimer(undefined);
  };

  /**
   * Restarts a running or finished timer.
   */
  const restart = () => {
    setTime(0);

    if (!timer) start();
  };

  /**
   * Sets time to a specified time.
   */
  const seek = (time: number) => {
    setTime(time);
  };

  /**
   * Cleanup by clearing interval on unmount.
   */
  useEffect(() => () => clearInterval(timer), []);

  return { time, timer, isRunning, start, stop, restart, seek };
};

export default useTimer;
