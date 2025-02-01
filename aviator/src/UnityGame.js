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
  const [inputValue, setInputValue] = useState(0);

  useEffect(() => {
    const resizeCanvas = () => {
      if (unityCanvasRef.current) {
        unityCanvasRef.current.width = window.innerWidth;
        unityCanvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas(); // Call once to set the initial size

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  // Function to call the API and update inputValue
const fetchData = async () => {
  try {
    // API URL to get a random number
    const response = await fetch("https://random-data-api.com/api/number/random_number");
    const data = await response.json();
    
    // Assuming the API response contains a field named 'random_number'
    setInputValue(data.random_number); // Use the returned random number value
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

  // Send inputValue to Unity if Unity is loaded
  const sendToUnity = () => {
    if (isLoaded) {
      sendMessage("GameManager", "SetTargetMultiplier", inputValue); // Pass the inputValue to Unity
    } else {
      console.log("Unity is not loaded yet. Skipping sendMessage.");
    }
  };

  // Call fetchData every second and send the updated value to Unity
  useEffect(() => {
    const fetchDataIntervalId = setInterval(() => {
      fetchData(); // Call the API every second
    }, 1000); // 1000 ms = 1 second

    const sendToUnityIntervalId = setInterval(() => {
      sendToUnity(); // Send the inputValue to Unity every second
    }, 1000); // 1000 ms = 1 second

    // Cleanup intervals on unmount
    return () => {
      clearInterval(fetchDataIntervalId);
      clearInterval(sendToUnityIntervalId);
    };
  }, [isLoaded, inputValue]); // Dependencies: isLoaded and inputValue

  // Function to send the message to Unity to call `crashPlane()` in the GameManager
  const crashPlane = () => {
    if (isLoaded) {
      sendMessage("GameManager", "crashPlane");
    } else {
      console.log("Unity is not loaded yet. Skipping crashPlane call.");
    }
  };

  // Set interval to call crashPlane every 5 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      crashPlane(); // Call crashPlane every 5 seconds
    }, 5000); // 5000 ms = 5 seconds

    // Cleanup the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [isLoaded]); // Empty dependency array ensures it runs only once on mount

  return (
    <div className="unity-container">
      <Unity unityProvider={unityProvider} canvasRef={unityCanvasRef} />
    </div>
  );
}

export default App;