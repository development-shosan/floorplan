import { FloorPlanData } from "./floorPlan";

interface Conditions {
  // ご家族構成
  family_composition: {
    value: number;
    unit: string;
  };
  // 階数
  number_of_floors: {
    value: string;
  };
  // 間口
  frontage: {
    value: number;
    unit: string;
  };
  // 奥行き
  depth: {
    value: number;
    unit: string;
  };
  // LDK希望面積
  desired_LDK_area: {
    value: number;
    unit: string;
  };
  // 居室数
  number_of_rooms: {
    value: string;
    unit: string;
  };
  // トイレ
  number_of_toilets: {
    value: string;
    unit: string;
  };
  // 動線のこだわり
  commitment_flow_lines: {
    value: string;
    unit: string;
  };
}

export interface History {
  id: number; // 履歴ID
  title: string; // タイトル
  favoriteCount: number; // お気に入り回数
  companyId: number; //  会社ID
  companyName: string; // 会社名
  userId: number; // 担当者ID
  userName: string; // 担当者名
  customerName: string; // 顧客名
  createdAt: string; // 登録日
  createdById: number; // 登録者ID
  updatedAt: string; // 修正日
  updatedById: number; // 更新者ID
  conditions: Conditions; // 顧客の希望条件
}

export interface HistoryChildren {
  id: number; // 固有ID
  historyParentId: number; // 親ID
  patternName: string; // 間取りパターン詳細情報
  floorplanData: FloorPlanData; // 間取り図JSONデータ
  attributes?: string[]; // 属性
  isPatternFavorite: boolean; // お気に入り
  tag: string; // タグ（,区切り）
  isDownloaded: boolean; // ダウンロード済み
  pdfPath: string; // PDFパス
  constructionName: string; // 工事名称
  scale: string; // 縮尺
  drawingFormat: string; // 図面形式
  createdAt: string; // 登録日
  createdById: number; // 登録者ID
}
