"use client";

import { useState } from "react";

export default function DashboardTabs({
  tabs,
}: {
  tabs: { label: string; content: React.ReactNode }[];
}) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div className="flex overflow-x-auto space-x-4 border-b mb-4">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`py-2 px-3 whitespace-nowrap text-sm font-medium ${
              index === activeTab
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-primary"
            }`}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{tabs[activeTab].content}</div>
    </div>
  );
}
