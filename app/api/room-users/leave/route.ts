import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, userId } = body;

    // Delete the user from the room_users table
    const { error } = await supabase
      .from("room_users")
      .delete()
      .eq("room_id", roomId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error leaving room:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Successfully left the room" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
