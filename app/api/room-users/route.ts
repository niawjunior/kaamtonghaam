import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, userId, nickname } = body;

    // Step 1: Check if the room exists and if the game is in progress
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("id, status") // Select only necessary fields
      .eq("id", roomId)
      .single();

    if (roomError || !room) {
      console.error("Room does not exist:", roomError);
      return NextResponse.json(
        { error: "Room ID does not exist." },
        { status: 404 }
      );
    }

    if (room.status === "in_progress") {
      // Game is in progress, block the user from joining
      return NextResponse.json(
        { error: "Cannot join room. The game is already in progress." },
        { status: 403 }
      );
    }

    // Step 2: Check if the user already exists in the room
    const { data: existingUser, error: selectError } = await supabase
      .from("room_users")
      .select("*")
      .eq("room_id", roomId)
      .eq("user_id", userId)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      // PGRST116 means no rows found, so we ignore this specific error
      console.error("Error checking for existing user:", selectError);
      return NextResponse.json({ error: selectError.message }, { status: 500 });
    }

    if (existingUser) {
      // User exists, update the joined_at timestamp
      const { error: updateError } = await supabase
        .from("room_users")
        .update({ joined_at: new Date().toISOString(), nickname })
        .eq("room_id", roomId)
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error updating user join timestamp:", updateError);
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: "User re-joined room successfully." },
        { status: 200 }
      );
    }

    // Step 3: User does not exist, insert a new record
    const { data, error: insertError } = await supabase
      .from("room_users")
      .insert({
        room_id: roomId,
        user_id: userId,
        joined_at: new Date().toISOString(),
        nickname,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("Error inserting new user into room:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
