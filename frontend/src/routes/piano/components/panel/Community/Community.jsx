import { useEffect, useState } from "react";
import "./Community.css";

import CommunityHome from "./CommunityHome";
import CommunityTop from "./CommunityTop10";

export default function Community() {

    const [currentTab, setCurrentTab] = useState("home");


    const communityTabs = [
        { id: "home", label: "🏠 HOME" },
        { id: "top", label: "🏆 TOP 10" }
    ];


    return (
        <div id="community">
            <div id="community-buttons">
                {communityTabs.map(tab => (
                    <button key={tab.id}
                        className={`community-tab ${currentTab === tab.id ? "active-community-tab" : ""}`}
                        onClick={() => setCurrentTab(tab.id)}>
                        {tab.label}
                    </button>
                ))}
            </div>
            {
                currentTab === "home" && <CommunityHome />
            }

            {currentTab === "top" && <CommunityTop />}



        </div>
    );
}
