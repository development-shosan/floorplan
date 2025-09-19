export interface User {
  id: number; //ユーザーID
  name: string; //氏名
  email: string; //メール
  role: "MEMBER" | "COMPANY_ADMIN"; //権限
  companyId?: number; //会社ID
  companyName: string; //会社名
  department: string; //部署
  phoneNumber: string; //電話番号
  createdAt: string; // 登録日
  status: boolean; //状態
}

export interface UserFormData {
  id?: number; //ユーザーID
  name: string; // 氏名
  companyId?: number; // 会社ID
  companyName: string; //会社名
  email: string; // メール
  password?: string; // パスワード
  role: "MEMBER" | "COMPANY_ADMIN"; // 権限
  department: string; // 部署
  phoneNumber: string; // 電話番号
  status: boolean; //状態
}

export const dummyUsers: User[] = [
  {
    id: 1,
    name: "氏名1",
    email: "user1@example.com",
    role: "MEMBER",
    companyId: 1,
    companyName: "丸亀製麵",
    department: "営業一課",
    phoneNumber: "03-4567-8901",
    createdAt: "2023/09/10",
    status: true,
  },
  {
    id: 2,
    name: "氏名2",
    email: "user2@example.com",
    role: "COMPANY_ADMIN",
    companyId: 1,
    companyName: "丸亀製麵",
    department: "営業二課",
    phoneNumber: "03-4567-8902",
    createdAt: "2023/09/11",
    status: true,
  },
  {
    id: 3,
    name: "氏名3",
    email: "user3@example.com",
    role: "MEMBER",
    companyId: 2,
    companyName: "サントリー",
    department: "企画部",
    phoneNumber: "03-4567-8903",
    createdAt: "2023/09/12",
    status: false,
  },
  {
    id: 4,
    name: "氏名4",
    email: "user4@example.com",
    role: "MEMBER",
    companyId: 2,
    companyName: "サントリー",
    department: "開発部",
    phoneNumber: "03-4567-8904",
    createdAt: "2023/09/13",
    status: true,
  },
  {
    id: 5,
    name: "氏名5",
    email: "user5@example.com",
    role: "COMPANY_ADMIN",
    companyId: 3,
    companyName: "任天堂",
    department: "人事部",
    phoneNumber: "03-4567-8905",
    createdAt: "2023/09/14",
    status: true,
  },
  {
    id: 6,
    name: "氏名6",
    email: "user6@example.com",
    role: "MEMBER",
    companyId: 3,
    companyName: "任天堂",
    department: "営業一課",
    phoneNumber: "03-4567-8906",
    createdAt: "2023/09/15",
    status: false,
  },
  {
    id: 7,
    name: "氏名7",
    email: "user7@example.com",
    role: "MEMBER",
    companyId: 4,
    companyName: "ソニー",
    department: "マーケティング部",
    phoneNumber: "03-4567-8907",
    createdAt: "2023/09/16",
    status: true,
  },
  {
    id: 8,
    name: "氏名8",
    email: "user8@example.com",
    role: "COMPANY_ADMIN",
    companyId: 4,
    companyName: "ソニー",
    department: "営業部",
    phoneNumber: "03-4567-8908",
    createdAt: "2023/09/17",
    status: true,
  },
  {
    id: 9,
    name: "氏名9",
    email: "user9@example.com",
    role: "MEMBER",
    companyId: 5,
    companyName: "パナソニック",
    department: "企画部",
    phoneNumber: "03-4567-8909",
    createdAt: "2023/09/18",
    status: false,
  },
  {
    id: 10,
    name: "氏名10",
    email: "user10@example.com",
    role: "MEMBER",
    companyId: 5,
    companyName: "パナソニック",
    department: "営業部",
    phoneNumber: "03-4567-8910",
    createdAt: "2023/09/19",
    status: true,
  },
  {
    id: 11,
    name: "氏名11",
    email: "user11@example.com",
    role: "COMPANY_ADMIN",
    companyId: 1,
    companyName: "丸亀製麵",
    department: "開発部",
    phoneNumber: "03-4567-8911",
    createdAt: "2023/09/20",
    status: true,
  },
  {
    id: 12,
    name: "氏名12",
    email: "user12@example.com",
    role: "MEMBER",
    companyId: 2,
    companyName: "サントリー",
    department: "人事部",
    phoneNumber: "03-4567-8912",
    createdAt: "2023/09/21",
    status: false,
  },
  {
    id: 13,
    name: "氏名13",
    email: "user13@example.com",
    role: "MEMBER",
    companyId: 3,
    companyName: "任天堂",
    department: "企画部",
    phoneNumber: "03-4567-8913",
    createdAt: "2023/09/22",
    status: true,
  },
  {
    id: 14,
    name: "氏名14",
    email: "user14@example.com",
    role: "COMPANY_ADMIN",
    companyId: 4,
    companyName: "ソニー",
    department: "開発部",
    phoneNumber: "03-4567-8914",
    createdAt: "2023/09/23",
    status: true,
  },
  {
    id: 15,
    name: "氏名15",
    email: "user15@example.com",
    role: "MEMBER",
    companyId: 5,
    companyName: "パナソニック",
    department: "営業部",
    phoneNumber: "03-4567-8915",
    createdAt: "2023/09/24",
    status: true,
  },
];
