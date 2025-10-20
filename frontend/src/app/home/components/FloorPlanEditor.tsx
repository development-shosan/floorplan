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

interface FloorPlanEditorProps {
  originalData?: { 1?: FloorData; 2?: FloorData };
  onChange?: (newData: { 1: FloorData; 2?: FloorData }) => void;
  editable?: boolean;
}

const FloorPlanEditor: FC<FloorPlanEditorProps> = ({
  originalData,
  onChange,
  editable = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<{ 1: FloorData; 2?: FloorData }>(
    JSON.parse(JSON.stringify(originalData))
  );

  const [dynamicScale, setDynamicScale] = useState(30);
  const [dimensions, setDimensions] = useState({
    containerWidth: 0,
    containerHeight: 0,
    offsetX: 0,
    offsetY: 0,
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

  const [currentFloor, setCurrentFloor] = useState<1 | 2>(1);

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
    return { width: maxX, height: maxY };
  }, []);

  const calculateDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data[currentFloor]) return;

    const containerWidth = canvas.parentElement?.offsetWidth || 0;
    const containerHeight = canvas.parentElement?.offsetHeight || 350;

    const floorSize = getFloorSize(data[currentFloor]);

    const scaleX = containerWidth / floorSize.width;
    const scaleY = containerHeight / floorSize.height;
    const newScale = Math.min(scaleX, scaleY) * 0.95;

    setDynamicScale(newScale);

    canvas.width = containerWidth;
    canvas.height = containerHeight;

    const offsetX = (containerWidth - floorSize.width * newScale) / 2;
    const offsetY = (containerHeight - floorSize.height * newScale) / 2;

    setDimensions({ containerWidth, containerHeight, offsetX, offsetY });
  }, [data, currentFloor, getFloorSize]);

  const drawAllFloorPlans = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data[currentFloor]) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const floor = data[currentFloor];
    if (!floor) return;
    const elements = [...(floor.rooms ?? []), ...(floor.objects ?? [])];

    const offsetX = dimensions.offsetX || 0;
    const offsetY = dimensions.offsetY || 0;

    elements.forEach((el) => {
      const x = el.x * dynamicScale + offsetX;
      const y = el.y * dynamicScale + offsetY;
      const w = el.width * dynamicScale;
      const h = el.height * dynamicScale;
      const isRoom = (floor.rooms ?? []).includes(el);

      ctx.strokeStyle = isRoom ? "#1f2937" : "#9ca3af";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, w, h);

      ctx.fillStyle = isRoom ? "#f3f4f6" : "#e5e7eb";
      ctx.fillRect(x + 1.5, y + 1.5, w - 3, h - 3);

      ctx.fillStyle =
        el === selectedElement ? "#2563eb" : isRoom ? "#374151" : "#6b7280";
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(el.name, x + w / 2, y + h / 2, w);

      if (el === selectedElement && !isRoom) {
        ctx.fillRect(x + w - 6, y + h - 6, 6, 6);
      }
    });
  }, [data, currentFloor, dynamicScale, selectedElement, dimensions]);

  const getCanvasCoordinates = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const cx = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const cy = ((e.clientY - rect.top) / rect.height) * canvas.height;
    return { x: cx, y: cy };
  };

  const getClickedElement = (cx: number, cy: number): PlanElement | null => {
    const floor = data[currentFloor];
    if (!floor) return null;
    const offsetX = dimensions.offsetX || 0;
    const offsetY = dimensions.offsetY || 0;

    return (
      floor.objects?.find((el) => {
        const x = el.x * dynamicScale + offsetX;
        const y = el.y * dynamicScale + offsetY;
        const w = el.width * dynamicScale;
        const h = el.height * dynamicScale;
        return cx >= x && cx <= x + w && cy >= y && cy <= y + h;
      }) || null
    );
  };

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!editable) return;
    const { x: cx, y: cy } = getCanvasCoordinates(e);
    const clicked = getClickedElement(cx, cy);

    if (clicked) {
      setSelectedElement(clicked);
      const x = clicked.x * dynamicScale + dimensions.offsetX;
      const y = clicked.y * dynamicScale + dimensions.offsetY;
      const w = clicked.width * dynamicScale;
      const h = clicked.height * dynamicScale;

      if (cx >= x + w - 6 && cx <= x + w && cy >= y + h - 6 && cy <= y + h) {
        setResizing({ element: clicked, corner: "br" });
      } else {
        setDragging(true);
        dragStartRef.current = { x: cx, y: cy };
        originalPositionRef.current = { x: clicked.x, y: clicked.y };
      }
    } else {
      setSelectedElement(null);
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!editable) return;
    if (!dragging && !resizing.element) return;
    const { x: cx, y: cy } = getCanvasCoordinates(e);

    if (dragging && selectedElement) {
      const dx = (cx - dragStartRef.current.x) / dynamicScale;
      const dy = (cy - dragStartRef.current.y) / dynamicScale;
      selectedElement.x = originalPositionRef.current.x + dx;
      selectedElement.y = originalPositionRef.current.y + dy;
      setData({ ...data });
      onChange?.({ ...data });
    } else if (resizing.element) {
      const el = resizing.element;
      const baseX = el.x * dynamicScale + dimensions.offsetX;
      const baseY = el.y * dynamicScale + dimensions.offsetY;
      el.width = Math.max(0.1, (cx - baseX) / dynamicScale);
      el.height = Math.max(0.1, (cy - baseY) / dynamicScale);
      setData({ ...data });
      onChange?.({ ...data });
    }
  };

  const handleMouseUp = () => {
    if (!editable) return;
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
  }, [
    drawAllFloorPlans,
    dimensions.containerWidth,
    dimensions.containerHeight,
    selectedElement,
    currentFloor,
  ]);

  if (!originalData || !originalData[1]) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500 text-sm border border-gray-300 rounded">
        間取り図データがありません
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div className="flex justify-center gap-4 mb-2">
        {originalData[1] && (
          <button
            onClick={() => setCurrentFloor(1)}
            className={`px-4 py-2 rounded ${
              currentFloor === 1 ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            1階
          </button>
        )}
        {originalData[2] && (
          <button
            onClick={() => setCurrentFloor(2)}
            className={`px-4 py-2 rounded ${
              currentFloor === 2 ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            2階
          </button>
        )}
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="w-full h-[calc(100vh-45vh)] border border-gray-300 rounded"
      />
    </div>
  );
};

export default FloorPlanEditor;
