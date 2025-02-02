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
  const [shouldCrash, setShouldCrash] = useState(false); // Boolean to control crashPlane behavior

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
      }
    };

    animateTransition(); // Start the animation
  };

  // Fetch data from the backend to get the new target multiplier and boolean value for crashPlane
  const fetchData = async () => {
    try {
      const response = await fetch("https://random-data-api.com/api/number/random_number");
      const data = await response.json();
      
      // Assuming the API returns a "random_number" field for the multiplier and "should_crash" boolean field for crashPlane
      const newMultiplier = data["multiplier"]; // Get the new multiplier value
      const shouldCrashValue = data["running"]; // Get the boolean value for crashPlane

      setTargetMultiplier(newMultiplier); // Set the new target multiplier
      startTransition(newMultiplier); // Start transitioning to the new multiplier

      // Set the value for whether or not to crash the plane
      setShouldCrash(shouldCrashValue);

      // Call crashPlane with the boolean value
      crashPlane(shouldCrashValue); // Pass the boolean value to crashPlane

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Set an interval to fetch the new target multiplier and boolean value every second
  useEffect(() => {
    if (isLoaded) {
      const intervalId = setInterval(() => {
        fetchData(); // Fetch the new target multiplier and crash boolean every second
      }, 1000); // 1000 ms = 1 second

      // Cleanup the interval when the component unmounts
      return () => clearInterval(intervalId);
    }
  }, [isLoaded]); // Wait for Unity to load before fetching data

  // Function to call crashPlane with a boolean parameter
  const crashPlane = (shouldCrash) => {
    if (isLoaded) {
      sendMessage("GameManager", "crashPlane", shouldCrash); // Pass the boolean value to crashPlane
    } else {
      console.log("Unity is not loaded yet. Skipping crashPlane call.");
    }
  };

  return (
    <div className="unity-container">
      <Unity unityProvider={unityProvider} canvasRef={unityCanvasRef} />
      <p>Current Multiplier: {inputValue.toFixed(2)}</p> {/* Display the current multiplier */}
      <p>Should Crash Plane: {shouldCrash ? "Yes" : "No"}</p> {/* Display whether crashPlane was triggered */}
    </div>
  );
}

export default App;