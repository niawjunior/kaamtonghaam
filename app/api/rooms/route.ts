import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Generate a random password
  const generatedId = Math.random().toString(36).substring(2, 8);

  // Insert the room into the database
  const { data, error } = await supabase
    .from("rooms")
    .insert({
      id: generatedId,
      host: body.host,
      status: "waiting",
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");

    // Validate the room by its ID
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Invalid room ID" }, { status: 400 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
