import { NextResponse } from "next/server";
import { isGoogleSheetsSyncEnabled } from "@/lib/config";
import { syncLeadsFromGoogleSheet } from "@/lib/sync-sheets";

export async function POST(request: Request) {
  if (!isGoogleSheetsSyncEnabled()) {
    return NextResponse.json(
      {
        success: false,
        message: "Google Sheets sync is disabled. Use POST /api/leads instead.",
      },
      { status: 403 }
    );
  }

  try {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get("authorization");
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    const result = await syncLeadsFromGoogleSheet();

    return NextResponse.json(result, {
      status: result.success ? 200 : 207,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to sync Google Sheet",
      },
      { status: 500 }
    );
  }
}
