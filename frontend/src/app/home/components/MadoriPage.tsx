"use client";

import React, { useState } from "react";
import {
  PencilSquareIcon,
  UserIcon,
  BuildingOffice2Icon,
  ArrowsRightLeftIcon,
  ArrowsUpDownIcon,
  Squares2X2Icon,
  HomeModernIcon,
  WrenchScrewdriverIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import {
  AdjustmentsHorizontalIcon,
  ListBulletIcon,
} from "@heroicons/react/16/solid";
import { useUser } from "@/hooks/userContext";
import { HomeIcon } from "@heroicons/react/20/solid";

const Header: React.FC = () => {
  const { user } = useUser();

  return (
    <header className="bg-white">
      <div className="max-w-6xl mx-auto px-8 h-16 flex justify-between items-center">
        <div className="flex items-center text-gray-700">
          <HomeIcon className="w-12 h-12 mr-3" />
          <div className="text-gray-700">
            <h1 className="text-xl font-semibold">AI間取り生成システム</h1>
            <span className="mt-1 block text-sm text-gray-500">
              営業支援ツール - その場で間取り提案
            </span>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">{`営業担当：${user?.name}`}</span>
        </div>
      </div>
    </header>
  );
};

interface FormState {
  title: string;
  customerName: string;
  familyComposition: string;
  floors: string;
  entrance: string;
  orientation: string;
  ldkSize: string;
  rooms: string;
  toiletCount: string;
  commitment: string;
}

interface RequestBody {
  title: string;
  clientName: string;
  layout_conditions: {
    family_composition: { value: string; unit: "people" };
    number_of_floors: { value: string };
    frontage: { value: string; unit: "pit" };
    depth: { value: string; unit: "pit" };
    desired_LDK_area: { value: string; unit: "tatami" };
    number_of_rooms: { value: string; unit: "rooms" };
    number_of_toilets: { value: string; unit: "units" };
    commitment_flow_lines: { value: string; unit: "text" };
  };
}

interface UnitInputFieldProps {
  name: keyof FormState;
  label: string;
  icon: React.ElementType;
  value: string;
  unit: string;
  placeholder?: string;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  inputClass: string;
}

const UnitInputField: React.FC<UnitInputFieldProps> = ({
  name,
  label,
  icon: Icon,
  value,
  unit,
  placeholder,
  setForm,
  inputClass,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/[^\d.]/g, "");
    setForm((prev) => ({ ...prev, [name]: numericValue }));
  };

  return (
    <div>
      <label className="text-sm font-semibold text-gray-700 flex items-center mb-1">
        <Icon className="w-4 h-4 mr-1 text-gray-500" />
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`${inputClass} pr-8`}
          inputMode="decimal"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
};

const MadoriPage: React.FC = () => {
  const initialForm: FormState = {
    title: "",
    customerName: "",
    familyComposition: "",
    floors: "1",
    entrance: "",
    orientation: "",
    ldkSize: "",
    rooms: "1",
    toiletCount: "1",
    commitment: "",
  };

  const [form, setForm] = useState<FormState>(initialForm);

  const pToMm = (pStr: string): string => {
    const pVal = parseFloat(pStr);
    if (isNaN(pVal) || pVal < 0) return "0";
    const mmVal = pVal * 910;
    return Math.round(mmVal).toLocaleString("ja-JP");
  };

  const createRequestBody = (data: FormState): RequestBody => {
    return {
      title: data.title,
      clientName: data.customerName,
      layout_conditions: {
        family_composition: {
          value: data.familyComposition,
          unit: "people",
        },
        number_of_floors: { value: data.floors },
        frontage: { value: data.entrance, unit: "pit" },
        depth: { value: data.orientation, unit: "pit" },
        desired_LDK_area: {
          value: data.ldkSize,
          unit: "tatami",
        },
        number_of_rooms: { value: data.rooms, unit: "rooms" },
        number_of_toilets: { value: data.toiletCount, unit: "units" },
        commitment_flow_lines: { value: data.commitment, unit: "text" },
      },
    };
  };

  const handleGenerateClick = () => {
    const body = createRequestBody(form);
    console.log("間取り生成リクエストボディ:", JSON.stringify(body, null, 2));
  };

  const inputClass =
    "w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400";

  const handleSelectChange = (name: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const ConfirmationItem: React.FC<{
    label: string;
    value: string;
    unit?: string;
    large?: boolean;
  }> = ({ label, value, unit, large }) => (
    <div className="flex justify-between border-b border-gray-200 py-3">
      <p className="text-sm font-medium text-gray-600 w-1/4 min-w-[100px] text-left">
        {label}
      </p>
      <p
        className={`text-sm text-gray-900 w-3/4 text-right ${
          large ? "whitespace-pre-wrap" : ""
        }`}
      >
        {value}
        {unit && !large && <span className="ml-1">{unit}</span>}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-8 py-8">
        <section className="bg-white p-6 shadow-md rounded-lg mb-12">
          <h2 className="text-xl font-bold border-gray-700 mb-6 flex items-center">
            <AdjustmentsHorizontalIcon className="w-6 h-6 mr-2" />
            ご要望ヒアリング
          </h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <UnitInputField
              name="title"
              label="タイトル"
              icon={PencilSquareIcon}
              value={form.title}
              placeholder="例: 佐藤邸 間取りプラン"
              unit=""
              setForm={setForm}
              inputClass={inputClass}
            />
            <UnitInputField
              name="customerName"
              label="顧客名"
              icon={UserIcon}
              value={form.customerName}
              placeholder="例: 佐藤 太郎"
              unit=""
              setForm={setForm}
              inputClass={inputClass}
            />
            <UnitInputField
              name="familyComposition"
              label="ご家族構成"
              icon={UsersIcon}
              value={form.familyComposition}
              unit="人"
              placeholder="例: 4"
              setForm={setForm}
              inputClass={inputClass}
            />
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center mb-1">
                <BuildingOffice2Icon className="w-4 h-4 mr-1 text-gray-500" />
                階数
              </label>

              <select
                name="floors"
                value={form.floors}
                onChange={(e) => handleSelectChange("floors", e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="1">1階建て</option>
                <option value="2">2階建て</option>
              </select>
            </div>

            <div>
              <UnitInputField
                name="entrance"
                label="間口（通り芯間は1.82倍）"
                icon={ArrowsRightLeftIcon}
                value={form.entrance}
                unit="p"
                placeholder="例: 20"
                setForm={setForm}
                inputClass={inputClass}
              />
              <p className="mt-1 text-xs text-gray-500 text-right pr-1">
                （{pToMm(form.entrance)} mm）
              </p>
            </div>

            <div>
              <UnitInputField
                name="orientation"
                label="奥行き"
                icon={ArrowsUpDownIcon}
                value={form.orientation}
                unit="p"
                placeholder="例: 12"
                setForm={setForm}
                inputClass={inputClass}
              />
              <p className="mt-1 text-xs text-gray-500 text-right pr-1">
                （{pToMm(form.orientation)} mm）
              </p>
            </div>

            <UnitInputField
              name="ldkSize"
              label="LDK希望面積"
              icon={Squares2X2Icon}
              value={form.ldkSize}
              unit="帖"
              placeholder="例: 18"
              setForm={setForm}
              inputClass={inputClass}
            />
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center mb-1">
                <HomeModernIcon className="w-4 h-4 mr-1 text-gray-500" />
                部屋数
              </label>
              <select
                name="rooms"
                value={form.rooms}
                onChange={(e) => handleSelectChange("rooms", e.target.value)}
                className={`${inputClass} bg-white`}
              >
                <option value="1">1 室</option>
                <option value="2">2 室</option>
                <option value="3">3 室</option>
                <option value="4">4 室</option>
                <option value="5">5 室</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center mb-1">
                <WrenchScrewdriverIcon className="w-4 h-4 mr-1 text-gray-500" />
                トイレ
              </label>
              <select
                name="toiletCount"
                value={form.toiletCount}
                onChange={(e) =>
                  handleSelectChange("toiletCount", e.target.value)
                }
                className={`${inputClass} bg-white`}
              >
                <option value="1">1 個</option>
                <option value="2">2 個</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                動線のこだわり
              </label>
              <textarea
                name="commitment"
                value={form.commitment}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, commitment: e.target.value }))
                }
                rows={3}
                placeholder="例: 玄関からキッチンまでの動線を短く"
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
          <button
            className="mt-8 w-full bg-gray-800 text-white font-bold py-3 rounded-md hover:bg-gray-700 transition duration-150"
            onClick={handleGenerateClick}
          >
            間取り生成開始
          </button>
        </section>

        <section className="bg-white p-6 shadow-md rounded-lg">
          <h2 className="text-xl font-bold border-gray-700 mb-6 flex items-center">
            <ListBulletIcon className="w-6 h-6 mr-2" />
            入力内容確認
          </h2>
          <ConfirmationItem label="プロジェクトタイトル:" value={form.title} />
          <ConfirmationItem label="顧客名:" value={form.customerName} />
          <ConfirmationItem
            label="ご家族構成:"
            value={form.familyComposition}
            unit="人"
          />
          <ConfirmationItem label="階数:" value={form.floors} />
          <ConfirmationItem label="間口:" value={form.entrance} unit="p" />
          <ConfirmationItem label="奥行き:" value={form.orientation} unit="p" />
          <ConfirmationItem
            label="LDK希望面積:"
            value={form.ldkSize}
            unit="帖"
          />
          <ConfirmationItem label="居室数:" value={form.rooms} />
          <ConfirmationItem label="トイレ:" value={form.toiletCount} />
          <ConfirmationItem
            label="動線のこだわり:"
            value={form.commitment}
            large={true}
          />
        </section>
      </main>
    </div>
  );
};

export default MadoriPage;
