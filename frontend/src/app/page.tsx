import { redirect } from "next/navigation";

// 初期画面
export default function HomePage() {
  redirect("/login");
  return <></>;
}
