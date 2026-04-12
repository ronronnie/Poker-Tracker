import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as XLSX from "xlsx";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.user_id, userId))
    .orderBy(desc(sessions.date));

  const GAME_LABEL: Record<string, string> = {
    cash: "Cash Game",
    tournament: "Tournament",
    sit_and_go: "Sit & Go",
  };

  const data = rows.map((r) => {
    const buyIn   = parseFloat(r.buy_in);
    const cashOut = parseFloat(r.cash_out);
    const pl      = cashOut - buyIn;
    const hours   = r.duration_minutes != null ? Math.floor(r.duration_minutes / 60) : "";
    const mins    = r.duration_minutes != null ? r.duration_minutes % 60 : "";

    return {
      Date: new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(r.date)),
      Venue: r.venue ?? "",
      "Game Type": GAME_LABEL[r.game_type] ?? r.game_type,
      Stakes: r.stakes ?? "",
      "Buy-in (₹)": buyIn,
      "Cash-out (₹)": cashOut,
      "P&L (₹)": pl,
      "Hours": hours,
      "Minutes": mins,
      Notes: r.notes ?? "",
    };
  });

  // Build workbook
  const ws = XLSX.utils.json_to_sheet(data);

  // Column widths
  ws["!cols"] = [
    { wch: 14 }, // Date
    { wch: 20 }, // Venue
    { wch: 14 }, // Game Type
    { wch: 10 }, // Stakes
    { wch: 12 }, // Buy-in
    { wch: 12 }, // Cash-out
    { wch: 12 }, // P&L
    { wch: 8  }, // Hours
    { wch: 8  }, // Minutes
    { wch: 30 }, // Notes
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sessions");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const today = new Date().toISOString().split("T")[0];

  return new NextResponse(buf, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="outs-sessions-${today}.xlsx"`,
    },
  });
}
