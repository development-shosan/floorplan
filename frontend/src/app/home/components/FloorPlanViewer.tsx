"use client";

import { FloorData, PlanElement } from "@/constants/floorPlan";
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  FC,
  MouseEvent,
} from "react";

interface FloorPlanViewerProps {
  originalData?: {
    1?: FloorData;
    2?: FloorData;
  };
}

const FloorPlanViewer: FC<FloorPlanViewerProps> = ({ originalData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<{ 1: FloorData; 2?: FloorData }>(
    JSON.parse(JSON.stringify(originalData))
  );

  const scale = 30;
  const padding = 20;
  const canvasHeight = 350;

  const [dimensions, setDimensions] = useState({
    containerWidth: 0,
    floor1OffsetX: 0,
    floor2OffsetX: 0,
    floor1OffsetY: 0,
    floor2OffsetY: 0,
  });

  const [selectedElement, setSelectedElement] = useState<PlanElement | null>(
    null
  );
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState<{
    element: PlanElement | null;
    corner: "br" | null;
  }>({ element: null, corner: null });
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const originalPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const getFloorSize = useCallback((floor: FloorData) => {
    const rooms = floor.rooms ?? [];
    const objects = floor.objects ?? [];

    const maxX = Math.max(
      ...rooms.map((r) => r.x + r.width),
      0,
      ...objects.map((o) => o.x + o.width)
    );
    const maxY = Math.max(
      ...rooms.map((r) => r.y + r.height),
      0,
      ...objects.map((o) => o.y + o.height)
    );
    return { width: maxX * scale, height: maxY * scale };
  }, []);

  const calculateDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data[1]) return;

    const containerWidth = canvas.parentElement?.offsetWidth || 0;
    canvas.width = containerWidth;
    canvas.height = canvasHeight;

    const floor1Size = getFloorSize(data[1]);
    const hasSecondFloor = !!data[2];

    let floor1OffsetX = padding;
    let floor2OffsetX = 0;

    if (hasSecondFloor && data[2]) {
      const floor2Size = getFloorSize(data[2]);
      const halfWidth = (containerWidth - padding * 2) / 2;
      floor1OffsetX = padding + (halfWidth - floor1Size.width) / 2;
      floor2OffsetX = padding + halfWidth + (halfWidth - floor2Size.width) / 2;
      setDimensions({
        containerWidth,
        floor1OffsetX,
        floor2OffsetX,
        floor1OffsetY: (canvasHeight - floor1Size.height) / 2,
        floor2OffsetY: (canvasHeight - floor2Size.height) / 2,
      });
    } else {
      floor1OffsetX = (containerWidth - floor1Size.width) / 2;
      setDimensions({
        containerWidth,
        floor1OffsetX,
        floor2OffsetX: 0,
        floor1OffsetY: (canvasHeight - floor1Size.height) / 2,
        floor2OffsetY: 0,
      });
    }
  }, [data, getFloorSize]);

  const drawAllFloorPlans = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data[1]) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { floor1OffsetX, floor2OffsetX, floor1OffsetY, floor2OffsetY } =
      dimensions;
    const hasSecondFloor = !!data[2];

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const drawFloor = (floorNum: 1 | 2, baseX: number, baseY: number) => {
      const floor = data[floorNum];
      if (!floor) return;
      const elements = [...(floor.rooms ?? []), ...(floor.objects ?? [])];

      ctx.fillStyle = "#6b7280";
      ctx.font = "12px Inter, sans-serif";
      ctx.fillText(`${floorNum}F`, baseX, baseY - 15);

      elements.forEach((el) => {
        const x = el.x * scale + baseX;
        const y = el.y * scale + baseY;
        const w = el.width * scale;
        const h = el.height * scale;
        const type = (floor.rooms ?? []).includes(el) ? "room" : "object";

        ctx.strokeStyle = type === "room" ? "#1f2937" : "#9ca3af";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = type === "room" ? "#f3f4f6" : "#e5e7eb";
        ctx.fillRect(x + 1.5, y + 1.5, w - 3, h - 3);

        ctx.fillStyle =
          el === selectedElement
            ? "#2563eb"
            : type === "room"
            ? "#374151"
            : "#6b7280";
        ctx.font = "10px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(el.name, x + w / 2, y + h / 2, w);

        if (el === selectedElement && type === "object") {
          ctx.fillRect(x + w - 6, y + h - 6, 6, 6);
        }
      });
    };

    drawFloor(1, floor1OffsetX, floor1OffsetY);
    if (hasSecondFloor && data[2]) drawFloor(2, floor2OffsetX, floor2OffsetY);

    if (hasSecondFloor) {
      ctx.beginPath();
      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 1;
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
    }
  }, [data, dimensions, selectedElement]);

  const getClickedElement = (mx: number, my: number): PlanElement | null => {
    const floors: [FloorData, number][] = [];
    if (data[1]) floors.push([data[1], dimensions.floor1OffsetX]);
    if (data[2]) floors.push([data[2], dimensions.floor2OffsetX]);

    for (const [floor, offsetX] of floors) {
      const offsetY =
        floor === data[1] ? dimensions.floor1OffsetY : dimensions.floor2OffsetY;
      const found = floor.objects?.find((el) => {
        const x = el.x * scale + offsetX;
        const y = el.y * scale + offsetY;
        const w = el.width * scale;
        const h = el.height * scale;
        return mx >= x && mx <= x + w && my >= y && my <= y + h;
      });
      if (found) return found;
    }
    return null;
  };

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const clicked = getClickedElement(mx, my);

    if (clicked) {
      setSelectedElement(clicked);
      const floorNum = data[1]?.objects?.includes(clicked) ? 1 : 2;
      const offsetX =
        floorNum === 1 ? dimensions.floor1OffsetX : dimensions.floor2OffsetX;
      const offsetY =
        floorNum === 1 ? dimensions.floor1OffsetY : dimensions.floor2OffsetY;

      const x = clicked.x * scale + offsetX;
      const y = clicked.y * scale + offsetY;
      const w = clicked.width * scale;
      const h = clicked.height * scale;

      if (mx >= x + w - 6 && mx <= x + w && my >= y + h - 6 && my <= y + h) {
        setResizing({ element: clicked, corner: "br" });
      } else {
        setDragging(true);
        dragStartRef.current = { x: mx, y: my };
        originalPositionRef.current = { x: clicked.x, y: clicked.y };
      }
    } else {
      setSelectedElement(null);
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!dragging && !resizing.element) return;
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (dragging && selectedElement) {
      const dx = (mx - dragStartRef.current.x) / scale;
      const dy = (my - dragStartRef.current.y) / scale;
      setData((prev) => {
        selectedElement.x = originalPositionRef.current.x + dx;
        selectedElement.y = originalPositionRef.current.y + dy;
        return { ...prev };
      });
    } else if (resizing.element) {
      const el = resizing.element;
      const floorNum = data[1]?.objects?.includes(el) ? 1 : 2;
      const offsetX =
        floorNum === 1 ? dimensions.floor1OffsetX : dimensions.floor2OffsetX;
      const offsetY =
        floorNum === 1 ? dimensions.floor1OffsetY : dimensions.floor2OffsetY;

      const baseX = el.x * scale + offsetX;
      const baseY = el.y * scale + offsetY;
      el.width = Math.max(0.1, (mx - baseX) / scale);
      el.height = Math.max(0.1, (my - baseY) / scale);
      setData((prev) => ({ ...prev }));
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
    setResizing({ element: null, corner: null });
  };

  useEffect(() => {
    calculateDimensions();
    window.addEventListener("resize", calculateDimensions);
    return () => window.removeEventListener("resize", calculateDimensions);
  }, [calculateDimensions]);

  useEffect(() => {
    if (dimensions.containerWidth > 0) drawAllFloorPlans();
  }, [drawAllFloorPlans, dimensions.containerWidth, selectedElement]);

  if (!originalData || !originalData[1]) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500 text-sm border border-gray-300 rounded">
        間取り図データがありません
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="border border-gray-300 rounded w-full"
        style={{ height: canvasHeight }}
      />
    </div>
  );
};

export default FloorPlanViewer;
