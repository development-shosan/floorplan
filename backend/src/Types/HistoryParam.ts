/**
 *  HistoryParam.ts
 */
import { JsonValue } from '@prisma/client/runtime/edge';

export type HistoryInfo = {
    id: number;
    title: string | null;
    favoriteCount: number;
    companyId: number;
    companyName: string;
    userId: number;
    userName: string | null;
    customerName: string | null;
    createdAt: Date;
    createdById: number;
    updatedAt: Date;
    updatedById: number;
    conditions: JsonValue;
};

export type HistoryInfoOutput = {
    histories: HistoryInfo[];
};

export type HistoryChildInfo = {
    id: number;
    historyParentId: number;
    patternName: string | null;
    floorplanData: JsonValue;
    isPatternFavorite: boolean;
    tag: string | null;
    isDownloaded: boolean;
    pdfPath: string | null;
    constructionName: string | null;
    scale: string | null;
    drawingFormat: string | null;
    createdAt: Date;
    createdById: number;
};

export type HistoryChildInfoOutput = {
    historyChildren: HistoryChildInfo[];
};
