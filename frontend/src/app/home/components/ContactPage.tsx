"use client";

export default function ContactPage() {
  const handleClick = () => {
    window.open("https://www.sho-san.co.jp/contact/", "_blank");
  };

  return (
    <div
      className="w-full flex justify-center items-start bg-white pt-24"
      style={{ minHeight: "calc(100vh - 20vh)" }}
    >
      <div className="max-w-2xl w-full bg-gray-50 rounded-lg shadow-sm p-12 mx-4 flex flex-col justify-between">
        <div className="text-center py-16 px-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            お問い合わせ
          </h1>
          <p className="text-gray-600 leading-relaxed text-lg">
            ご質問やご相談がございましたら、お気軽にお問い合わせください。
            <br />
            専門スタッフが迅速に対応いたします。
          </p>
        </div>

        <div className="mt-8">
          <button
            type="button"
            onClick={handleClick}
            className="w-full bg-gray-900 text-white rounded-md py-4 font-medium hover:bg-gray-800 transition"
          >
            お問い合わせ
          </button>
        </div>
      </div>
    </div>
  );
}
