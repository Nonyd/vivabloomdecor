import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { ok: false, message: "Upload API — Phase B." },
    { status: 501 }
  );
}
