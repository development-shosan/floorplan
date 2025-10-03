export interface Company {
  id: number; // 会社ID
  name: string; // 会社名
  nameKana: string; // 会社名（カナ）
  representative: string; // 代表者名
  email: string; // メール
  status: boolean; // 状態
  postalCode: string; // 郵便番号
  prefecture: string; // 都道府県
  city: string; // 市区町村
  streetAddress: string; // それ以降の住所
  createdAt: string; // 登録日
  updatedAt: string; // 編集日
  members: number; // メンバー数
}

export interface CompanyFormData {
  id?: number; // 会社ID
  name: string; // 会社名
  nameKana: string; // 会社名（カナ）
  representative: string; // 代表者名
  email: string; // メール
  postalCode: string; // 郵便番号
  prefecture: string; // 都道府県
  city: string; // 市区町村
  streetAddress: string; // それ以降の住所
  status: boolean; // 状態
}
