export interface PlanElement {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FloorData {
  rooms: PlanElement[];
  objects: PlanElement[];
}

export interface FloorPlanData {
  "1": FloorData;
  "2"?: FloorData;
}
