"use client";
import * as React from "react";
import LeftColumn from "./LeftColumn";
import CenterColumn from "./CenterColumn";
import RightColumn from "./RightColumn";
import type { FeedStreamItem, FeedPost } from "@/packages/modules/feed/types";
import type { WorkdeskTask } from "@/packages/modules/tasks/types";

interface WorkdeskShellProps {
  streamItems: FeedStreamItem[];
  tasks?: WorkdeskTask[];
  revenue: number;
  pendingPickCount: number;
  fleetTemp: number;
  bankBalance: number;
  loadingStream: boolean;
  onPostCreated: (post: FeedPost) => void;
  onRefresh: () => void;
}

export default function WorkdeskShell({ streamItems, tasks, revenue, pendingPickCount, fleetTemp, bankBalance, loadingStream, onPostCreated, onRefresh }: WorkdeskShellProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Center first on mobile (order-1), left order-2, right order-3. On xl: left order-1, center order-2, right order-3 */}
      <div className="order-1 xl:order-2 xl:col-span-6">
        <CenterColumn streamItems={streamItems} loading={loadingStream} onPostCreated={onPostCreated} onRefresh={onRefresh} />
      </div>
      <div className="order-2 xl:order-1 xl:col-span-3">
        <LeftColumn revenue={revenue} pendingPickCount={pendingPickCount} fleetTemp={fleetTemp} bankBalance={bankBalance} tasks={tasks} />
      </div>
      <div className="order-3 xl:col-span-3">
        <RightColumn />
      </div>
    </div>
  );
}
