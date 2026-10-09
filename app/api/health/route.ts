import { NextResponse } from "next/server";
import { checkDatabaseConnection } from "@/packages/core/db";

export async function GET() {
  const dbStatus = await checkDatabaseConnection();
  return NextResponse.json(
    {
      status: "healthy",
      app: "SK Workspace 2",
      version: "2.0.0",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: { database: dbStatus, pwa: "active" },
    },
    { status: 200 }
  );
}
