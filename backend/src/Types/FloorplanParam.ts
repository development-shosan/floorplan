import { Prisma } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/edge';

export type LayoutConditions = {
    family_composition: {
        value: string;
        unit: string;
    };
    number_of_floors: {
        value: string;
    };
    frontage: {
        value: string;
        unit: string;
    };
    depth: {
        value: string;
        unit: string;
    };
    desired_LDK_area: {
        value: string;
        unit: string;
    };
    number_of_rooms: {
        value: string;
        unit: string;
    };
    number_of_toilets: {
        value: string;
        unit: string;
    };
    commitment_flow_lines: {
        value: string;
        unit: string;
    };
};

export type RequestPayload = {
    title: string;
    clientName: string;
    layout_conditions: LayoutConditions;
};

export type CreateFloorPlanDataInput = {
    jobId: string;
    status: string;
    progress: number;
    estimatedTime: string;
    requestPayload: RequestPayload;
    requestUserId: number;
};

export type CreateHistoryParentDataInput = {
    title: string;
    conditions: Prisma.InputJsonValue;
    customerName: string;
    createdById: number;
    updatedId: number;
};

export type CreateHistoryChildDataInput = {
    historyParentId: number;
    patternName: string;
    floorplanData: Prisma.InputJsonValue;
    tag: string;
    createdById: number;
};

export type FloorplanGenerationStatus = Pick<
    CreateFloorPlanDataInput,
    'jobId' | 'status' | 'progress'
> & {
    estimatedTime: string | null;
};

export type FloorPlanGenerationJobInfor = FloorplanGenerationStatus & {
    requestPayload: RequestPayload;
    // TODO: Redefine the resultPayload type after verifying the data structure in Python
    resultPayload: any;
    requestUserId: number;
    historyParentId: number | null;
};

export type RegenerateHistoryParent = {
    title: string | null;
    customerName: string | null;
    conditions: LayoutConditions;
};

export type FloorplanRoom = {
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
};

export type FloorplanObject = FloorplanRoom & {
    imageUrl: string;
};

export type FloorData = {
    rooms: FloorplanRoom[];
    objects: FloorplanObject[];
};

export type FloorplanData = {
    first_floor_area: number;
    second_floor_area: number;
    total_floor_area: number;
    tag: string[];
    type: string;
    '1': FloorData;
    '2': FloorData;
};

export type HistoryChildFloorplanData = {
    floorplanData: FloorplanData;
};

export type FloorplanImage = {
    images: {
        name: string;
        url: string;
    }[];
};
