"use client";

import { FloorData } from "@/constants/floorPlan";
import React, { useRef, useEffect, useState, useCallback, FC } from "react";

interface FloorPlanViewerProps {
  floorData: FloorData;
  floorLabel?: string;
}

const FloorPlanPDF: FC<FloorPlanViewerProps> = ({ floorData, floorLabel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dynamicScale, setDynamicScale] = useState(1);
  const [dimensions, setDimensions] = useState({ offsetX: 0, offsetY: 0 });
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const imageCache = useRef<Record<string, HTMLImageElement>>({});

  const getFloorSize = useCallback((floor: FloorData) => {
    const rooms = floor.rooms ?? [];
    const maxX = Math.max(...rooms.map((r) => r.x + r.width), 0);
    const maxY = Math.max(...rooms.map((r) => r.y + r.height), 0);
    return { width: maxX, height: maxY };
  }, []);

  const preloadImages = useCallback(async () => {
    const objects = floorData.objects ?? [];
    const promises = objects.map((el) => {
      if (!el.imageUrl) return Promise.resolve(null);
      if (imageCache.current[el.imageUrl])
        return Promise.resolve(imageCache.current[el.imageUrl]);

      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = el.imageUrl!;
        img.onload = () => {
          imageCache.current[el.imageUrl!] = img;
          resolve(img);
        };
        img.onerror = reject;
      });
    });
    await Promise.all(promises);
    setImagesLoaded(true);
  }, [floorData.objects]);

  const calculateDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !floorData) return;

    const containerWidth = canvas.parentElement?.offsetWidth || 600;
    const floorSize = getFloorSize(floorData);

    const scaleX = containerWidth / floorSize.width;
    const newScale = scaleX * 0.8;
    const canvasHeight = floorSize.height * newScale * 1.1;

    canvas.width = containerWidth;
    canvas.height = canvasHeight;

    const offsetX = (canvas.width - floorSize.width * newScale) / 2;
    const offsetY = (canvas.height - floorSize.height * newScale) / 2;

    setDimensions({ offsetX, offsetY });
    setDynamicScale(newScale);
  }, [floorData, getFloorSize]);

  const drawFloor = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !floorData || !imagesLoaded) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const { offsetX, offsetY } = dimensions;
    const elements = [...(floorData.rooms ?? []), ...(floorData.objects ?? [])];

    elements.forEach((el) => {
      const x = el.x * dynamicScale + offsetX;
      const y = el.y * dynamicScale + offsetY;
      const w = el.width * dynamicScale;
      const h = el.height * dynamicScale;
      const isRoom = (floorData.rooms ?? []).includes(el);

      if (el.imageUrl && imageCache.current[el.imageUrl]) {
        ctx.drawImage(imageCache.current[el.imageUrl], x, y, w, h);
      } else {
        ctx.strokeStyle = isRoom ? "#1f2937" : "#9ca3af";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = isRoom ? "#f3f4f6" : "#e5e7eb";
        ctx.fillRect(x + 1.5, y + 1.5, w - 3, h - 3);

        ctx.fillStyle = isRoom ? "#374151" : "#6b7280";
        ctx.font = "24px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(el.name, x + w / 2, y + h / 2, w);
      }
    });
  }, [floorData, dynamicScale, dimensions, imagesLoaded]);

  useEffect(() => {
    preloadImages();
  }, [preloadImages]);

  useEffect(() => {
    calculateDimensions();
    window.addEventListener("resize", calculateDimensions);
    return () => window.removeEventListener("resize", calculateDimensions);
  }, [calculateDimensions]);

  useEffect(() => {
    drawFloor();
  }, [drawFloor, dynamicScale, dimensions, imagesLoaded]);

  return (
    <div className="w-full">
      {floorLabel && (
        <div className="text-center mb-2 font-semibold text-3xl">
          {floorLabel}
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full border border-gray-300 rounded"
      />
    </div>
  );
};

export default FloorPlanPDF;
