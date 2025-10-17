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
  first_floor_area: number;
  second_floor_area: number;
  total_floor_area: number;
  "1": FloorData;
  "2"?: FloorData;
}
