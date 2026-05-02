import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { ok: false, message: "Quote API — Phase B." },
    { status: 501 }
  );
}
