import { NextResponse } from "next/server";
import { getCurrentWifi } from "@/lib/wifi";

export async function GET() {
  try {
    const wifi = await getCurrentWifi();
    return NextResponse.json(wifi);
  } catch {
    return NextResponse.json(
      { error: "Unable to read Wi-Fi status on this host" },
      { status: 500 }
    );
  }
}
