import React, { useEffect, useRef, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import "./App.css";

function App() {
  const { unityProvider, sendMessage, isLoaded } = useUnityContext({
    loaderUrl: "/aviator/Build//aviator.loader.js",
    dataUrl: "/aviator/Build//aviator.data",
    frameworkUrl: "/aviator/Build//aviator.framework.js",
    codeUrl: "/aviator/Build//aviator.wasm",
  });

  const unityCanvasRef = useRef(null);
  const [inputValue, setInputValue] = useState(0); // Current multiplier value
  const [isTransitioning, setIsTransitioning] = useState(false); // Transition state
  const [isPlaneCrashed, setIsPlaneCrashed] = useState(false); // To toggle crashing state
  const previousTargetMultiplier = useRef(1); // Track previous target multiplier
  const inputValueRef = useRef(inputValue); // Track the latest inputValue (to avoid reset)

  // Function to send the current value to Unity if Unity is loaded
  const sendToUnity = (value) => {
    if (isLoaded) {
      sendMessage("GameManager", "multiplier", value);
    } else {
      console.log("Unity is not loaded yet. Skipping sendMessage.");
    }
  };

  // Function to handle lerp transition to the new target multiplier
  const startTransition = (newTargetMultiplier) => {
    if (newTargetMultiplier === previousTargetMultiplier.current || isPlaneCrashed) {
      return; // Don't start a new transition if the target hasn't changed or plane is crashed
    }

    setIsTransitioning(true); // Mark transition as in progress
    const startValue = inputValueRef.current; // Use ref to avoid reset on re-render
    const startTime = Date.now();
    const transitionDuration = 1000; // Transition duration in ms (1 second)

    const animateTransition = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / transitionDuration, 1); // Progress from 0 to 1

      // Calculate the lerped value (interpolated between start and target)
      let lerpedValue = startValue + (newTargetMultiplier - startValue) * progress;

      // Round the lerped value to 2 decimal places
      lerpedValue = Math.round(lerpedValue * 100) / 100;

      setInputValue(lerpedValue);  // Update state with lerped value
      inputValueRef.current = lerpedValue; // Update the ref with the latest value

      // Send the lerped value to Unity
      sendToUnity(lerpedValue);

      // Continue animating if not yet finished
      if (progress < 1) {
        requestAnimationFrame(animateTransition); // Continue the animation
      } else {
        setIsTransitioning(false); // Transition is complete
        previousTargetMultiplier.current = newTargetMultiplier; // Update the ref
      }
    };

    animateTransition(); // Start the animation
  };

  // Function to fetch data (multiplier and crash state) from the backend API
  const fetchData = async () => {
    try {
      const response = await fetch("http://192.168.31.3:7777/v1/virtual/aviator/getCurrentGame");
      const data = await response.json();
      const newMultiplier = data["multiplierRange"]; // Assuming the API returns a "random_number" field

      // Simulating a boolean crash value from the API
      const crashState = data["isAlive"]; // Randomly set true or false for demo purposes

      setIsPlaneCrashed(crashState); // Set the new crash state

      // If the plane is not crashed, we start transitioning to the new multiplier
      if (crashState && newMultiplier !== previousTargetMultiplier.current) {
        startTransition(newMultiplier); // Start transitioning if the new multiplier is different
      }

      // If the plane is crashed, reset multiplier to 1
      if (!crashState) {
        setInputValue(1); // Reset multiplier to 1
        inputValueRef.current = 1; // Update the ref to match the reset value
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Set an interval to fetch the new target multiplier and crash state every second
  useEffect(() => {
    if (isLoaded) {
      const intervalId = setInterval(() => {
        fetchData(); // Fetch the new data (multiplier and crash state)
      }, 1000); // 1000 ms = 1 second

      // Cleanup the interval when the component unmounts
      return () => clearInterval(intervalId);
    }
  }, [isLoaded]); // Wait for Unity to load before starting the interval

  // Send the current plane crash state to Unity
  useEffect(() => {
    if (isLoaded) {
      sendMessage("GameManager", "crashingPlane", isPlaneCrashed ? "true" : "false"); // Send the crash state as a string
    }
  }, [isPlaneCrashed, isLoaded]); // Send updated crash state to Unity when it changes

  return (
    <div className="unity-container">
      <Unity unityProvider={unityProvider} canvasRef={unityCanvasRef} />
      <p>Current Multiplier: {inputValue.toFixed(2)}</p> {/* Display the current multiplier */}
      <p>Plane Crashed: {isPlaneCrashed ? "Yes" : "No"}</p> {/* Display the current crash state */}
    </div>
  );
}