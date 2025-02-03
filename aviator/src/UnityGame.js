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
  const [targetMultiplier, setTargetMultiplier] = useState(1); // Target value to lerp to
  const [isTransitioning, setIsTransitioning] = useState(false); // Transition state
  const previousTargetMultiplier = useRef(targetMultiplier); // Track the last target multiplier

  const [isPlaneCrashed, setIsPlaneCrashed] = useState(false); // To toggle crashing state

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
    if (newTargetMultiplier === previousTargetMultiplier.current) {
      return; // No need to start a new transition if the target hasn't changed
    }

    setIsTransitioning(true); // Mark transition as in progress
    const startValue = inputValue;
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
      const response = await fetch("https://random-data-api.com/api/number/random_number");
      const data = await response.json();
      const newMultiplier = data["multiplier"]; // Assuming the API returns a "random_number" field

      // Simulating a boolean crash value from the API
      const crashState = data["running"]; // Randomly set true or false for demo purposes

      setTargetMultiplier(newMultiplier); // Set the new target multiplier
      setIsPlaneCrashed(crashState); // Set the new crash state

      // Start transitioning to the new multiplier
      startTransition(newMultiplier);
      
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

export default App;