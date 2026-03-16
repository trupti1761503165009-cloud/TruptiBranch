import React, { useState } from "react";
interface ISiteCategoryProps {
    tabData: any[];
    onCategoryChange: (siteCategoryId: any) => void;
    defaultCategoryId?: any;
}

const SiteCategoryTabs: React.FC<ISiteCategoryProps> = ({ tabData, onCategoryChange, defaultCategoryId }) => {

    const [tabs, setTabs] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<number | "">("");

    React.useEffect(() => {
        setTabs(tabData);
        setActiveTab(defaultCategoryId);
        // onCategoryChange(defaultCategoryId);
    }, [tabData, defaultCategoryId]);

    const handleChange = (id: any) => {
        setActiveTab(id);
        onCategoryChange(id);
    };

    return (
        <div className="tab-menu" style={{ zIndex: "1", position: "relative" }}>
            {tabs.map(tab => (
                <div
                    key={tab.Id || "no-category"}
                    className={`tab-item ${activeTab === tab.Id ? "active" : ""}`}
                    onClick={() => handleChange(tab.Id)}
                >
                    {tab.Title}
                    {tab.Count !== undefined && ` (${tab.Count})`}
                </div>
            ))}
        </div>
    );
};

export default SiteCategoryTabs;
