import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, userId } = body;

    // Check if the user is the host of the room
    const { data: room, error: fetchError } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .eq("host", userId)
      .single();

    if (fetchError || !room) {
      return NextResponse.json(
        { error: "You are not authorized to start the game." },
        { status: 403 }
      );
    }

    // Update the room's status to "in_progress"
    const { error: updateError } = await supabase
      .from("rooms")
      .update({ status: "in_progress" })
      .eq("id", roomId);

    if (updateError) {
      console.error("Error starting game:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Game started successfully!" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
