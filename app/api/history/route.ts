import { NextResponse } from "next/server";
import { getLogs, getStats } from "@/lib/storage";

export async function GET() {
  const logs = getLogs();
  const stats = getStats();

  return NextResponse.json({
    logs,
    stats,
  });
}
