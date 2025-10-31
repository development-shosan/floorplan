import { Prisma } from '@prisma/client';

export type RequestPayload = {
    title: string;
    clientName: string;
    layout_conditions: {
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
