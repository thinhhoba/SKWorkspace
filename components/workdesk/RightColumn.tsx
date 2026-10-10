"use client";
import FleetRadarWidget from "./FleetRadarWidget";
import ChatMiniWidget from "./ChatMiniWidget";
import ScratchpadWidget from "./ScratchpadWidget";
import OnlineStaffWidget from "./OnlineStaffWidget";

export default function RightColumn() {
  return (
    <div className="space-y-4">
      <FleetRadarWidget />
      <ChatMiniWidget />
      <ScratchpadWidget />
      <OnlineStaffWidget />
    </div>
  );
}
