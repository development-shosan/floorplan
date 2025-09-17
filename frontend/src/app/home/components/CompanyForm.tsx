"use client";

import { Company, NewCompany } from "@/constants/company";
import React from "react";

interface CompanyFormPageProps {
  formCompany: NewCompany;
  setFormCompany: React.Dispatch<React.SetStateAction<NewCompany>>;
  editingCompany: Company | null;
  onCancel: () => void;
  onSubmit: () => void;
}

const CompanyFormPage: React.FC<CompanyFormPageProps> = ({
  formCompany,
  setFormCompany,
  editingCompany,
  onCancel,
  onSubmit,
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onCancel} className="text-gray-500 mb-4 hover:underline">
        {"← 会社一覧に戻る"}
      </button>

      <h1 className="text-2xl font-semibold mb-2">
        {editingCompany ? "会社情報編集" : "新規会社登録"}
      </h1>
      {editingCompany && (
        <p className="text-gray-500 mb-6">
          {`${editingCompany.name} (ID: ${String(editingCompany.id).padStart(
            3,
            "0"
          )}) の情報を編集します。`}
        </p>
      )}

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <section className="space-y-4">
          <h2 className="text-lg font-medium border-b border-gray-300 pb-2">
            基本情報
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">会社名</label>
              <input
                type="text"
                value={formCompany.name}
                onChange={(e) =>
                  setFormCompany({ ...formCompany, name: e.target.value })
                }
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                会社名（カナ）
              </label>
              <input
                type="text"
                value={formCompany.nameKana}
                onChange={(e) =>
                  setFormCompany({ ...formCompany, nameKana: e.target.value })
                }
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                ステータス
              </label>
              <select
                value={formCompany.status ? "true" : "false"}
                onChange={(e) =>
                  setFormCompany({
                    ...formCompany,
                    status: e.target.value === "true",
                  })
                }
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="true">有効</option>
                <option value="false">無効</option>
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium border-b border-gray-300 pb-2">
            所在地情報
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* <div>
      <label className="block text-sm font-medium mb-1">郵便番号</label>
      <input
        type="text"
        placeholder="100-0001"
        value={formCompany.postalCode || ""}
        onChange={(e) =>
          setFormCompany({ ...formCompany, postalCode: e.target.value })
        }
        className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>


    <div>
      <label className="block text-sm font-medium mb-1">都道府県</label>
      <select
        value={formCompany.prefecture || ""}
        onChange={(e) =>
          setFormCompany({ ...formCompany, prefecture: e.target.value })
        }
        className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="">選択してください</option>
        <option value="東京都">東京都</option>
        <option value="神奈川県">神奈川県</option>
        <option value="千葉県">千葉県</option>
        <option value="埼玉県">埼玉県</option>
      </select>
    </div>


    <div>
      <label className="block text-sm font-medium mb-1">市区町村</label>
      <input
        type="text"
        placeholder="千代田区丸の内"
        value={formCompany.city || ""}
        onChange={(e) =>
          setFormCompany({ ...formCompany, city: e.target.value })
        }
        className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div> */}
          </div>

          {/* 番地・建物名 */}
          <div>
            <label className="block text-sm font-medium mb-1">
              番地・建物名
            </label>
            <input
              type="text"
              placeholder="1-1-1 ABCビル 5階"
              value={formCompany.address || ""}
              onChange={(e) =>
                setFormCompany({ ...formCompany, address: e.target.value })
              }
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium border-b border-gray-300 pb-2">
            担当者情報
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">代表者名</label>
              <input
                type="text"
                value={formCompany.representative}
                onChange={(e) =>
                  setFormCompany({
                    ...formCompany,
                    representative: e.target.value,
                  })
                }
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                連絡先メールアドレス
              </label>
              <input
                type="email"
                value={formCompany.email}
                onChange={(e) =>
                  setFormCompany({ ...formCompany, email: e.target.value })
                }
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded border border-gray-300 hover:bg-gray-100"
          >
            キャンセル
          </button>
          <button
            onClick={onSubmit}
            className="px-5 py-2 rounded bg-black text-white hover:bg-gray-800"
          >
            {editingCompany ? "変更を保存" : "登録する"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyFormPage;
