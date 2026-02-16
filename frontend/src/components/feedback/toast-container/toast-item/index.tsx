/**
 * @file src/components/feedback/toast-container/toast-item/index.tsx
 */

import { removeToast } from "@/store/toasts/toasts-slice";
import { useCallback, useEffect, useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import type { IToast } from "@/lib/types";

import styles from "./styles.module.css";

const { toast, toastExiting } = styles;

const Toast = ({ id, type, title, message }: IToast) => {
  const dispatch = useAppDispatch();

  // The progress bar width is 400 pixels, representing 100% completion.
  const totalWidth = 100;

  // Total duration in milliseconds
  const duration = 4000;

  // Interval time in milliseconds
  const intervalTime = duration / totalWidth;

  // 100% completion
  const maxProgress = 100;

  // State for CSS trigger (fadeOut keyframes)
  const [isExiting, setIsExiting] = useState(false);

  const [progressBarIndicator, setProgressBarIndicator] = useState(0);
  const [pauseProgressBarIndicator, setPauseProgressBarIndicator] =
    useState(false);

  // remove toast handler
  const closeToastHandler = useCallback(() => {
    setIsExiting(true); // Start CSS animation
    setTimeout(() => {
      dispatch(removeToast(id)); // Remove from Redux after animation
    }, 400); // Matches CSS animation duration
  }, [id, dispatch]);

  // handle mouse hover over
  const handleMouseEvent = () => {
    setPauseProgressBarIndicator((prevState) => !prevState);
  };

  // progress bar indicator increment
  useEffect(() => {
    /**
     * This ensures that if a user manually clicks the "X" button,
     * the progress bar interval stops immediately
     * and doesn't try to keep running while the toast is fading out.
     */
    if (isExiting) return;

    const timerId = setInterval(() => {
      if (!pauseProgressBarIndicator) {
        setProgressBarIndicator((prev) => {
          if (prev >= maxProgress) {
            clearInterval(timerId); // Stop the timer
            closeToastHandler(); // Trigger exit
            return prev;
          }
          return prev + 1;
        });
      }
    }, intervalTime);

    return () => clearInterval(timerId);
  }, [intervalTime, pauseProgressBarIndicator, isExiting, closeToastHandler]);

  return (
    <div
      className={`alert alert-${type} ${toast} ${isExiting ? toastExiting : ""} mb-0`}
      onMouseEnter={handleMouseEvent}
      onMouseLeave={handleMouseEvent}
    >
      <h5>{title || type}</h5>
      <p>{message}</p>
      <button type="button" className="btn-close" onClick={closeToastHandler} />
      <span
        className="placeholder"
        style={{
          width: `${progressBarIndicator}%`,
          transition: `width ${intervalTime}ms linear`,
        }}
      ></span>
    </div>
  );
};

export default Toast;
