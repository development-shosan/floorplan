"use client";

import React from "react";
import Header from "./components/HeaderForm";

const Home: React.FC = () => {
  return (
    <div className="w-full max-w-[1400px] rounded-lg bg-gray-50 shadow-sm px-5 py-6 border-2 border-dashed border-gray-300">
      <Header />
    </div>
  );
};

export default Home;
