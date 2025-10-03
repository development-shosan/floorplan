export interface History {
  id: number;
  title: string;
  favoriteCount: number;
  companyId: number;
  companyName: string;
  userId: number;
  userName: string;
  customerName: string;
  createdAt: string;
}

export const dummyHistories: History[] = Array.from({ length: 25 }, (_, i) => {
  const hour = (9 + (i % 8)).toString().padStart(2, "0");
  return {
    id: 12324 - i,
    title: `タイトル ${i + 1}`,
    favoriteCount: Math.floor(Math.random() * 4),
    companyId: (i % 3) + 1,
    companyName: `会社 ${(i % 3) + 1}`,
    userId: (i % 5) + 1,
    userName: `担当者 ${(i % 5) + 1}`,
    customerName: `顧客 ${i + 1}`,
    createdAt: `2025-01-${((i % 30) + 1)
      .toString()
      .padStart(2, "0")} ${hour}:00`,
  };
});

export interface PlanDetail {
  name: string;
  ldkArea: string;
  mainRoom: string;
  childRoom: string;
  landArea: string;
  tag: string[];
  historyId: number;
  customerName: string;
  // 👇 HistoryDetail
  detailData: {
    projectTitle: string;
    ldkArea: string;
    mainRoomSize: string;
    childRoomSize: string;
    familyMembers: string;
    buildingArea: string;
    floors: string;
    roomCount: string;
    toiletCount: string;
    commitment: string;
  };
  // 👇 HistoryPreview
  previewData: {
    title: string;
    drawingNumber: string;
    scale: string;
    floorsRooms: string;
  };
}

export const createDummyPlanDetails = (history: History): PlanDetail[] => [
  {
    historyId: history.id,
    customerName: history.customerName,
    name: "パターンA - スタンダード",
    ldkArea: "18帖",
    mainRoom: "8帖",
    childRoom: "6帖×2",
    landArea: "29.5坪",
    tag: ["南向きLDK", "独立キッチン", "和室あり"],
    detailData: {
      projectTitle: `${history.customerName}様邸間取りプランA`,
      ldkArea: "18帖",
      mainRoomSize: "8帖",
      childRoomSize: "6帖×2",
      familyMembers: "4人",
      buildingArea: "30坪",
      floors: "2階建て",
      roomCount: "4室",
      toiletCount: "2個",
      commitment:
        "玄関からキッチンまでの動線を短く、洗濯物を干すベランダへの動線を重視",
    },
    previewData: {
      title: `${history.customerName}様邸 新築工事 A`,
      drawingNumber: "平面図A",
      scale: "S=1/100",
      floorsRooms: "2階建て 4LDK",
    },
  },
  {
    historyId: history.id,
    customerName: history.customerName,
    name: "パターンB - ゆったり主寝室",
    ldkArea: "17帖",
    mainRoom: "10帖",
    childRoom: "5帖×2",
    landArea: "30.3坪",
    tag: ["主寝室WIC付", "パントリー", "2階洗面"],
    detailData: {
      projectTitle: `${history.customerName}様邸間取りプランB`,
      ldkArea: "17帖",
      mainRoomSize: "10帖",
      childRoomSize: "5帖×2",
      familyMembers: "3人",
      buildingArea: "32坪",
      floors: "2階建て",
      roomCount: "3室",
      toiletCount: "1個",
      commitment: "大型のウォークインクローゼットとパントリーを優先",
    },
    previewData: {
      title: `${history.customerName}様邸 新築工事 B`,
      drawingNumber: "平面図B",
      scale: "S=1/100",
      floorsRooms: "2階建て 3LDK",
    },
  },
  {
    historyId: history.id,
    customerName: history.customerName,
    name: "パターンC - 広々LDK",
    ldkArea: "19帖",
    mainRoom: "6帖",
    childRoom: "6帖×2",
    landArea: "29.8坪",
    tag: ["南側LDK", "アイランドキッチン", "スタディコーナー"],
    detailData: {
      projectTitle: `${history.customerName}様邸間取りプランC`,
      ldkArea: "19帖",
      mainRoomSize: "6帖",
      childRoomSize: "6帖×2",
      familyMembers: "5人",
      buildingArea: "35坪",
      floors: "3階建て",
      roomCount: "5室",
      toiletCount: "3個",
      commitment:
        "家族全員が使える広々としたアイランドキッチンとスタディコーナーを配置",
    },
    previewData: {
      title: `${history.customerName}様邸 新築工事 C`,
      drawingNumber: "平面図C",
      scale: "S=1/100",
      floorsRooms: "3階建て 5LDK",
    },
  },
];
