import React, { useState, useEffect, useCallback } from 'react';
import { useContract, useContractRead, Web3Button, useContractEvents, useAddress } from "@thirdweb-dev/react";
import { useAccount } from 'wagmi'
import './Canvas.css'; // Import your CSS stylesheet
import { motion } from "framer-motion";
import { myNFTABI } from '@/myNFT';

const CONTRACT_ADDRESS = "0xa5E06C0AfD942DA2957b0cadD8e176d966e2A8e2"; // Replace with your contract address

export default function ViewPixel() {
  const { contract } = useContract(CONTRACT_ADDRESS, myNFTABI);
  const { address, isConnecting, isDisconnected } = useAccount()
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [windowPosition, setWindowPosition] = useState({ x:0, y:0 });
  const [hoveredPixel, setHoveredPixel] = useState({ x: null, y: null });
  const [clickedPixel, setClickedPixel] = useState({ x: null, y: null });
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  const { data: grid, isLoading: gridLoad } = useContractRead(contract, "activeGameId",[address]);
  const { data: burned, isLoading: burnedLoad } = useContractRead(contract, "playerGridSize",[address]);
  const WINDOW_SIZE = (() => {
    if (burned === undefined || burned === null) return 0;
    if (typeof burned === 'number') return burned;
    if (typeof burned === 'string') return parseInt(burned, 10);
    if (burned && typeof burned.toNumber === 'function') return burned.toNumber();
    return 0;
  })();
  const MAP_SIZE = 3;
  const [reloadKey, setReloadKey] = useState(0);
  const [fee, setFee] = useState(0);
  const [pixelColors, setPixelColors] = useState(Array(WINDOW_SIZE * WINDOW_SIZE).fill(0));
  const [latestCanvasSize, setLatestCanvasSize] = useState(WINDOW_SIZE);
  const [canvasSize, setCanvasSize] = useState(2);
  console.log('Connected Address:', address);
  console.log('Grid value:', grid);
  console.log('Grid Size:', burned);
  // Use the ThirdWeb useContractEvents hook to listen for "PixelChanged" events
  const { data: pixelChangedEvents = [], error: pixelChangedEventsError } = useContractEvents(contract, "ColorMine", {
    queryFilter: {
      fromBlock: 3912450, // Events starting from this block
      toBlock: 'latest', // Events up to this block
      order: "asc", // Order of events ("asc" or "desc")
    },
    subscribe: true, // Subscribe to new events
  });

  useEffect(() => {
    const newPixelColors = Array(WINDOW_SIZE * WINDOW_SIZE).fill(0);

    for (const event of pixelChangedEvents) {
      const eventData = event.data;
      console.log(eventData);
      const { x, y, color, id } = event.data;
      const relativeX = x - windowPosition.x;
      const relativeY = y - windowPosition.y;
  
      if (relativeX >= 0 && relativeX < WINDOW_SIZE && relativeY >= 0 && relativeY < WINDOW_SIZE && 
        id && grid && typeof id.toNumber === 'function' && typeof grid.toNumber === 'function' && id.toNumber() === grid.toNumber()) {
      const pixelIndex = relativeY * WINDOW_SIZE + relativeX;
      newPixelColors[pixelIndex] = color;
    }
  }
    setPixelColors(newPixelColors);
  }, [pixelChangedEvents, windowPosition, WINDOW_SIZE]);

  const decimalToHex = (decimalColor) => {
    return "#" + (decimalColor & 0x00FFFFFF).toString(16).padStart(6, '0');
  };

  const hexToDecimal = (hexColor) => {
    return parseInt(hexColor.replace(/^#/, ''), 16);
  };

  const handlePixelClick = useCallback((x, y) => {
    if (isUserRegistered) {
      setClickedPixel({ x, y });
    }
  }, [isUserRegistered]);

  const handlePixelHover = useCallback((x, y) => {
    setHoveredPixel({ x, y });
  }, []);



  const handleColorChange = (color) => {
    setSelectedColor(color.hex);
  };

  const renderCanvas = () => {
    const canvas = [];
    const adjustedPixelSize = Math.min(1600, 1600 / 40);

    for (let y = 1; y <= WINDOW_SIZE; y++) {
      const row = [];
      for (let x = 1; x <= WINDOW_SIZE; x++) {
        const pixelIndex = (y - 1) * WINDOW_SIZE + (x - 1);
        const posX = windowPosition.x + x - 1;
        const posY = windowPosition.y + y - 1;
        const decimalColor = pixelColors[pixelIndex];
        const color = decimalToHex(decimalColor);

        const pixelStyle = {
          width: `${adjustedPixelSize}px`,
          height: `${adjustedPixelSize}px`,
          backgroundColor: color,
        };

        row.push(
          <motion.div
            key={`${pixelIndex}-${decimalColor}`}
            className="pixelOnchain"
            style={pixelStyle}
            onMouseEnter={() => handlePixelHover(posX, posY)}
            onClick={() => handlePixelClick(posX, posY)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        );
      }
      canvas.push(<div key={y} className="row">{row}</div>);
    }

    return <div className="canvas">{canvas}</div>;
  };



  return (
    <div style={{}} className="canvas-container">
  
      {gridLoad ? (
        <p>Loading...</p>
      ) : grid && grid.toNumber() === 0 ? (
        <div>
          <p style={{padding:'40px'}}>start the game</p>
        </div>
      ) : (
        <div style={{}} className="pixel-canvas" key={reloadKey}>
          {renderCanvas()}
        </div>
      )}
  
    </div>
  );
  
}
