"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

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
          <Button
            key={index}
            variant={index === activeTab ? "glass" : "outline"}
            className={`py-2 px-3 whitespace-nowrap rounded-none cursor-pointer text-sm font-medium border-0 border-b-2 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 active:outline-none active:ring-0 ${
              index === activeTab
                ? "border-primary text-primary"
                : "border-b-0 text-muted-foreground hover:text-primary"
            }`}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      <div>{tabs[activeTab].content}</div>
    </div>
  );
}
