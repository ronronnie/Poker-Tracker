import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as XLSX from "xlsx";
import { db } from "@/lib/db";
import { handHistories } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { HandData } from "@/lib/hand-types";

const GAME_LABEL: Record<string, string> = {
  cash: "Cash Game",
  tournament: "Tournament",
  sit_and_go: "Sit & Go",
};

function streetsSummary(hand_data: HandData | null | undefined): string {
  if (!hand_data) return "Pre-flop";
  const streets: string[] = ["Pre-flop"];
  if (hand_data.flop) streets.push("Flop");
  if (hand_data.turn) streets.push("Turn");
  if (hand_data.river) streets.push("River");
  if (hand_data.showdown && hand_data.showdown.length > 0) streets.push("Showdown");
  return streets.join(" → ");
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(handHistories)
    .where(eq(handHistories.user_id, userId))
    .orderBy(desc(handHistories.date));

  const data = rows.map((r) => {
    const holeCards = (r.hero_hole_cards as string[] | null)?.join(" ") ?? "";
    const handData = r.hand_data as HandData | null;

    return {
      Date: new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(r.date)),
      "Game Type": GAME_LABEL[r.game_type] ?? r.game_type,
      Stakes: r.stakes ?? "",
      Position: r.hero_position ?? "",
      "Hole Cards": holeCards,
      Result: r.result ?? "",
      "Amount (₹)": r.result_amount != null ? parseFloat(r.result_amount) : "",
      "Pot Total (₹)": r.pot_total != null ? parseFloat(r.pot_total) : "",
      Streets: streetsSummary(handData),
      Notes: r.notes ?? "",
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);

  ws["!cols"] = [
    { wch: 14 }, // Date
    { wch: 14 }, // Game Type
    { wch: 10 }, // Stakes
    { wch: 10 }, // Position
    { wch: 12 }, // Hole Cards
    { wch: 10 }, // Result
    { wch: 12 }, // Amount
    { wch: 12 }, // Pot Total
    { wch: 35 }, // Streets
    { wch: 30 }, // Notes
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Hand History");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const today = new Date().toISOString().split("T")[0];

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="outs-hands-${today}.xlsx"`,
    },
  });
}
