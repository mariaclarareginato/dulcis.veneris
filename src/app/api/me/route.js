
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session"; // ou ler cookie jwt

export async function GET(req) {
  const res = NextResponse.next();
  const session = await getSession(req, res); // se usar iron-session
  if (!session?.user) return NextResponse.json({ user: null });
  return NextResponse.json({ user: session.user });
}
