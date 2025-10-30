"use client";

import { FloorData, PlanElement } from "@/constants/floorPlan";
import { UserRole } from "@/constants/roles";
import { useUser } from "@/hooks/userContext";
import { XMarkIcon } from "@heroicons/react/24/solid";
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
  currentFloor: 1 | 2;
  setCurrentFloor: (floor: 1 | 2) => void;
  clearSelectionTrigger?: number;
}

const FloorPlanEditor: FC<FloorPlanEditorProps> = ({
  originalData,
  onChange,
  editable,
  currentFloor,
  setCurrentFloor,
  clearSelectionTrigger,
}) => {
  const { user } = useUser();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<{ 1: FloorData; 2?: FloorData }>(() =>
    JSON.parse(JSON.stringify(originalData))
  );

  const imageCache = useRef<Record<string, HTMLImageElement>>({});

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

  useEffect(() => {
    setSelectedElement(null);
  }, [clearSelectionTrigger]);

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

      if (el.imageUrl) {
        const key = el.imageUrl;
        if (imageCache.current[key]) {
          ctx.drawImage(imageCache.current[key], x, y, w, h);
        } else {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = key;
          img.onload = () => {
            imageCache.current[key] = img;
            drawAllFloorPlans();
          };
        }
      } else {
        ctx.strokeStyle = isRoom ? "#1f2937" : "#9ca3af";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = isRoom ? "#f3f4f6" : "#e5e7eb";
        ctx.fillRect(x + 1.5, y + 1.5, w - 3, h - 3);
      }

      ctx.fillStyle =
        el.name === selectedElement?.name
          ? "#2563eb"
          : isRoom
          ? "#374151"
          : "#6b7280";
      ctx.font = "14px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(el.name, x + w / 2, y + h / 2, w);

      if (selectedElement && el.name === selectedElement.name) {
        ctx.fillStyle = "#2563eb";
        ctx.fillRect(x + w - 10, y + h - 10, 10, 10);
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
    if (!editable || user?.role !== UserRole.MEMBER) return;

    const { x: cx, y: cy } = getCanvasCoordinates(e);
    const clicked = getClickedElement(cx, cy);

    if (clicked) {
      setSelectedElement(clicked);
      const x = clicked.x * dynamicScale + dimensions.offsetX;
      const y = clicked.y * dynamicScale + dimensions.offsetY;
      const w = clicked.width * dynamicScale;
      const h = clicked.height * dynamicScale;

      const resizeArea = 12;
      if (
        cx >= x + w - resizeArea &&
        cx <= x + w &&
        cy >= y + h - resizeArea &&
        cy <= y + h
      ) {
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
    if (!editable || user?.role !== UserRole.MEMBER) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x: cx, y: cy } = getCanvasCoordinates(e);

    canvas.style.cursor = "default";

    if (selectedElement && !dragging && !resizing.element) {
      const x = selectedElement.x * dynamicScale + dimensions.offsetX;
      const y = selectedElement.y * dynamicScale + dimensions.offsetY;
      const w = selectedElement.width * dynamicScale;
      const h = selectedElement.height * dynamicScale;
      const resizeArea = 12;

      if (
        cx >= x + w - resizeArea &&
        cx <= x + w &&
        cy >= y + h - resizeArea &&
        cy <= y + h
      ) {
        canvas.style.cursor = "nwse-resize";
      }
    } else if (dragging || resizing.element) {
      canvas.style.cursor = "grabbing";
    }

    if (dragging && selectedElement) {
      const dx = (cx - dragStartRef.current.x) / dynamicScale;
      const dy = (cy - dragStartRef.current.y) / dynamicScale;
      selectedElement.x = originalPositionRef.current.x + dx;
      selectedElement.y = originalPositionRef.current.y + dy;
      setData({ ...data });
      requestAnimationFrame(() => onChange?.({ ...data }));
    } else if (resizing.element) {
      const el = resizing.element;
      const baseX = el.x * dynamicScale + dimensions.offsetX;
      const baseY = el.y * dynamicScale + dimensions.offsetY;
      el.width = Math.max(0.1, (cx - baseX) / dynamicScale);
      el.height = Math.max(0.1, (cy - baseY) / dynamicScale);
      setData({ ...data });
      requestAnimationFrame(() => onChange?.({ ...data }));
    }
  };

  const handleMouseUp = () => {
    if (!editable || user?.role !== UserRole.MEMBER) return;
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

  useEffect(() => {
    if (originalData && !dragging && !resizing.element) {
      setData(JSON.parse(JSON.stringify(originalData)));
    }
  }, [originalData, dragging, resizing.element]);

  useEffect(() => {
    setSelectedElement(null);
  }, [currentFloor]);

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
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentFloor === 1
                ? "bg-gray-800 text-white shadow-md"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            1階
          </button>
        )}
        {originalData[2] && (
          <button
            onClick={() => setCurrentFloor(2)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentFloor === 2
                ? "bg-gray-800 text-white shadow-md"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            2階
          </button>
        )}
      </div>

      {selectedElement && user?.role === UserRole.MEMBER && (
        <button
          type="button"
          onClick={() => {
            setData((prev) => {
              const floor = prev[currentFloor];
              if (!floor) return prev;
              const newObjects =
                floor.objects?.filter((o) => o.name !== selectedElement.name) ??
                [];
              const newFloor = { ...floor, objects: newObjects };
              const newData = { ...prev, [currentFloor]: newFloor };
              requestAnimationFrame(() => onChange?.(newData));
              return newData;
            });
            setSelectedElement(null);
          }}
          className="absolute z-10 w-6 h-6 flex items-center justify-center
               bg-white border border-red-400 rounded-full shadow-sm
               hover:bg-red-500 hover:text-white transition-colors
               cursor-pointer"
          style={{
            top:
              dimensions.offsetY + selectedElement.y * dynamicScale - 8 + "px",
            left:
              dimensions.offsetX +
              selectedElement.x * dynamicScale +
              selectedElement.width * dynamicScale -
              8 +
              "px",
          }}
          title="削除"
        >
          <XMarkIcon className="w-4 h-4 text-red-500 hover:text-white" />
        </button>
      )}

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
