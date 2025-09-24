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
