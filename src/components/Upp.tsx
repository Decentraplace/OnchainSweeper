import { useAccount } from "wagmi";
import { useCapabilities, useWriteContracts } from "wagmi/experimental";
import { useRef, useMemo, useState, useEffect } from "react";
import { myNFTABI, myNFTAddress } from '@/myNFT';
import { HexColorPicker  } from 'react-colorful';
import { ethers } from "ethers";
import { useWriteContract } from 'wagmi'
import { FaEthereum, FaUnlock } from "react-icons/fa";
import { TfiFlag } from "react-icons/tfi";
import { parseEther } from "viem";
import { FaSave } from "react-icons/fa";
import {abi} from './abi';
import { config } from "./config";
import { useReadContract } from 'wagmi';
import { type UseAccountReturnType } from 'wagmi'
import { getAccount } from '@wagmi/core'
import { useContract, useContractRead, Web3Button, useContractEvents, useAddress } from "@thirdweb-dev/react";

const hexToDecimal = (hexColor: string): number => {
  return parseInt(hexColor.replace(/^#/, ''), 16);
};

// Define the type for a transaction
interface Transaction {
    address: typeof myNFTAddress,
    abi: typeof myNFTABI,
    functionName: "revealCell",
  args: (string | number)[];
}

interface StartGame {
  address: typeof myNFTAddress,
  abi: typeof myNFTABI,
  functionName: "startGame",
args: (string | number)[];
}



export function Upp() {
  const { contract } = useContract(myNFTAddress, myNFTABI);
  const account = useAccount();
  const { address, isConnecting, isDisconnected } = useAccount();
  const accountAddress = getAccount(config)?.address as `0x${string}`;
  const { writeContract } = useWriteContract();
  const [id, setId] = useState<string | undefined>(undefined);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedColor, setSelectedColor] = useState('#0E7490');
  const [hoveredPixel, setHoveredPixel] = useState<{ x: number, y: number } | null>(null);
  const [clickedPixels, setClickedPixels] = useState<{ x: number, y: number, color: string }[]>([]);
  const [clickedPixel, setClickedPixel] = useState<{ x: number, y: number } | null>(null);
  const [gridSize, setGridSize] = useState<number>(4); // Default grid size if result fails
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelSize = 40; // Define pixel size
  const [showMessage, setShowMessage] = useState(false);
  const { data: burned, isLoading: burnedLoad } = useContractRead(contract, "playerGridSize",[address]);
  useEffect(() => {
    if (!burnedLoad && burned) {
      setGridSize(Number(burned)); // Update the grid size based on the contract value
    }
  }, [burned, burnedLoad]);


  console.log('PlayerGridSize:',burned);
  console.log('accountAddress:',address);



  const handleMove = () => {
    setShowMessage(true);
  };

  const { writeContracts } = useWriteContracts({
    mutation: { onSuccess: (id) => setId(id) },
  });

  const { data: availableCapabilities } = useCapabilities({
    account: account?.address,
  });
  const capabilities = useMemo(() => {
    if (!availableCapabilities || !account?.chainId) return {};
    const capabilitiesForChain = availableCapabilities[account.chainId];
    if (
      capabilitiesForChain["paymasterService"] &&
      capabilitiesForChain["paymasterService"].supported
    ) {
      return {
        paymasterService: {
          url: "https://api.developer.coinbase.com/rpc/v1/base",
        },
      };
    }
    return {};
  }, [availableCapabilities, account?.chainId]);

  const handlePixelClick = (x: number, y: number) => {
    const newTransaction: Transaction = {
      address: myNFTAddress,
      abi: myNFTABI,
      functionName: "revealCell",
      args: [x, y],
    };
    setClickedPixels((prev) => {
      const updatedPixels = prev.filter(pixel => pixel.x !== x || pixel.y !== y);
      return [...updatedPixels, { x, y, color: selectedColor }];
    });
    setTransactions((prev) => [
      ...prev.filter(tx => tx.args[0] !== x || tx.args[1] !== y),
      newTransaction
    ]);
  };

  const handleSubmit = () => {
    if (transactions.length === 0) return;
    writeContracts({
      contracts: transactions,
      capabilities,
    });
    setTransactions([]);
    setClickedPixels([]);
  };

  const startGameFunction = () => {
    const startTransaction: StartGame = {
      address: myNFTAddress,
      abi: myNFTABI,
      functionName: "startGame",
      args: [],
    };
    writeContracts({
      contracts: [startTransaction],
      capabilities,
    });
    setTransactions([]);
    setClickedPixels([]);
  };

  const drawCanvas = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    clickedPixels.forEach(pixel => {
      ctx.fillStyle = pixel.color;
      ctx.fillRect(pixel.x * pixelSize, pixel.y * pixelSize, pixelSize, pixelSize);
    });
    if (hoveredPixel) {
      ctx.fillStyle = selectedColor;
      ctx.fillRect(hoveredPixel.x * pixelSize, hoveredPixel.y * pixelSize, pixelSize, pixelSize);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / pixelSize);
      const y = Math.floor((e.clientY - rect.top) / pixelSize);
      setHoveredPixel({ x, y });
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawCanvas(ctx);
      }
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / pixelSize);
      const y = Math.floor((e.clientY - rect.top) / pixelSize);
      handlePixelClick(x, y);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawCanvas(ctx);
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawCanvas(ctx);
      }
    }
  }, [clickedPixels, hoveredPixel]);

  return (
    <div className="flex flex-row" >
      <div className="mb-4" style={{ color: '#000', marginRight: '6vh', minWidth: '11vw' }}>
      <div className="bg-white p-4 rounded-lg shadow-lg text-gray-800">
        {hoveredPixel && (
          <p className="mt-2">hovered cell: X: {hoveredPixel.x}, Y: {hoveredPixel.y}</p>
        )}
        {clickedPixel && (
          <p className="mt-2">clicked cell: X: {clickedPixel.x}, Y: {clickedPixel.y}</p>
        )}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <button 
          onClick={startGameFunction} 
          className="bg-white text-black px-4 py-2 rounded hover:bg-green-500 transition w-200"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 'fit-content', marginRight: '6vh', width: 'fit-content' }}
        >
          <FaUnlock /> start game
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <button 
          onClick={handleSubmit} 
          className="bg-cyan-700 text-white px-4 py-2 rounded hover:bg-cyan-900 transition w-200"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 'fit-content', marginRight: '6vh', width: 'fit-content' }}
        >
          <TfiFlag /> reveal cell
        </button>
      </div>
   
      <div>
        <canvas
          ref={canvasRef}
          width={pixelSize * gridSize}
          height={pixelSize * gridSize}
          className="border border-gray-400 bg-black-200"
          onMouseMove={handleMouseMove}
          onClick={handleClick}
        />
      </div>
      <div style={{ position: "absolute", marginTop: '5.5vh' }}>
        <div className="bg-white p-4 rounded-lg shadow-lg text-gray-800">
          <h3 className="text-xl font-semibold mb-2">clicked cells</h3>
          <ul className="list-disc list-inside">
            {clickedPixels.map((pixel, index) => (
              <li key={index}>
                X: {pixel.x}, Y: {pixel.y}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
