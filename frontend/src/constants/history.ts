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
